import express from 'express';
import { runQuery, getRow, getAllRows } from '../database/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { generateQuestion, evaluateAnswer } from '../ai.js';

const router = express.Router();

/**
 * POST /api/question - Generate next question (Protected)
 */
router.post('/question', verifyToken, async (req, res) => {
    try {
        const { projectId } = req.body;
        const project = await getRow('SELECT * FROM projects WHERE id = ? AND user_id = ?', [projectId, req.user.id]);
        if (!project) return res.status(404).json({ error: 'Progetto non trovato' });

        // Retrieve nodes & edges & answers
        const nodes = await getAllRows('SELECT * FROM nodes WHERE project_id = ?', [projectId]);
        const edges = await getAllRows('SELECT * FROM edges WHERE project_id = ?', [projectId]);
        const completedNodes = nodes.filter(n => n.is_completed === 1).map(n => n.id);
        const completedEdges = edges.filter(e => e.is_completed === 1).map(e => e.id);

        // Check if there is an active question in progress
        const activeQ = await getRow('SELECT question_json FROM active_questions WHERE project_id = ?', [projectId]);
        if (activeQ && activeQ.question_json) {
            return res.json(JSON.parse(activeQ.question_json));
        }

        // Find critical connection (edge)
        const pendingEdge = edges.find(edge => {
            const edgeKey = edge.id; // from_to_to
            const reverseKey = `${edge.to_node}_to_${edge.from_node}`;
            const bothNodesCompleted = completedNodes.includes(edge.from_node) && completedNodes.includes(edge.to_node);
            const edgeNotCompleted = !completedEdges.includes(edgeKey) && !completedEdges.includes(reverseKey);
            return bothNodesCompleted && edgeNotCompleted;
        });

        if (pendingEdge) {
            const fromNode = nodes.find(n => n.id === pendingEdge.from_node);
            const toNode = nodes.find(n => n.id === pendingEdge.to_node);
            const isPlaneJump = pendingEdge.type === 'inter';

            let questionText = `Ora che hai ricostruito i concetti di "${fromNode.label}" e "${toNode.label}", qual è il collegamento critico che li unisce? In che modo si influenzano a vicenda?`;
            if (isPlaneJump) {
                questionText = `Blobb rileva un collegamento trasversale! In che modo il concetto di "${fromNode.label}" (dal capitolo precedente) si connette a "${toNode.label}"?`;
            }

            const totalItems = nodes.length + edges.length;
            const progress = totalItems > 0 ? Math.round(((completedNodes.length + completedEdges.length) / totalItems) * 100) : 0;

            const activeQuestion = {
                completed: false,
                type: 'edge',
                from: pendingEdge.from_node,
                to: pendingEdge.to_node,
                edgeKey: pendingEdge.id,
                nodeLabel: `Relazione: ${fromNode.label} ↔ ${toNode.label}`,
                nodeType: 'edge',
                isPlaneJump,
                introduction: isPlaneJump 
                    ? "✨ Attenzione! Rilevato un SALTO DI PIANO tra macro-argomenti!" 
                    : "🔗 Trovato un collegamento logico critico nella mappa!",
                question: questionText,
                attempts: 0,
                previousAnswers: [],
                progress,
            };

            await runQuery(
                'INSERT INTO active_questions (project_id, question_json) VALUES (?, ?) ON CONFLICT(project_id) DO UPDATE SET question_json=excluded.question_json',
                [projectId, JSON.stringify(activeQuestion)]
            );

            return res.json(activeQuestion);
        }

        // Find next uncompleted node
        const nextNode = nodes.find(n => n.is_completed === 0);
        if (!nextNode) {
            return res.json({ completed: true, message: 'Hai completato tutti i nodi e le relazioni! La tua mappa è completa.' });
        }

        const previousNodes = nodes.filter(n => n.is_completed === 1).map(n => ({
            id: n.id,
            label: n.label,
            type: n.type,
            description: n.description
        }));
        const macroTopic = nextNode.macro_topic;

        // Generate via AI
        const formatNextNode = {
            id: nextNode.id,
            label: nextNode.label,
            type: nextNode.type,
            description: nextNode.description,
            macroTopic: nextNode.macro_topic
        };
        const questionData = await generateQuestion(formatNextNode, previousNodes, macroTopic);

        const totalItems = nodes.length + edges.length;
        const progress = totalItems > 0 ? Math.round(((completedNodes.length + completedEdges.length) / totalItems) * 100) : 0;

        const activeQuestion = {
            completed: false,
            type: 'node',
            nodeId: nextNode.id,
            nodeLabel: nextNode.label,
            nodeType: nextNode.type,
            macroTopic,
            ...questionData,
            attempts: 0,
            previousAnswers: [],
            progress,
            currentIndex: completedNodes.length,
            totalNodes: nodes.length,
        };

        await runQuery(
            'INSERT INTO active_questions (project_id, question_json) VALUES (?, ?) ON CONFLICT(project_id) DO UPDATE SET question_json=excluded.question_json',
            [projectId, JSON.stringify(activeQuestion)]
        );

        res.json(activeQuestion);
    } catch (err) {
        console.error('Question error:', err);
        res.status(500).json({ error: 'Errore nella generazione della domanda', details: err.message });
    }
});

/**
 * POST /api/evaluate - Evaluate student's answer (Protected)
 */
router.post('/evaluate', verifyToken, async (req, res) => {
    try {
        const { projectId, answer } = req.body;
        const project = await getRow('SELECT * FROM projects WHERE id = ? AND user_id = ?', [projectId, req.user.id]);
        if (!project) return res.status(404).json({ error: 'Progetto non trovato' });

        // Retrieve active question
        const dbActiveQ = await getRow('SELECT question_json FROM active_questions WHERE project_id = ?', [projectId]);
        if (!dbActiveQ || !dbActiveQ.question_json) {
            return res.status(400).json({ error: 'Nessuna domanda attiva trovata' });
        }

        const activeQuestion = JSON.parse(dbActiveQ.question_json);

        // Track attempts and history
        activeQuestion.attempts = (activeQuestion.attempts || 0) + 1;
        if (!activeQuestion.previousAnswers) activeQuestion.previousAnswers = [];
        activeQuestion.previousAnswers.push(answer);
        const attemptsCount = activeQuestion.attempts;

        let evaluationResult;
        let elementId = '';
        let elementType = '';

        if (activeQuestion.type === 'node') {
            elementId = activeQuestion.nodeId;
            elementType = 'node';

            const node = await getRow('SELECT * FROM nodes WHERE id = ? AND project_id = ?', [elementId, projectId]);
            if (!node) return res.status(404).json({ error: 'Nodo non trovato' });

            const formatNode = {
                id: node.id,
                label: node.label,
                macroTopic: node.macro_topic,
                type: node.type,
                description: node.description
            };

            evaluationResult = await evaluateAnswer(formatNode, answer, node.macro_topic, attemptsCount, activeQuestion.previousAnswers);

            // Save/Update Answer
            const answerId = `${projectId}_ans_${elementId}`;
            await runQuery(
                `INSERT INTO answers (id, project_id, element_id, element_type, original_answer, revised_answer, evaluation, attempts)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(id) DO UPDATE SET 
                 original_answer=excluded.original_answer,
                 revised_answer=excluded.revised_answer,
                 evaluation=excluded.evaluation,
                 attempts=excluded.attempts,
                 updated_at=datetime('now', 'localtime')`,
                [answerId, projectId, elementId, elementType, answer, evaluationResult.revisedAnswer, evaluationResult.evaluation, attemptsCount]
            );

            // Complete node if correct OR if we reached max attempts (3)
            const isCorrect = evaluationResult.evaluation === 'correct';
            const isMaxAttempts = attemptsCount >= 3;
            if (isCorrect || isMaxAttempts) {
                await runQuery('UPDATE nodes SET is_completed = 1 WHERE id = ? AND project_id = ?', [elementId, projectId]);
                await runQuery('DELETE FROM active_questions WHERE project_id = ?', [projectId]);
            } else {
                // Update in-progress active question
                await runQuery('UPDATE active_questions SET question_json = ? WHERE project_id = ?', [JSON.stringify(activeQuestion), projectId]);
            }
        } else if (activeQuestion.type === 'edge') {
            elementId = activeQuestion.edgeKey; // from_to_to
            elementType = 'edge';

            const edge = await getRow('SELECT * FROM edges WHERE id = ? AND project_id = ?', [elementId, projectId]);

            const dummyNode = {
                label: activeQuestion.nodeLabel,
                description: edge ? edge.description : "Collegamento relazionale tra concetti"
            };

            evaluationResult = await evaluateAnswer(dummyNode, answer, "Relazioni", attemptsCount, activeQuestion.previousAnswers);

            // Save/Update Answer
            const answerId = `${projectId}_ans_${elementId}`;
            await runQuery(
                `INSERT INTO answers (id, project_id, element_id, element_type, original_answer, revised_answer, evaluation, attempts)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(id) DO UPDATE SET 
                 original_answer=excluded.original_answer,
                 revised_answer=excluded.revised_answer,
                 evaluation=excluded.evaluation,
                 attempts=excluded.attempts,
                 updated_at=datetime('now', 'localtime')`,
                [answerId, projectId, elementId, elementType, answer, evaluationResult.revisedAnswer, evaluationResult.evaluation, attemptsCount]
            );

            // Complete edge if correct OR if we reached max attempts (3)
            const isCorrect = evaluationResult.evaluation === 'correct';
            const isMaxAttempts = attemptsCount >= 3;
            if (isCorrect || isMaxAttempts) {
                await runQuery('UPDATE edges SET is_completed = 1 WHERE id = ? AND project_id = ?', [elementId, projectId]);
                await runQuery('DELETE FROM active_questions WHERE project_id = ?', [projectId]);
            } else {
                // Update in-progress active question
                await runQuery('UPDATE active_questions SET question_json = ? WHERE project_id = ?', [JSON.stringify(activeQuestion), projectId]);
            }
        }

        // Recalculate progress
        const nodes = await getAllRows('SELECT is_completed FROM nodes WHERE project_id = ?', [projectId]);
        const edges = await getAllRows('SELECT is_completed FROM edges WHERE project_id = ?', [projectId]);

        const completedNodesCount = nodes.filter(n => n.is_completed === 1).length;
        const completedEdgesCount = edges.filter(e => e.is_completed === 1).length;
        const totalItems = nodes.length + edges.length;
        const progress = totalItems > 0 ? Math.round(((completedNodesCount + completedEdgesCount) / totalItems) * 100) : 100;

        // Check if question is now deleted (completed)
        const checkActiveQ = await getRow('SELECT project_id FROM active_questions WHERE project_id = ?', [projectId]);
        const isQuestionCompleted = !checkActiveQ;

        res.json({
            ...evaluationResult,
            completed: isQuestionCompleted,
            progress,
            completedNodes: completedNodesCount,
            completedEdges: completedEdgesCount,
            totalNodes: nodes.length
        });
    } catch (err) {
        console.error('Evaluate error:', err);
        res.status(500).json({ error: 'Errore nella valutazione', details: err.message });
    }
});

export default router;

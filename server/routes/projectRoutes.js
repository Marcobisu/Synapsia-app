import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { createRequire } from 'module';

// Polyfill for Vercel Serverless environment where DOMMatrix is missing
globalThis.DOMMatrix = globalThis.DOMMatrix || class DOMMatrix {};

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import { runQuery, getRow, getAllRows } from '../database/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { validateAnalyzeText } from '../middleware/validationMiddleware.js';
import { analyzeContent } from '../ai.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/**
 * POST /api/analyze - Upload PDF and analyze it (Protected)
 */
router.post('/analyze', verifyToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nessun file caricato' });
        }

        const filePath = req.file.path;
        const dataBuffer = fs.readFileSync(filePath);

        let text = '';
        if (req.file.originalname.endsWith('.pdf')) {
            const parser = new PDFParse({ data: dataBuffer });
            const result = await parser.getText();
            text = result.text;
            await parser.destroy();
        } else {
            text = dataBuffer.toString('utf-8');
        }

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        if (!text.trim()) {
            return res.status(400).json({ error: 'Nessun testo estratto dal file' });
        }

        // Analyze with AI
        const conceptMap = await analyzeContent(text);

        // Store in database
        const projectId = Date.now().toString();
        const projectName = req.body.projectName || req.file.originalname.replace(/\.[^.]+$/, '') || 'Nuova Materia';

        await runQuery(
            'INSERT INTO projects (id, name, user_id) VALUES (?, ?, ?)',
            [projectId, projectName, req.user.id]
        );

        // Insert nodes
        const nodes = conceptMap.nodes || [];
        for (const node of nodes) {
            await runQuery(
                'INSERT INTO nodes (id, project_id, label, macro_topic, type, abstraction_level, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [node.id, projectId, node.label, node.macroTopic, node.type, node.abstractionLevel, node.description || '']
            );
        }

        // Insert edges
        const edges = conceptMap.edges || [];
        for (const edge of edges) {
            const edgeId = `${edge.from}_to_${edge.to}`;
            await runQuery(
                'INSERT INTO edges (id, project_id, from_node, to_node, type, description) VALUES (?, ?, ?, ?, ?, ?)',
                [edgeId, projectId, edge.from, edge.to, edge.type, edge.description || '']
            );
        }

        res.json({
            projectId,
            macroTopics: conceptMap.macroTopics,
            totalNodes: nodes.length,
            conceptMap,
        });
    } catch (err) {
        console.error('Analyze error:', err);
        res.status(500).json({ error: 'Errore nell\'analisi del materiale', details: err.message });
    }
});

/**
 * POST /api/analyze-text - Analyze plain text (Protected)
 */
router.post('/analyze-text', verifyToken, validateAnalyzeText, async (req, res) => {
    try {
        const { text, projectName } = req.body;

        const conceptMap = await analyzeContent(text);

        const projectId = Date.now().toString();
        const name = projectName || 'Nuova Materia';

        await runQuery(
            'INSERT INTO projects (id, name, user_id) VALUES (?, ?, ?)',
            [projectId, name, req.user.id]
        );

        // Insert nodes
        const nodes = conceptMap.nodes || [];
        for (const node of nodes) {
            await runQuery(
                'INSERT INTO nodes (id, project_id, label, macro_topic, type, abstraction_level, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [node.id, projectId, node.label, node.macroTopic, node.type, node.abstractionLevel, node.description || '']
            );
        }

        // Insert edges
        const edges = conceptMap.edges || [];
        for (const edge of edges) {
            const edgeId = `${edge.from}_to_${edge.to}`;
            await runQuery(
                'INSERT INTO edges (id, project_id, from_node, to_node, type, description) VALUES (?, ?, ?, ?, ?, ?)',
                [edgeId, projectId, edge.from, edge.to, edge.type, edge.description || '']
            );
        }

        res.json({
            projectId,
            macroTopics: name,
            totalNodes: nodes.length,
            conceptMap,
        });
    } catch (err) {
        console.error('Analyze-text error:', err);
        res.status(500).json({ error: 'Errore nell\'analisi del testo', details: err.message });
    }
});

/**
 * GET /api/projects - List all projects for authenticated user
 */
router.get('/projects', verifyToken, async (req, res) => {
    try {
        const list = await getAllRows(`
            SELECT p.id, p.name, 
                   COUNT(n.id) as totalNodes,
                   SUM(CASE WHEN n.is_completed = 1 THEN 1 ELSE 0 END) as completedNodes
            FROM projects p
            LEFT JOIN nodes n ON n.project_id = p.id
            WHERE p.user_id = ?
            GROUP BY p.id, p.name
        `, [req.user.id]);

        // Gather macro topics for each project
        const formattedList = [];
        for (const proj of list) {
            const nodes = await getAllRows('SELECT DISTINCT macro_topic FROM nodes WHERE project_id = ?', [proj.id]);
            formattedList.push({
                id: proj.id,
                name: proj.name,
                totalNodes: proj.totalNodes || 0,
                completedNodes: proj.completedNodes || 0,
                macroTopics: nodes.map(n => n.macro_topic)
            });
        }

        res.json(formattedList);
    } catch (err) {
        console.error('Get projects error:', err);
        res.status(500).json({ error: 'Errore nel recupero delle materie.' });
    }
});

/**
 * GET /api/project/:id - Get project full details (Protected)
 */
router.get('/project/:id', verifyToken, async (req, res) => {
    try {
        const project = await getRow('SELECT * FROM projects WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (!project) return res.status(404).json({ error: 'Progetto non trovato' });

        // Retrieve nodes
        const dbNodes = await getAllRows('SELECT * FROM nodes WHERE project_id = ?', [project.id]);
        const nodes = dbNodes.map(n => ({
            id: n.id,
            label: n.label,
            macroTopic: n.macro_topic,
            type: n.type,
            abstractionLevel: n.abstraction_level,
            description: n.description,
            isCompleted: n.is_completed === 1
        }));

        // Retrieve edges
        const dbEdges = await getAllRows('SELECT * FROM edges WHERE project_id = ?', [project.id]);
        const edges = dbEdges.map(e => ({
            from: e.from_node,
            to: e.to_node,
            type: e.type,
            description: e.description,
            isCompleted: e.is_completed === 1
        }));

        // Retrieve answers
        const dbAnswers = await getAllRows('SELECT * FROM answers WHERE project_id = ?', [project.id]);
        const answers = {};
        const edgeAnswers = {};

        dbAnswers.forEach(ans => {
            if (ans.element_type === 'node') {
                answers[ans.element_id] = {
                    original: ans.original_answer,
                    revised: ans.revised_answer,
                    evaluation: ans.evaluation
                };
            } else if (ans.element_type === 'edge') {
                edgeAnswers[ans.element_id] = {
                    original: ans.original_answer,
                    revised: ans.revised_answer,
                    evaluation: ans.evaluation
                };
            }
        });

        // Retrieve active question
        const dbActiveQ = await getRow('SELECT question_json FROM active_questions WHERE project_id = ?', [project.id]);
        const activeQuestion = dbActiveQ ? JSON.parse(dbActiveQ.question_json) : null;

        // Extract completed lists
        const completedNodes = dbNodes.filter(n => n.is_completed === 1).map(n => n.id);
        const completedEdges = dbEdges.filter(e => e.is_completed === 1).map(e => e.id);

        // Extract macro topics list
        const macroTopics = [...new Set(dbNodes.map(n => n.macro_topic))];

        res.json({
            id: project.id,
            name: project.name,
            conceptMap: {
                nodes,
                edges,
                macroTopics
            },
            completedNodes,
            completedEdges,
            answers,
            edgeAnswers,
            activeQuestion
        });
    } catch (err) {
        console.error('Get project error:', err);
        res.status(500).json({ error: 'Errore nel recupero del progetto.' });
    }
});

/**
 * DELETE /api/project/:id - Delete a project (Protected)
 */
router.delete('/project/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const project = await getRow('SELECT id FROM projects WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (!project) return res.status(404).json({ error: 'Progetto non trovato' });

        await runQuery('DELETE FROM projects WHERE id = ?', [id]);
        res.json({ success: true, message: 'Progetto eliminato con successo' });
    } catch (err) {
        console.error('Delete project error:', err);
        res.status(500).json({ error: 'Errore durante la cancellazione del progetto.' });
    }
});

export default router;

import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, BrainCircuit, Maximize2, Minimize2, UploadCloud, ArrowUpRight, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Blobb3D from '../components/Blobb3D';
import './Sessione.css';

const RELATION_LABELS = {
    // Change Management
    "change_mgmt_intro_to_teleological_theory": "Pianifica",
    "change_mgmt_intro_to_greiner_growth_model": "Sviluppa in",
    "greiner_growth_model_to_greiner_burocracy_crisis": "Incontra",
    "change_mgmt_intro_to_kotter_8_steps": "Fasi in",
    "kotter_8_steps_to_lewin_force_field": "Applica su",
    "lewin_force_field_to_resistance_to_change": "Incontra",
    "resistance_to_change_to_path_dependence": "Crea",
    "path_dependence_to_bias_conferma": "Alimenta",
    "resistance_to_change_to_caso_nokia": "Esempio",
    "change_mgmt_intro_to_caso_uk_coal": "Esempio",
    "resistance_to_change_to_burke_litwin_model": "Struttura",
    "lewin_force_field_to_caso_nokia": "Analizza",
    "kotter_8_steps_to_communication_plan": "Richiede",
    "resistance_to_change_to_resistance_tactics": "Risolta da",
    "stakeholder_analysis_to_resistance_tactics": "Guida",
    "change_mgmt_intro_to_simons_levers": "Controlla con",
    "simons_levers_to_performance_indicators": "Misura con",

    // Marketing
    "business_model_canvas_to_value_proposition_canvas": "Inquadra",
    "value_proposition_canvas_to_value_proposition": "Punta a",
    "business_model_canvas_to_customer_segments": "Rivolto a",
    "customer_segments_to_channels_distribution": "Attraverso",
    "customer_segments_to_customer_relationships": "Fidelizza con",
    "business_model_canvas_to_revenue_streams": "Genera",
    "business_model_canvas_to_long_tail": "Modello",
    "long_tail_to_caso_lego_factory": "Esempio",
    "customer_relationships_to_caso_lego_factory": "Abilita",
    "business_model_canvas_to_caso_netflix_blockbuster": "Esempio",
    "value_proposition_canvas_to_value_prop_pains": "Mappa",
    "business_model_canvas_to_gillette_ip_lockin": "Esempio",
    "customer_segments_to_market_segmentation": "Definisce",
    "market_segmentation_to_targeting_positioning": "Trova",
    "targeting_positioning_to_b2b_b2c_marketing": "Si divide in",
    "business_model_canvas_to_brand_equity": "Valorizza",
    "brand_equity_to_branding_decisions": "Guida"
};

const getEdgeLabel = (from, to, description) => {
    const key1 = `${from}_to_${to}`;
    const key2 = `${to}_to_${from}`;
    if (RELATION_LABELS[key1]) return RELATION_LABELS[key1];
    if (RELATION_LABELS[key2]) return RELATION_LABELS[key2];

    if (description) {
        const words = description.split(' ');
        if (words.length > 2) {
            return words.slice(0, 2).join(' ') + '...';
        }
        return description;
    }
    return 'Collegato a';
};

export default function Sessione() {
    const navigate = useNavigate();
    const { 
        sessionLayout, 
        updateSessionLayout, 
        activeProjectId, 
        selectProject,
        activeProjectDetail, 
        refreshActiveProjectDetail,
        mascotName, 
        fetchWithAuth,
        refreshProjects
    } = useApp();

    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [progress, setProgress] = useState(0);
    const [blobbState, setBlobbState] = useState('idle');
    const [currentNode, setCurrentNode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showUpload, setShowUpload] = useState(true);
    const [textInput, setTextInput] = useState('');
    const [projectNameInput, setProjectNameInput] = useState('');
    const messagesEndRef = useRef(null);
    const [selectedPreviewNode, setSelectedPreviewNode] = useState(null);
    const activityTimeoutRef = useRef(null);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const isInitializedRef = useRef(null);
    const hasFetchedRef = useRef(false);

    // Zoom and Pan States for Mini Map
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hoveredNode, setHoveredNode] = useState(null);
    const miniMapContainerRef = useRef(null);

    // Determine active macro topic based on current node under study or fallback
    const activeMacroTopic = useMemo(() => {
        if (!activeProjectDetail || !activeProjectDetail.conceptMap) return '';
        const nodes = activeProjectDetail.conceptMap.nodes;
        if (!nodes || nodes.length === 0) return '';
        
        if (currentNode) {
            // Find macroTopic of the current target node
            const foundNode = nodes.find(n => n.id === currentNode.id);
            if (foundNode && foundNode.macroTopic) {
                return foundNode.macroTopic;
            }
            // If currentNode is an edge
            const edgeKey = currentNode.edgeKey || (currentNode.type === 'edge' ? currentNode.id : null);
            if (edgeKey) {
                const edges = activeProjectDetail.conceptMap.edges || [];
                const foundEdge = edges.find(e => `${e.from}_to_${e.to}` === edgeKey || `${e.to}_to_${e.from}` === edgeKey);
                if (foundEdge) {
                    const fromNode = nodes.find(n => n.id === foundEdge.from);
                    if (fromNode && fromNode.macroTopic) {
                        return fromNode.macroTopic;
                    }
                }
            }
        }
        
        // Fallback 1: First incomplete node's macrotopic
        const completedNodes = activeProjectDetail.completedNodes || [];
        const incompleteNode = nodes.find(n => !completedNodes.includes(n.id));
        if (incompleteNode && incompleteNode.macroTopic) {
            return incompleteNode.macroTopic;
        }
        
        // Fallback 2: First node's macrotopic
        return nodes[0].macroTopic || '';
    }, [activeProjectDetail, currentNode]);

    // Reset pan and zoom when activeMacroTopic changes
    useEffect(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, [activeMacroTopic]);

    // Handle wheel zoom on mini-map container
    useEffect(() => {
        const container = miniMapContainerRef.current;
        if (!container) return;

        const handleWheel = (e) => {
            e.preventDefault();
            const zoomFactor = 1.08;
            setZoom(prevZoom => {
                const nextZoom = e.deltaY < 0 ? prevZoom * zoomFactor : prevZoom / zoomFactor;
                return Math.max(0.4, Math.min(3, nextZoom));
            });
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [sessionLayout]); // Re-bind if layout changes to mount the container

    const handleMiniMapMouseDown = (e) => {
        if (e.button !== 0) return;
        if (e.target.closest('.canvas-node-card')) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMiniMapMouseMove = (e) => {
        if (!isDragging) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMiniMapMouseUp = () => {
        setIsDragging(false);
    };

    const resetMiniMapView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const handleProceedToHome = () => {
        setShowCompletionModal(false);
        selectProject(null);
        navigate('/');
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    // Handle project selection or changes from context
    useEffect(() => {
        let tId = null;

        if (activeProjectId && activeProjectDetail && activeProjectDetail.id === activeProjectId) {
            setShowUpload(false);
            const pct = (activeProjectDetail.id === 'mock_tiga' && activeProjectDetail.completedNodes.length === 16)
                ? 98
                : Math.round(((activeProjectDetail.completedNodes.length + activeProjectDetail.completedEdges.length) / 
                    (activeProjectDetail.conceptMap.nodes.length + activeProjectDetail.conceptMap.edges.length)) * 100);
            setProgress(pct);
            
            // Use a ref to ensure initialization runs only once per activeProjectId
            if (isInitializedRef.current !== activeProjectId) {
                isInitializedRef.current = activeProjectId;
                setMessages([]);
                hasFetchedRef.current = false;
            }

            if (!hasFetchedRef.current) {
                const totalCompleted = activeProjectDetail.completedNodes.length;
                if (totalCompleted > 0) {
                    // Conversational Resume
                    const lastNodeId = activeProjectDetail.completedNodes[totalCompleted - 1];
                    const lastNode = activeProjectDetail.conceptMap.nodes.find(n => n.id === lastNodeId);
                    
                    setMessages([
                        { 
                            sender: 'blobb', 
                            text: `Bentornato! L'ultima volta abbiamo lavorato sodo e completato il concetto di "${lastNode ? lastNode.label : 'studio'}". Riprendiamo la nostra costruzione da dove l'abbiamo interrotta!`,
                            state: 'idle' 
                        }
                    ]);
                    tId = setTimeout(() => {
                        hasFetchedRef.current = true;
                        fetchNextQuestion(activeProjectId);
                    }, 1500);
                } else {
                    hasFetchedRef.current = true;
                    fetchNextQuestion(activeProjectId);
                }
            }
        } else {
            setShowUpload(true);
            setMessages([]);
            setCurrentNode(null);
            setProgress(0);
            isInitializedRef.current = null;
            hasFetchedRef.current = false;
        }

        return () => {
            if (tId) clearTimeout(tId);
        };
    }, [activeProjectId, activeProjectDetail]);

    // Timer di inattività per la mascotte (sbadiglio dopo 15 secondi)
    useEffect(() => {
        if (showUpload || !activeProjectId) return;

        const resetTimer = () => {
            if (activityTimeoutRef.current) {
                clearTimeout(activityTimeoutRef.current);
            }
            
            // Ripristina lo stato idle se sbadigliava
            setBlobbState(current => {
                if (current === 'yawning') {
                    return 'idle';
                }
                return current;
            });

            activityTimeoutRef.current = setTimeout(() => {
                setBlobbState('yawning');
            }, 15000); // 15 secondi
        };

        resetTimer();

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);
        window.addEventListener('click', resetTimer);

        return () => {
            if (activityTimeoutRef.current) {
                clearTimeout(activityTimeoutRef.current);
            }
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
            window.removeEventListener('click', resetTimer);
        };
    }, [showUpload, activeProjectId]);

    // --- Upload and Analyze ---
    const handleAnalyzeText = async () => {
        if (!textInput.trim()) return;
        setLoading(true);
        setBlobbState('curious');
        setMessages([{ sender: 'blobb', text: `Sto analizzando il tuo materiale... Dammi un momento per costruire la mappa concettuale interna. 🧠`, state: 'curious' }]);

        try {
            const res = await fetchWithAuth('/analyze-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    text: textInput, 
                    projectName: projectNameInput.trim() || 'Sessione di Studio' 
                }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Errore');

            // Select active project and refresh context
            selectProject(data.projectId);
            await refreshProjects();
            
            setBlobbState('dance');
            setMessages(prev => [...prev, {
                sender: 'blobb',
                text: `Analisi completata! Ho identificato ${data.totalNodes} concetti in ${data.macroTopics.length} macro-argomenti. Iniziamo subito a costruire la tua mappa concettuale!`,
                state: 'dance'
            }]);
        } catch (err) {
            setMessages(prev => [...prev, { sender: 'blobb', text: `Errore: ${err.message}. Assicurati che il backend sia attivo.`, state: 'skeptical' }]);
            setBlobbState('skeptical');
        }
        setLoading(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        setBlobbState('curious');
        setMessages([{ sender: 'blobb', text: `Sto leggendo "${file.name}"... Un momento, ${mascotName} è al lavoro! 📄`, state: 'curious' }]);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('projectName', projectNameInput.trim() || file.name.replace(/\.[^.]+$/, ''));

            const res = await fetchWithAuth('/analyze', {
                body: formData,
                method: 'POST',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore');

            selectProject(data.projectId);
            await refreshProjects();

            setBlobbState('dance');
            setMessages(prev => [...prev, {
                sender: 'blobb',
                text: `Ho analizzato "${file.name}" con successo! Ho suddiviso il materiale in ${data.macroTopics.length} capitoli. Diamoci dentro!`,
                state: 'dance'
            }]);
        } catch (err) {
            setMessages(prev => [...prev, { sender: 'blobb', text: `Errore nell'analisi del file: ${err.message}`, state: 'skeptical' }]);
            setBlobbState('skeptical');
        }
        setLoading(false);
    };

    // --- Question / Answer Flow ---
    const fetchNextQuestion = async (pid) => {
        const pId = pid || activeProjectId;
        if (!pId) return;

        try {
            const res = await fetchWithAuth('/question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: pId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore');

            if (data.completed) {
                setProgress(100);
                setCurrentNode(null);
                refreshActiveProjectDetail();
                setShowCompletionModal(true);
                return;
            }

            // nodeType can be 'hub', 'intermediate', 'leaf', or 'edge'
            setCurrentNode({ 
                id: data.nodeId || data.edgeKey, 
                label: data.nodeLabel, 
                type: data.nodeType,
                isPlaneJump: data.isPlaneJump,
                edgeKey: data.edgeKey
            });
            setProgress(data.progress);

            const text = data.introduction
                ? `${data.introduction}\n\n${data.question}`
                : data.question;

            setMessages(prev => [...prev, { 
                sender: 'blobb', 
                text, 
                state: 'idle',
                isPlaneJump: data.isPlaneJump,
                nodeLabel: data.nodeLabel
            }]);
        } catch (err) {
            setMessages(prev => [...prev, { sender: 'blobb', text: `Errore nel caricamento della domanda: ${err.message}`, state: 'skeptical' }]);
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim() || !activeProjectId || !currentNode) return;

        const answer = inputValue;
        setMessages(prev => [...prev, { sender: 'user', text: answer }]);
        setInputValue('');
        setLoading(true);
        setBlobbState('curious');

        try {
            const res = await fetchWithAuth('/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: activeProjectId, answer }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore');

            setBlobbState(data.blobbState || 'idle');
            setProgress(data.progress);
            setMessages(prev => [...prev, { sender: 'blobb', text: data.feedback, state: data.blobbState }]);

            // Update detailed state in context
            refreshActiveProjectDetail();

            // After feedback, get next question if completed
            if (data.completed) {
                setTimeout(() => {
                    setBlobbState('idle');
                    fetchNextQuestion();
                }, 3000);
            } else {
                setTimeout(() => {
                    setBlobbState('idle');
                }, 3000);
            }
        } catch (err) {
            setMessages(prev => [...prev, { sender: 'blobb', text: `Errore nella valutazione: ${err.message}`, state: 'skeptical' }]);
            setBlobbState('skeptical');
        }
        setLoading(false);
    };

    // Calculate node coordinates for 2D Interactive Map (using Mappa2D row logic)
    const nodePositions = useMemo(() => {
        if (!activeProjectDetail || !activeProjectDetail.conceptMap || !activeMacroTopic) return {};
        
        const nodes = activeProjectDetail.conceptMap.nodes.filter(n => n.macroTopic === activeMacroTopic);
        
        const getRowIndex = (node) => {
            if (node.abstractionLevel === 5 || node.type === 'hub') return 0;
            if (node.abstractionLevel === 4) return 1;
            if (node.abstractionLevel === 3 || node.type === 'intermediate') return 2;
            return 3;
        };

        const rows = [[], [], [], []];
        nodes.forEach(node => {
            const r = getRowIndex(node);
            rows[r].push(node);
        });

        const pos = {};

        rows.forEach((rowNodes, rIdx) => {
            const total = rowNodes.length;
            const yVal = 15 + rIdx * 25; // Row Y positions: 15%, 40%, 65%, 90%
            rowNodes.sort((a, b) => a.id.localeCompare(b.id));
            rowNodes.forEach((node, i) => {
                let xVal;
                if (total === 1) {
                    xVal = 50;
                } else {
                    xVal = 15 + (70 * i) / (total - 1);
                }
                pos[node.id] = { x: xVal, y: yVal };
            });
        });

        return pos;
    }, [activeProjectDetail, activeMacroTopic]);

    // Renders 2D Map inside Contesto Layout (coherent with Mappa2D chapter view)
    const render2DMap = () => {
        if (!activeProjectDetail || !activeProjectDetail.conceptMap || !activeMacroTopic) return null;

        const { nodes, edges = [] } = activeProjectDetail.conceptMap;
        const completedNodes = activeProjectDetail.completedNodes || [];
        const completedEdges = activeProjectDetail.completedEdges || [];
        
        const visibleNodes = nodes.filter(n => n.macroTopic === activeMacroTopic);
        const topicNodeIds = visibleNodes.map(n => n.id);
        const visibleEdges = edges.filter(e => topicNodeIds.includes(e.from) && topicNodeIds.includes(e.to));

        return (
            <div 
                className="mini-map-container"
                ref={miniMapContainerRef}
                onMouseDown={handleMiniMapMouseDown}
                onMouseMove={handleMiniMapMouseMove}
                onMouseUp={handleMiniMapMouseUp}
                onMouseLeave={handleMiniMapMouseUp}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                {/* 2D Canvas HUD Controls */}
                <div className="canvas-hud-controls">
                    <span className="hud-hint">Trascina • Rotella</span>
                    <div className="hud-buttons">
                        <span className="zoom-percentage">{Math.round(zoom * 100)}%</span>
                        <button className="hud-btn-reset" onClick={resetMiniMapView} title="Ripristina Vista">
                            Reset
                        </button>
                    </div>
                </div>

                {/* Transform viewport */}
                <div 
                    className="canvas-content-transform"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: 'center center',
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                    }}
                >
                    {/* SVG Connection Lines */}
                    <svg className="canvas-svg">
                        <defs>
                            <marker 
                                id="arrow-completed" 
                                viewBox="0 0 10 10" 
                                refX="16" 
                                refY="5" 
                                markerWidth="6" 
                                markerHeight="6" 
                                orient="auto-start-reverse"
                            >
                                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--accent-color)" />
                            </marker>
                            <marker 
                                id="arrow-locked" 
                                viewBox="0 0 10 10" 
                                refX="24" 
                                refY="5" 
                                markerWidth="6" 
                                markerHeight="6" 
                                orient="auto-start-reverse"
                            >
                                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(255, 255, 255, 0.15)" />
                            </marker>
                        </defs>
                        {visibleEdges.map((edge, idx) => {
                            const start = nodePositions[edge.from];
                            const end = nodePositions[edge.to];
                            if (!start || !end) return null;

                            const edgeKey = `${edge.from}_to_${edge.to}`;
                            const reverseKey = `${edge.to}_to_${edge.from}`;
                            const isCompleted = completedEdges.includes(edgeKey) || completedEdges.includes(reverseKey);
                            const isHovered = hoveredNode === edge.from || hoveredNode === edge.to;
                            
                            // Check if this edge is currently active (being questioned)
                            const isEdgeActive = currentNode?.type === 'edge' && currentNode?.id === edgeKey;

                            return (
                                <line
                                    key={idx}
                                    x1={`${start.x}%`}
                                    y1={`${start.y}%`}
                                    x2={`${end.x}%`}
                                    y2={`${end.y}%`}
                                    className={`canvas-edge ${isCompleted ? 'completed' : 'locked'} ${isHovered || isEdgeActive ? 'hovered' : ''}`}
                                    markerEnd={`url(#arrow-${isCompleted ? 'completed' : 'locked'})`}
                                />
                            );
                        })}
                    </svg>

                    {/* Connection Labels positioned at line midpoints */}
                    {visibleEdges.map((edge, idx) => {
                        const start = nodePositions[edge.from];
                        const end = nodePositions[edge.to];
                        if (!start || !end) return null;

                        const edgeKey = `${edge.from}_to_${edge.to}`;
                        const reverseKey = `${edge.to}_to_${edge.from}`;
                        const isCompleted = completedEdges.includes(edgeKey) || completedEdges.includes(reverseKey);
                        const isHovered = hoveredNode === edge.from || hoveredNode === edge.to;
                        const isEdgeActive = currentNode?.type === 'edge' && currentNode?.id === edgeKey;
                        const label = getEdgeLabel(edge.from, edge.to, edge.description);

                        return (
                            <div
                                key={`label-${idx}`}
                                className={`edge-label-badge ${isCompleted ? 'completed' : 'locked'} ${isHovered || isEdgeActive ? 'hovered' : ''}`}
                                style={{
                                    left: `${(start.x + end.x) / 2}%`,
                                    top: `${(start.y + end.y) / 2}%`,
                                }}
                            >
                                {label}
                            </div>
                        );
                    })}

                    {/* Interactive Nodes */}
                    {visibleNodes.map(node => {
                        const pos = nodePositions[node.id];
                        if (!pos) return null;

                        const isCompleted = completedNodes.includes(node.id);
                        const isNodeHovered = hoveredNode === node.id;
                        
                        // Check if this node is connected to the hovered node
                        let isConnectedToHovered = false;
                        if (hoveredNode && hoveredNode !== node.id) {
                            isConnectedToHovered = edges.some(e => 
                                (e.from === node.id && e.to === hoveredNode) || 
                                (e.to === node.id && e.from === hoveredNode)
                            );
                        }

                        // Check if this node is active (being questioned)
                        const isNodeActive = currentNode?.id === node.id || (currentNode?.type === 'node' && currentNode?.id === node.id);

                        const shapeClass = node.type === 'hub' ? 'ellipse' : node.abstractionLevel === 4 ? 'hexagon' : node.abstractionLevel === 3 ? 'rounded' : 'rectangle';

                        return (
                            <div
                                key={node.id}
                                className={`canvas-node-card node-shape-${shapeClass} ${isCompleted ? 'completed' : 'locked'} ${isNodeHovered ? 'active' : ''} ${isConnectedToHovered ? 'connected' : ''} ${isNodeActive ? 'active-node' : ''}`}
                                style={{
                                    left: `${pos.x}%`,
                                    top: `${pos.y}%`,
                                }}
                                onMouseEnter={() => setHoveredNode(node.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                                onClick={() => {
                                    if (isCompleted) {
                                        const answerData = activeProjectDetail.answers[node.id];
                                        setSelectedPreviewNode({
                                            label: node.label,
                                            type: node.type,
                                            macroTopic: node.macroTopic,
                                            answer: answerData ? (answerData.revised || answerData.original) : "Concetto sbloccato correttamente."
                                        });
                                    }
                                }}
                            >
                                <div className="node-text">
                                    {!isCompleted && <Lock size={11} className="node-lock-icon" style={{ marginRight: 5, flexShrink: 0 }} />}
                                    <span>{node.label}</span>
                                </div>
                                
                                {/* Tooltip Description on hover */}
                                <div className="node-tooltip">
                                    <h5>{node.label}</h5>
                                    <span className="tooltip-type">
                                        {node.type === 'hub' ? 'Caposaldo' : node.abstractionLevel === 4 ? 'Concetto Fondamentale' : node.abstractionLevel === 3 ? 'Concetto Secondario' : 'Dettaglio'}
                                    </span>
                                    <p>{node.description || 'Nessuna descrizione disponibile.'}</p>
                                    <span className="tooltip-status">{isCompleted ? '✓ Acquisito' : '🔒 Bloccato'}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className={`sessione-page layout-${sessionLayout}`}>
            <header className="sessione-header glass-panel">
                <div className="session-info">
                    <div className="title-area">
                        <h2>{activeProjectDetail ? activeProjectDetail.name : 'Sessione di Studio'}</h2>
                        {currentNode && (
                            <span className="current-target-badge">
                                Target: {currentNode.label}
                            </span>
                        )}
                    </div>
                    <div className="controls">
                        {activeProjectDetail && (
                            <button className="btn-text btn-exit" onClick={() => { selectProject(null); navigate('/'); }}>
                                Termina Sessione
                            </button>
                        )}
                        <button 
                            className="btn-icon" 
                            onClick={() => updateSessionLayout(sessionLayout === 'focus' ? 'contesto' : 'focus')} 
                            title="Cambia Layout"
                        >
                            {sessionLayout === 'focus' ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                    </div>
                </div>
                <div className="progress-container">
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        <div className="progress-cursor" style={{ left: `${progress}%` }}>
                            <BrainCircuit size={20} color="white" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="sessione-body">
                <div className="chat-area glass-panel">
                    {showUpload ? (
                        <div className="upload-section">
                            <Blobb3D state={blobbState} size="large" />
                            <h2>Carica il tuo materiale per iniziare con {mascotName}</h2>
                            <p>Carica un file PDF delle slide o incolla un testo per fare l'analisi strutturale.</p>

                            <div className="projectName-field">
                                <label>Nome del Progetto (Materia d'esame)</label>
                                <input 
                                    type="text" 
                                    value={projectNameInput}
                                    onChange={(e) => setProjectNameInput(e.target.value)}
                                    placeholder="Es. Psicologia Cognitiva, Storia Romana..."
                                />
                            </div>

                            <label className="file-upload-btn btn-primary">
                                <UploadCloud size={20} /> Carica PDF o Testo
                                <input type="file" accept=".pdf,.txt" onChange={handleFileUpload} hidden />
                            </label>

                            <div className="text-upload-divider"><span>oppure incolla direttamente del testo</span></div>

                            <textarea
                                className="text-upload-area"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Incolla qui il contenuto del tuo materiale di studio..."
                                rows={8}
                            />
                            <button className="btn-primary" onClick={handleAnalyzeText} disabled={!textInput.trim() || loading}>
                                {loading ? 'Analisi in corso...' : 'Analizza e Inizia'}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="messages-list">
                                {messages.map((msg, idx) => {
                                    const isBlobb = msg.sender === 'blobb';
                                    const isPJ = msg.isPlaneJump;

                                    return (
                                        <div key={idx} className={`message-wrapper ${msg.sender} ${isPJ ? 'plane-jump-message' : ''}`}>
                                            {isBlobb && (
                                                <div className="message-avatar">
                                                    <Blobb3D state={msg.state || 'idle'} size="small" />
                                                </div>
                                            )}
                                            <div className={`message-bubble ${isPJ ? 'plane-jump-bubble' : ''}`}>
                                                {isPJ && (
                                                    <div className="plane-jump-header">
                                                        <ArrowUpRight size={16} /> Salto di Piano: Collegamento Inter-Capitolo
                                                    </div>
                                                )}
                                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="input-area">
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) { 
                                            e.preventDefault(); 
                                            handleSend(); 
                                        }
                                    }}
                                    placeholder="Scrivi la tua risposta attiva qui..."
                                    rows={3}
                                    disabled={loading}
                                />
                                <button className="btn-send" onClick={handleSend} disabled={!inputValue.trim() || loading}>
                                    <Send size={20} />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {sessionLayout === 'contesto' && !showUpload && activeProjectDetail && (
                    <aside className="context-panel glass-panel animate-slide-in">
                        <h3>Mappa 2D: {activeMacroTopic}</h3>
                        <p className="context-desc">
                            Visualizza il cantiere logico di questa materia per questo capitolo. Rispondi correttamente alle domande per illuminare i nodi e le frecce. Clicca sui nodi sbloccati per leggerne il contenuto.
                        </p>
                        {render2DMap()}
                        <div className="canvas-footer" style={{ padding: '10px', borderRadius: '10px', marginTop: '10px', background: 'rgba(26, 26, 29, 0.4)' }}>
                            <div className="legend-items" style={{ gap: '8px 12px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <div className="legend-item"><span className="legend-shape shape-ellipse" /> Hub</div>
                                <div className="legend-item"><span className="legend-shape shape-hexagon" /> Int. Alto</div>
                                <div className="legend-item"><span className="legend-shape shape-rounded" /> Int. Basso</div>
                                <div className="legend-item"><span className="legend-shape shape-rectangle" /> Foglia</div>
                            </div>
                        </div>
                    </aside>
                )}
            </div>

            {/* Modal for viewing completed answers */}
            {selectedPreviewNode && (
                <div className="node-preview-modal-overlay" onClick={() => setSelectedPreviewNode(null)}>
                    <div className="node-preview-modal glass-panel animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setSelectedPreviewNode(null)}>×</button>
                        <div className="modal-header-section">
                            <span className={`node-type-tag type-${selectedPreviewNode.type}`}>
                                {selectedPreviewNode.type === 'hub' ? 'Nodo Hub' : selectedPreviewNode.type === 'intermediate' ? 'Nodo Intermedio' : 'Dettaglio'}
                            </span>
                            <h3>{selectedPreviewNode.label}</h3>
                            <p className="modal-topic-subtitle">Macro-argomento: {selectedPreviewNode.macroTopic}</p>
                        </div>
                        <div className="modal-content-section">
                            <h4>La tua definizione sbloccata:</h4>
                            <p className="saved-answer-text">{selectedPreviewNode.answer}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Subject Completion Modal */}
            {showCompletionModal && (
                <div className="completion-modal-overlay">
                    <div className="completion-modal glass-panel animate-scale-in">
                        <div className="completion-modal-content">
                            <div className="modal-mascot-container">
                                <Blobb3D state="dance" size="large" />
                            </div>
                            <h2>🎉 Complimenti!</h2>
                            <p>
                                Hai completato con successo tutti i concetti di questa materia!
                            </p>
                            <div className="completion-badge-box">
                                <span className="completion-badge">Nuova Visualizzazione 3D Sbloccata</span>
                            </div>
                            <p className="completion-desc">
                                Blobb ti fa i complimenti! La nuova visualizzazione 3D e il modello nel cervello in <strong>My Brain</strong> sono ora sbloccati per il ripasso.
                            </p>
                            <button className="btn-primary btn-large" onClick={handleProceedToHome}>
                                Prosegui
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

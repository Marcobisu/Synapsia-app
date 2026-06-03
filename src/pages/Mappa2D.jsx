import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, CheckCircle, Lock, Layers, Eye, Award } from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import './Mappa2D.css';

const PALETTES_3D = {
    standard: {
        background: '#151b26',  // soft deep slate-blue
        hub: '#4078a5',         // soft desaturated ocean blue
        level4: '#c97455',      // soft desaturated terracotta
        level3: '#bd9f5c',      // soft desaturated brass gold
        leaf: '#518e6b',        // soft desaturated sage green
        edgeActive: '#639abf',  // soft desaturated light blue
        edgeLocked: 'rgba(148, 163, 184, 0.12)',
        locked: '#64748b'
    },
    cyberpunk: {
        background: '#121318',  // soft desaturated dark violet-charcoal
        hub: '#b85c8d',         // soft dusty magenta
        level4: '#4ea884',      // soft pine/mint
        level3: '#4995a6',      // soft desaturated cyan-teal
        leaf: '#cca262',        // soft desaturated amber
        edgeActive: '#8b7ab8',  // soft muted lavender
        edgeLocked: 'rgba(148, 163, 184, 0.08)',
        locked: '#5a6270'
    },
    vintage: {
        background: '#1e1c1a',  // soft warm charcoal brown
        hub: '#a3583b',         // soft earthy brick
        level4: '#b5835c',      // soft warm clay
        level3: '#868e65',      // soft sage/olive green
        leaf: '#85705d',        // soft warm taupe
        edgeActive: '#aa937a',  // soft warm sand
        edgeLocked: 'rgba(168, 162, 158, 0.08)',
        locked: '#686461'
    },
    aurora: {
        background: '#161b22',  // soft slate grey-blue
        hub: '#6f8ca8',         // soft desaturated steel blue
        level4: '#9b8ea6',      // soft desaturated wisteria purple
        level3: '#849ea8',      // soft desaturated cadet blue
        leaf: '#729c8e',        // soft desaturated moss green
        edgeActive: '#ab859f',  // soft dusty rose-violet
        edgeLocked: 'rgba(148, 163, 184, 0.1)',
        locked: '#64748b'
    }
};

function ConnectionLine3D({ start, end, color, opacity = 0.35, animate = false }) {
    const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
    const pulseRef = useRef();

    useFrame((state) => {
        if (pulseRef.current && animate) {
            const speed = 0.45;
            const t = (state.clock.getElapsedTime() * speed) % 1.0;
            pulseRef.current.position.x = start[0] + (end[0] - start[0]) * t;
            pulseRef.current.position.y = start[1] + (end[1] - start[1]) * t;
            pulseRef.current.position.z = start[2] + (end[2] - start[2]) * t;
        }
    });

    return (
        <group>
            <line>
                <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints(points)} />
                <lineBasicMaterial attach="material" color={color} transparent opacity={opacity} linewidth={1.5} />
            </line>
            {animate && (
                <mesh ref={pulseRef}>
                    <sphereGeometry args={[0.045, 8, 8]} />
                    <meshBasicMaterial color={color} transparent opacity={opacity * 1.8} depthWrite={false} />
                </mesh>
            )}
        </group>
    );
}

function SingleSubject3DScene({ nodes, edges, macroTopics, completedNodes, completedEdges }) {
    const { global3DPalette } = useApp();
    const palette = PALETTES_3D[global3DPalette] || PALETTES_3D.standard;
    const groupRef = useRef();
    const [hoveredNode, setHoveredNode] = useState(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.015;
        }
    });

    // 1. Calculate macro centers
    const macroCenters = useMemo(() => {
        const centers = {};
        macroTopics.forEach((topic, tIdx) => {
            const angle = (tIdx / macroTopics.length) * Math.PI * 2;
            const radius = 3.5;
            const mx = Math.cos(angle) * radius;
            const my = 0;
            const mz = Math.sin(angle) * radius;
            centers[topic] = [mx, my, mz];
        });
        return centers;
    }, [macroTopics]);

    // 2. Calculate node positions
    const nodes3D = useMemo(() => {
        return nodes.map(node => {
            const mCenter = macroCenters[node.macroTopic] || [0, 0, 0];
            const seed = node.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const angle = (seed % 100 / 100) * Math.PI * 2;
            const radius = 1.0 + (seed % 3) * 0.15;
            
            const heightOffset = (node.abstractionLevel - 3) * 1.2;
            const nx = mCenter[0] + Math.cos(angle) * radius;
            const ny = mCenter[1] + heightOffset;
            const nz = mCenter[2] + Math.sin(angle) * radius;
            
            const isCompleted = completedNodes.includes(node.id);

            // Node colors matching selected palette
            let nodeColor = palette.locked; // gray locked fallback
            if (isCompleted) {
                if (node.type === 'hub') nodeColor = palette.hub;
                else if (node.abstractionLevel === 4) nodeColor = palette.level4;
                else if (node.abstractionLevel === 3) nodeColor = palette.level3;
                else nodeColor = palette.leaf;
            }

            return {
                ...node,
                position: [nx, ny, nz],
                color: nodeColor,
                isCompleted
            };
        });
    }, [nodes, macroCenters, completedNodes]);

    // 3. Map edges
    const edges3D = useMemo(() => {
        return edges.map((edge, idx) => {
            const fromNode = nodes3D.find(n => n.id === edge.from);
            const toNode = nodes3D.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const edgeKey = `${edge.from}_to_${edge.to}`;
            const reverseKey = `${edge.to}_to_${edge.from}`;
            const isCompleted = completedEdges.includes(edgeKey) || completedEdges.includes(reverseKey);

            return {
                ...edge,
                id: `edge3d_${idx}`,
                fromPos: fromNode.position,
                toPos: toNode.position,
                color: isCompleted ? palette.edgeActive : palette.edgeLocked,
                isCompleted
            };
        }).filter(Boolean);
    }, [edges, nodes3D, completedEdges]);

    return (
        <group ref={groupRef}>
            <ambientLight intensity={0.65} />
            <pointLight position={[10, 10, 10]} intensity={1.2} />

            {/* MacroTopic Centers (Hub Labels) */}
            {Object.entries(macroCenters).map(([name, pos], idx) => (
                <group key={`macro_${idx}`} position={pos}>
                    <mesh>
                        <sphereGeometry args={[0.2, 16, 16]} />
                        <meshBasicMaterial color={palette.edgeActive} transparent opacity={0.25} />
                    </mesh>
                    <Html distanceFactor={8} position={[0, 0.4, 0]} center>
                        <div className="macro-3d-tag">
                            {name}
                        </div>
                    </Html>
                </group>
            ))}

            {/* 3D Nodes */}
            {nodes3D.map((node) => {
                const isSelected = hoveredNode?.id === node.id;
                return (
                    <group key={node.id} position={node.position}>
                        <mesh 
                            onPointerOver={(e) => {
                                e.stopPropagation();
                                document.body.style.cursor = 'pointer';
                                setHoveredNode(node);
                            }}
                            onPointerOut={(e) => {
                                document.body.style.cursor = 'default';
                                setHoveredNode(null);
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setHoveredNode(node);
                            }}
                        >
                            <sphereGeometry args={[node.type === 'hub' ? 0.22 : 0.14, 16, 16]} />
                            <meshBasicMaterial 
                                color={isSelected ? '#ffffff' : node.color} 
                                transparent
                                opacity={node.isCompleted ? 0.95 : 0.4}
                            />
                        </mesh>

                        {/* Hover ring effect */}
                        {isSelected && (
                            <mesh scale={1.8}>
                                <sphereGeometry args={[node.type === 'hub' ? 0.22 : 0.14, 16, 16]} />
                                <meshBasicMaterial color="#ffffff" transparent opacity={0.2} depthWrite={false} />
                            </mesh>
                        )}

                        {/* Interactive Tooltip fluttuante */}
                        {isSelected && (
                            <Html position={[0, 0.45, 0]} center>
                                <div className="node-tooltip-3d">
                                    <h5>{node.label}</h5>
                                    <span className="tooltip-type-3d">
                                        {node.type === 'hub' ? 'Caposaldo' : node.abstractionLevel === 4 ? 'Concetto Fondamentale' : node.abstractionLevel === 3 ? 'Concetto Secondario' : 'Dettaglio'}
                                    </span>
                                    <p>{node.description || 'Nessuna descrizione disponibile.'}</p>
                                    <span className="tooltip-status-3d">{node.isCompleted ? '✓ Acquisito' : '🔒 Bloccato'}</span>
                                </div>
                            </Html>
                        )}
                    </group>
                );
            })}

            {/* 3D Connections */}
            {edges3D.map((edge) => (
                <ConnectionLine3D 
                    key={edge.id}
                    start={edge.fromPos}
                    end={edge.toPos}
                    color={edge.color}
                    opacity={edge.isCompleted ? 0.7 : 0.15}
                    animate={edge.isCompleted}
                />
            ))}
        </group>
    );
}

function Mappa3DCanvas({ nodes, edges, macroTopics, completedNodes, completedEdges }) {
    const { global3DPalette } = useApp();
    const palette = PALETTES_3D[global3DPalette] || PALETTES_3D.standard;

    return (
        <div className="canvas-wrapper-3d">
            {/* 3D Canvas HUD Info */}
            <div className="canvas-hud-controls-3d">
                <span className="hud-hint-3d">Ruota: Trascina • Sposta: Click Destro + Trascina • Zoom: Rotellina</span>
                <span className="hud-hint-3d badge-3d">Vista 3D Attiva</span>
            </div>
            
            <Canvas
                camera={{ position: [0, 6, 11], fov: 50 }}
                style={{ width: '100%', height: '100%', borderRadius: '14px' }}
            >
                <color attach="background" args={[palette.background]} />
                <SingleSubject3DScene 
                    nodes={nodes}
                    edges={edges}
                    macroTopics={macroTopics}
                    completedNodes={completedNodes}
                    completedEdges={completedEdges}
                />
                <OrbitControls 
                    enableDamping
                    dampingFactor={0.05}
                    minDistance={3}
                    maxDistance={22}
                />
            </Canvas>
        </div>
    );
}

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

export default function Mappa2D() {
    const navigate = useNavigate();
    const { activeProjectDetail, selectProject } = useApp();

    const [selectedTopic, setSelectedTopic] = useState('');
    const [viewMode, setViewMode] = useState('chapter'); // 'chapter' or 'global'
    const [hoveredNode, setHoveredNode] = useState(null);

    // Zoom and Pan States
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const containerRef = useRef(null);

    // Listen to wheel events on container (active listener to prevent body scroll)
    useEffect(() => {
        const container = containerRef.current;
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
    }, []);

    // Reset pan and zoom when changing topic or view mode
    useEffect(() => {
        resetView();
    }, [selectedTopic, viewMode]);

    const handleMouseDown = (e) => {
        // Only drag with left click, ignore on interactive node clicks
        if (e.button !== 0) return;
        
        // Prevent drag on tooltip or other interactive components
        if (e.target.closest('.canvas-node-card')) return;

        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const resetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    // If no project selected, render fallback
    if (!activeProjectDetail) {
        return (
            <div className="mappa-2d-fallback">
                <div className="glass-panel fallback-card">
                    <Layers size={64} className="fallback-icon" />
                    <h2>Nessun Esame Selezionato</h2>
                    <p>Seleziona una materia attiva dalla Home per poterne visualizzare la mappa bidimensionale.</p>
                    <button className="btn-primary" onClick={() => navigate('/')}>
                        Torna alla Home
                    </button>
                </div>
            </div>
        );
    }

    const { conceptMap, completedNodes, completedEdges } = activeProjectDetail;
    const { nodes, edges, macroTopics } = conceptMap;

    // Is the subject fully completed?
    // A subject is completed when all nodes are completed
    const isSubjectCompleted = useMemo(() => {
        if (nodes.length === 0) return false;
        return nodes.every(n => completedNodes.includes(n.id));
    }, [nodes, completedNodes]);

    // Set initial topic if not set
    useMemo(() => {
        if (macroTopics && macroTopics.length > 0 && !selectedTopic) {
            setSelectedTopic(macroTopics[0]);
        }
    }, [macroTopics, selectedTopic]);

    const getRowIndex = (node) => {
        if (node.abstractionLevel === 5 || node.type === 'hub') return 0;
        if (node.abstractionLevel === 4) return 1;
        if (node.abstractionLevel === 3 || node.type === 'intermediate') return 2;
        return 3;
    };

    // Calculate node coordinates for 2D chapter view (Hierarchical tree rows)
    const chapterNodePositions = useMemo(() => {
        if (!selectedTopic) return {};
        const topicNodes = nodes.filter(n => n.macroTopic === selectedTopic);

        const rows = [[], [], [], []];
        topicNodes.forEach(node => {
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
    }, [nodes, selectedTopic]);

    // Calculate node coordinates for 2D connected global view (All chapters in side-by-side hierarchical columns)
    const globalNodePositions = useMemo(() => {
        const pos = {};
        if (macroTopics.length === 0) return {};

        macroTopics.forEach((topic, colIdx) => {
            const topicNodes = nodes.filter(n => n.macroTopic === topic);
            const colWidth = 100 / macroTopics.length;
            const colStart = colIdx * colWidth;

            const rows = [[], [], [], []];
            topicNodes.forEach(node => {
                const r = getRowIndex(node);
                rows[r].push(node);
            });

            rows.forEach((rowNodes, rIdx) => {
                const total = rowNodes.length;
                const yVal = 15 + rIdx * 25;
                rowNodes.sort((a, b) => a.id.localeCompare(b.id));
                rowNodes.forEach((node, i) => {
                    let xOffset;
                    if (total === 1) {
                        xOffset = 0.5;
                    } else {
                        xOffset = 0.15 + (0.7 * i) / (total - 1);
                    }
                    pos[node.id] = {
                        x: colStart + (xOffset * colWidth),
                        y: yVal
                    };
                });
            });
        });

        return pos;
    }, [nodes, macroTopics]);

    // Choose positions based on mode
    const nodePositions = viewMode === 'global' ? globalNodePositions : chapterNodePositions;

    // Filter edges to draw
    const visibleEdges = useMemo(() => {
        if (viewMode === 'global') {
            return edges;
        } else {
            // Draw only edges belonging to this topic (both from & to must be in selected topic)
            const topicNodeIds = nodes.filter(n => n.macroTopic === selectedTopic).map(n => n.id);
            return edges.filter(e => topicNodeIds.includes(e.from) && topicNodeIds.includes(e.to));
        }
    }, [edges, nodes, selectedTopic, viewMode]);

    // Filter nodes to draw
    const visibleNodes = useMemo(() => {
        if (viewMode === 'global') {
            return nodes;
        } else {
            return nodes.filter(n => n.macroTopic === selectedTopic);
        }
    }, [nodes, selectedTopic, viewMode]);

    // Topic completion stats
    const topicStats = useMemo(() => {
        const stats = {};
        macroTopics.forEach(topic => {
            const topicNodes = nodes.filter(n => n.macroTopic === topic);
            const completed = topicNodes.filter(n => completedNodes.includes(n.id)).length;
            stats[topic] = {
                completed,
                total: topicNodes.length,
                isCompleted: topicNodes.length > 0 && completed === topicNodes.length
            };
        });
        return stats;
    }, [nodes, macroTopics, completedNodes]);

    return (
        <div className="mappa-2d-page">
            <header className="mappa-2d-header">
                <button className="btn-back" onClick={() => navigate('/')}>
                    <ArrowLeft size={18} />
                    <span>Torna alla Home</span>
                </button>
                <div className="title-area">
                    <h1>Mappe Concettuali 2D</h1>
                    <p className="subtitle">{activeProjectDetail.name} • Visualizzazione Bidimensionale</p>
                </div>
            </header>

            <div className="mappa-2d-layout">
                {/* Left Sidebar for chapter selection & view modes */}
                <div className="mappa-2d-sidebar glass-panel">
                    <div className="sidebar-section">
                        <h3>Modalità Visualizzazione</h3>
                        <div className="view-mode-buttons">
                            <button 
                                className={`mode-btn ${viewMode === 'chapter' ? 'active' : ''}`}
                                onClick={() => setViewMode('chapter')}
                            >
                                Vista Capitolo
                            </button>
                            <button 
                                className={`mode-btn ${viewMode === 'global' ? 'active' : ''} ${!isSubjectCompleted ? 'disabled' : ''}`}
                                onClick={() => {
                                    if (isSubjectCompleted) {
                                        setViewMode('global');
                                    }
                                }}
                                title={!isSubjectCompleted ? "Completa l'esame per sbloccare la vista globale collegata" : "Esplora la mappa completa delle relazioni"}
                            >
                                {!isSubjectCompleted && <Lock size={14} style={{ marginRight: 6 }} />}
                                Vista Globale
                            </button>
                        </div>
                    </div>

                    {viewMode === 'chapter' && (
                        <div className="sidebar-section">
                            <h3>Capitoli</h3>
                            <div className="topics-list">
                                {macroTopics.map(topic => {
                                    const stats = topicStats[topic];
                                    const isSelected = selectedTopic === topic;
                                    return (
                                        <button
                                            key={topic}
                                            className={`topic-selector-btn ${isSelected ? 'selected' : ''}`}
                                            onClick={() => setSelectedTopic(topic)}
                                        >
                                            <div className="topic-name-wrap">
                                                <span className="topic-name">{topic}</span>
                                                {stats?.isCompleted && <CheckCircle size={14} className="completion-check" />}
                                            </div>
                                            <div className="topic-prog-bar">
                                                <div 
                                                    className="topic-prog-fill" 
                                                    style={{ width: `${stats ? (stats.completed / stats.total) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {isSubjectCompleted ? (
                        <div className="sidebar-section completion-badge-card">
                            <Award className="gold-award" size={40} />
                            <h4>Materia Completata!</h4>
                            <p>Tutti i concetti e le relazioni sono stati acquisiti con successo. Ora puoi esplorare il grafo globale 2D ed il modello 3D interattivo.</p>
                            <button className="btn-primary" onClick={() => navigate('/synapsia')} style={{ marginTop: 12, width: '100%' }}>
                                Apri Mappa 3D
                            </button>
                        </div>
                    ) : (
                        <div className="sidebar-section completion-badge-card locked">
                            <Lock size={32} className="lock-icon" />
                            <h4>Mappa 3D Bloccata</h4>
                            <p>Completa tutti i capitoli rispondendo alle domande di Blobb per sbloccare la mappa globale delle relazioni ed il cervello 3D.</p>
                        </div>
                    )}
                </div>

                {/* Main Interactive Map Area */}
                <div className="mappa-2d-canvas-container glass-panel">
                    {viewMode === 'global' ? (
                        <Mappa3DCanvas 
                            nodes={nodes}
                            edges={edges}
                            macroTopics={macroTopics}
                            completedNodes={completedNodes}
                            completedEdges={completedEdges}
                        />
                    ) : (
                        <div 
                            className="canvas-wrapper"
                            ref={containerRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                        >
                            {/* 2D Canvas HUD Controls */}
                            <div className="canvas-hud-controls">
                                <span className="hud-hint">Trascina per spostare • Rotella per zoomare</span>
                                <div className="hud-buttons">
                                    <span className="zoom-percentage">{Math.round(zoom * 100)}%</span>
                                    <button className="hud-btn-reset" onClick={resetView} title="Ripristina Vista">
                                        Reset Vista
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

                                        return (
                                            <line
                                                key={idx}
                                                x1={`${start.x}%`}
                                                y1={`${start.y}%`}
                                                x2={`${end.x}%`}
                                                y2={`${end.y}%`}
                                                className={`canvas-edge ${isCompleted ? 'completed' : 'locked'} ${isHovered ? 'hovered' : ''}`}
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
                                    const label = getEdgeLabel(edge.from, edge.to, edge.description);

                                    return (
                                        <div
                                            key={`label-${idx}`}
                                            className={`edge-label-badge ${isCompleted ? 'completed' : 'locked'} ${isHovered ? 'hovered' : ''}`}
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

                                    const shapeClass = node.type === 'hub' ? 'ellipse' : node.abstractionLevel === 4 ? 'hexagon' : node.abstractionLevel === 3 ? 'rounded' : 'rectangle';

                                    return (
                                        <div
                                            key={node.id}
                                            className={`canvas-node-card node-shape-${shapeClass} ${isCompleted ? 'completed' : 'locked'} ${isNodeHovered ? 'active' : ''} ${isConnectedToHovered ? 'connected' : ''}`}
                                            style={{
                                                left: `${pos.x}%`,
                                                top: `${pos.y}%`,
                                            }}
                                            onMouseEnter={() => setHoveredNode(node.id)}
                                            onMouseLeave={() => setHoveredNode(null)}
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
                    )}

                    <div className="canvas-footer">
                        <div className="legend-items">
                            <div className="legend-item"><span className="legend-shape shape-ellipse" /> Caposaldo (Hub)</div>
                            <div className="legend-item"><span className="legend-shape shape-hexagon" /> Intermedio Alto</div>
                            <div className="legend-item"><span className="legend-shape shape-rounded" /> Intermedio Basso</div>
                            <div className="legend-item"><span className="legend-shape shape-rectangle" /> Dettaglio (Foglia)</div>
                            <div className="legend-item"><span className="line completed" /> Relazione Acquisita</div>
                            <div className="legend-item"><span className="line locked" /> Relazione Bloccata</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Search, Brain, ChevronRight, X, ExternalLink, FileText, BookOpen, TrendingUp, HelpCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Blobb3D from '../components/Blobb3D';
import { MOCK_COMPLETED_SUBJECTS } from '../data/mockData';
import './SynapsiaMap.css';

// Dynamic theme colors mapping for 3D Map elements
const MAP_COLORS_BY_THEME = {
    calcite: { hub: '#c49b6d', intermediate: '#d8bfa5', leaf: '#f0e5d8', edge: '#d4a373', brainBg: '#f8f9fa' },
    abisso: { hub: '#4a7ca1', intermediate: '#8cb2cc', leaf: '#d0e1ed', edge: '#4a7ca1', brainBg: '#f0f4f8' },
    ambra: { hub: '#b06d4b', intermediate: '#cca28c', leaf: '#f0dfd5', edge: '#b06d4b', brainBg: '#faf7f5' },
    foresta: { hub: '#4a8060', intermediate: '#8cbd9f', leaf: '#cee8d9', edge: '#4a8060', brainBg: '#f2f6f3' },
    lavanda: { hub: '#7d639c', intermediate: '#b3a1cc', leaf: '#ebdff5', edge: '#7d639c', brainBg: '#f5f3f7' },
    cemento: { hub: '#757580', intermediate: '#a6a6b2', leaf: '#e3e3e8', edge: '#757580', brainBg: '#f3f3f5' }
};

// Anatomical brain lobes mapping
const LOBES = [
    { name: "Lobo Frontale (Anteriore)", center: [0, 0.5, 4.2], color: "#48cae4", description: "Sede delle funzioni cognitive complesse, del ragionamento astratto e dell'apprendimento attivo." },
    { name: "Lobo Parietale (Superiore)", center: [0, 2.8, 0], color: "#ffd166", description: "Associa le informazioni sensoriali e concettuali in un unico quadro di sintesi spaziale." },
    { name: "Lobo Occipitale (Posteriore)", center: [0, 0.5, -4.2], color: "#ff758f", description: "Sede della corteccia visiva, elabora la memoria spaziale e visiva dei concetti." },
    { name: "Cervelletto (Inferiore)", center: [0, -2.8, -1], color: "#f59f00", description: "Preposto al consolidamento delle memorie associative e dei flussi logici rapidi." },
    { name: "Lobo Temporale Sinistro", center: [-3.2, 0.2, 0], color: "#52b788", description: "Centro dell'elaborazione del linguaggio, della semantica e della memorizzazione verbale." },
    { name: "Lobo Temporale Destro", center: [3.2, 0.2, 0], color: "#7950f2", description: "Associato alla creatività neurale, all'intuito e all'integrazione trans-materia." }
];
// Fallback Mock Data for Demo mode has been removed and is now imported from mockData.js

// Particles representing the brain volume structure (Glass Brain)
function BrainVolumePlaceholder({ highlightZone }) {
    const particlesRef = useRef();
    const highlightParticlesRef = useRef();
    
    const { allPositions, zonePositions } = useMemo(() => {
        const positions = [];
        // Generate a detailed point cloud representing a double-lobed brain structure
        for (let i = 0; i < 2000; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const r = 5.2 + Math.random() * 1.6;
            
            let x = r * Math.sin(phi) * Math.cos(theta);
            let y = (r * 0.72) * Math.sin(phi) * Math.sin(theta);
            let z = (r * 1.22) * Math.cos(phi);
            
            // Push towards two hemispheres
            if (Math.abs(x) < 0.8) {
                x += (x > 0 ? 0.7 : -0.7);
            }
            positions.push({ x, y, z });
        }

        // Segment particles into the 6 lobes
        const zones = [
            positions.filter(p => p.z > 2.0),                                       // Zone 0: Frontal Lobe
            positions.filter(p => p.y > 1.2 && Math.abs(p.z) <= 2.0),               // Zone 1: Parietal Lobe
            positions.filter(p => p.z < -2.0 && p.y >= -1.0),                       // Zone 2: Occipital Lobe
            positions.filter(p => p.y < -1.2 && p.z < 0),                           // Zone 3: Cerebellum
            positions.filter(p => p.x < 0 && Math.abs(p.z) <= 2.0 && p.y <= 1.2),   // Zone 4: Left Temporal
            positions.filter(p => p.x >= 0 && Math.abs(p.z) <= 2.0 && p.y <= 1.2)   // Zone 5: Right Temporal
        ];

        const allArr = [];
        positions.forEach(p => allArr.push(p.x, p.y, p.z));

        const zoneArrs = zones.map(zone => {
            const arr = [];
            zone.forEach(p => arr.push(p.x, p.y, p.z));
            return new Float32Array(arr);
        });

        return {
            allPositions: new Float32Array(allArr),
            zonePositions: zoneArrs
        };
    }, []);

    useFrame((state) => {
        const rotationY = state.clock.getElapsedTime() * 0.015;
        if (particlesRef.current) {
            particlesRef.current.rotation.y = rotationY;
        }
        if (highlightParticlesRef.current) {
            highlightParticlesRef.current.rotation.y = rotationY;
        }
    });

    const highlightGeometry = useMemo(() => {
        if (highlightZone === null || highlightZone === undefined || highlightZone < 0 || highlightZone > 5) return null;
        const geom = new THREE.BufferGeometry();
        const pts = zonePositions[highlightZone];
        if (!pts || pts.length === 0) return null;
        geom.setAttribute('position', new THREE.BufferAttribute(pts, 3));
        return geom;
    }, [highlightZone, zonePositions]);

    return (
        <group>
            {/* Base Brain Structure */}
            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={allPositions.length / 3}
                        array={allPositions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.14}
                    color="#475569"
                    transparent
                    opacity={0.22}
                    blending={THREE.NormalBlending}
                    depthWrite={false}
                />
            </points>

            {/* Glowing Active Lobe */}
            {highlightGeometry && (
                <points ref={highlightParticlesRef} geometry={highlightGeometry}>
                    <pointsMaterial
                        size={0.17}
                        color={LOBES[highlightZone].color}
                        transparent
                        opacity={0.55}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </points>
            )}
        </group>
    );
}

// Draw connection line in 3D with a travelling pulse (signal) to show direction of flow
function ConnectionLine({ start, end, color, opacity = 0.35, animate = false }) {
    const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
    const pulseRef = useRef();

    useFrame((state) => {
        if (pulseRef.current && animate) {
            // Speed of the pulse: cycles every 2 seconds
            const speed = 0.45;
            const t = (state.clock.getElapsedTime() * speed) % 1.0;
            // Linear interpolation between start and end
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

// Renders the 3D nodes (macro and microtopics) inside their active lobes
function LobeNodes({ 
    activeSubjectId, 
    subjectLobeMap, 
    nodes3D, 
    edges3D, 
    onSelectNode, 
    onSelectMacro,
    selectedNodeId,
    selectedMacroName
}) {
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current) {
            // Very slow rotation to give life to the network
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.015;
        }
    });

    // We display active subject's nodes, and also target nodes of inter-subject synapses
    const renderedNodes = useMemo(() => {
        const activeCrossNodes = new Set();
        if (activeSubjectId) {
            edges3D.forEach(edge => {
                if (edge.isCrossSubject && (edge.fromProjId === activeSubjectId || edge.toProjId === activeSubjectId)) {
                    activeCrossNodes.add(edge.from);
                    activeCrossNodes.add(edge.to);
                }
            });
        }

        return nodes3D.map(node => {
            const isFromActiveSubject = node.projectId === activeSubjectId;
            const isCrossConnected = activeCrossNodes.has(node.id);
            const isVisible = !activeSubjectId || isFromActiveSubject || isCrossConnected;
            return {
                ...node,
                visible: isVisible,
                opacity: activeSubjectId ? (isFromActiveSubject ? 1.0 : (isCrossConnected ? 0.45 : 0.05)) : 0.5
            };
        });
    }, [nodes3D, edges3D, activeSubjectId]);

    const renderedEdges = useMemo(() => {
        return edges3D.map((edge, idx) => {
            if (edge.isCrossSubject) {
                const isRelevant = !activeSubjectId || edge.fromProjId === activeSubjectId || edge.toProjId === activeSubjectId;
                return {
                    ...edge,
                    id: `edge_${idx}`,
                    visible: isRelevant,
                    opacity: activeSubjectId ? (isRelevant ? 0.85 : 0.01) : 0.45
                };
            }
            const isFromActiveSubject = !activeSubjectId || edge.projectId === activeSubjectId;
            return {
                ...edge,
                id: `edge_${idx}`,
                visible: isFromActiveSubject,
                opacity: activeSubjectId ? (isFromActiveSubject ? 0.6 : 0.02) : 0.25
            };
        });
    }, [edges3D, activeSubjectId]);

    // Group active nodes by macrotopic to show macrotopic spheres
    const activeMacrotopicSpheres = useMemo(() => {
        if (!activeSubjectId) return [];
        const activeNodes = nodes3D.filter(n => n.projectId === activeSubjectId);
        const uniqueMacros = [...new Set(activeNodes.map(n => n.macroTopic))];
        
        const lobeInfo = subjectLobeMap[activeSubjectId];
        if (!lobeInfo) return [];
        
        return uniqueMacros.map((macro, idx) => {
            // Find centroid of nodes in this macrotopic
            const macroNodes = activeNodes.filter(n => n.macroTopic === macro);
            let sumX = 0, sumY = 0, sumZ = 0;
            macroNodes.forEach(n => {
                sumX += n.position[0];
                sumY += n.position[1];
                sumZ += n.position[2];
            });
            const count = macroNodes.length || 1;
            const centroid = [sumX / count, sumY / count, sumZ / count];
            
            // Adjust centroid slightly to be offset and act as a hub
            centroid[1] += 0.5; // shift up slightly

            return {
                name: macro,
                position: centroid,
                color: lobeInfo.color,
                nodes: macroNodes
            };
        });
    }, [nodes3D, activeSubjectId, subjectLobeMap]);

    return (
        <group ref={groupRef}>
            {/* Draw active subject's macrotopic hubs */}
            {activeSubjectId && activeMacrotopicSpheres.map((macro, idx) => {
                const isSelected = selectedMacroName === macro.name;
                return (
                    <group key={`macro_${idx}`} position={macro.position}>
                        <mesh onClick={(e) => { e.stopPropagation(); onSelectMacro(macro.name); }}>
                            <sphereGeometry args={[0.3, 32, 32]} />
                            <meshBasicMaterial 
                                color={isSelected ? '#ffffff' : macro.color} 
                                transparent 
                                opacity={0.9} 
                            />
                        </mesh>
                        <mesh scale={1.6}>
                            <sphereGeometry args={[0.3, 16, 16]} />
                            <meshBasicMaterial 
                                color={macro.color} 
                                transparent 
                                opacity={isSelected ? 0.35 : 0.15} 
                                depthWrite={false} 
                            />
                        </mesh>
                        {/* Macrotopic Text Label */}
                        <Html distanceFactor={8} position={[0, 0.45, 0]} center>
                            <div className={`macro-3d-label ${isSelected ? 'active' : ''}`}>
                                {macro.name}
                            </div>
                        </Html>
                        
                        {/* Lines from Macrotopic hub to its microtopics */}
                        {macro.nodes.map((node, nidx) => {
                            // Local start relative to macro hub is 0,0,0. Local end relative to macro hub:
                            const localNodePos = [
                                node.position[0] - macro.position[0],
                                node.position[1] - macro.position[1],
                                node.position[2] - macro.position[2]
                            ];
                            return (
                                <ConnectionLine 
                                    key={`macro_to_node_${nidx}`}
                                    start={[0, 0, 0]} 
                                    end={localNodePos} 
                                    color={macro.color} 
                                    opacity={isSelected ? 0.7 : 0.3}
                                    animate={node.visible}
                                />
                            );
                        })}
                    </group>
                );
            })}

            {/* Draw individual concept nodes */}
            {renderedNodes.map((node) => {
                if (!node.visible && activeSubjectId) return null;
                const isSelected = selectedNodeId === node.id;
                
                // Color mapping based on node type
                let color = node.lobeColor;
                if (node.type === 'hub') color = '#ffd166';
                else if (node.type === 'intermediate') color = '#a6a6b2';
                
                return (
                    <group key={node.id} position={node.position}>
                        <mesh onClick={(e) => { e.stopPropagation(); onSelectNode(node); }}>
                            <sphereGeometry args={[node.type === 'hub' ? 0.16 : 0.1, 16, 16]} />
                            <meshBasicMaterial 
                                color={isSelected ? '#ffffff' : color} 
                                transparent 
                                opacity={node.opacity} 
                            />
                        </mesh>
                        {isSelected && (
                            <mesh scale={2.0}>
                                <sphereGeometry args={[0.1, 16, 16]} />
                                <meshBasicMaterial 
                                    color="#ffffff" 
                                    transparent 
                                    opacity={0.3} 
                                    depthWrite={false} 
                                />
                            </mesh>
                        )}
                        {/* Show tiny labels for active nodes on hover/select */}
                        {isSelected && (
                            <Html distanceFactor={6} position={[0, 0.25, 0]} center>
                                <div className="micro-3d-label">
                                    {node.label}
                                </div>
                            </Html>
                        )}
                    </group>
                );
            })}

            {/* Draw conceptual lines (edges) */}
            {renderedEdges.map((edge) => {
                if (!edge.visible && activeSubjectId) return null;
                return (
                    <ConnectionLine 
                        key={edge.id}
                        start={edge.fromPos}
                        end={edge.toPos}
                        color={edge.lobeColor}
                        opacity={edge.opacity}
                        animate={edge.visible}
                    />
                );
            })}
        </group>
    );
}

// CameraController translates camera position smoothly when target changes
function CameraController({ targetPos, targetLook, controlsRef }) {
    const { camera } = useThree();
    const lastTargetPosRef = useRef(targetPos);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (
            targetPos[0] !== lastTargetPosRef.current[0] ||
            targetPos[1] !== lastTargetPosRef.current[1] ||
            targetPos[2] !== lastTargetPosRef.current[2]
        ) {
            lastTargetPosRef.current = targetPos;
            setIsTransitioning(true);
        }
    }, [targetPos]);

    useFrame(() => {
        if (controlsRef.current && isTransitioning) {
            const controls = controlsRef.current;
            const targetVec = new THREE.Vector3(...targetPos);
            const targetLookVec = new THREE.Vector3(...targetLook);

            camera.position.lerp(targetVec, 0.06);
            controls.target.lerp(targetLookVec, 0.06);
            controls.update();

            // End transition when close to let the user zoom/rotate freely
            if (camera.position.distanceTo(targetVec) < 0.15 && controls.target.distanceTo(targetLookVec) < 0.15) {
                setIsTransitioning(false);
            }
        }
    });

    return null;
}

export default function SynapsiaMap() {
    const { theme, projects, activeProjectId, selectProject, fetchWithAuth } = useApp();
    
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [completedDetails, setCompletedDetails] = useState({});
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    
    // Detailed stats panels state
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedMacro, setSelectedMacro] = useState(null);

    // Chat with Blobb states
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatPosition, setChatPosition] = useState({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });

    const handleHeaderMouseDown = (e) => {
        if (e.button !== 0) return;
        if (e.target.closest('.chat-close-btn')) return;

        isDraggingRef.current = true;
        dragStartRef.current = {
            x: e.clientX - chatPosition.x,
            y: e.clientY - chatPosition.y
        };

        const handleMouseMove = (moveEvent) => {
            if (!isDraggingRef.current) return;
            const newX = moveEvent.clientX - dragStartRef.current.x;
            const newY = moveEvent.clientY - dragStartRef.current.y;
            setChatPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const [chatMessages, setChatMessages] = useState([
        { 
            sender: 'blobb', 
            text: 'Ciao! Sono Blobb, il tuo compagno di studio. 🧠 Chiedimi pure qualsiasi cosa sulle materie che hai completato! Risponderò attingendo dalle tue mappe e citando le fonti originali.',
            state: 'dance'
        }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [chatBlobbState, setChatBlobbState] = useState('dance');

    const handleSendChatMessage = async (e) => {
        if (e) e.preventDefault();
        if (!chatInput.trim() || isChatLoading) return;

        const userMsg = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { sender: 'student', text: userMsg }]);
        setIsChatLoading(true);
        setChatBlobbState('curious');

        // Extract completed subjects context
        const completedSubjectsContext = Object.values(completedDetails).map(detail => ({
            name: detail.name,
            nodes: (detail.conceptMap?.nodes || []).map(n => ({
                label: n.label,
                description: n.description
            }))
        }));

        try {
            const res = await fetchWithAuth('/chat-blobb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: userMsg,
                    completedSubjects: completedSubjectsContext
                })
            });

            if (res.ok) {
                const data = await res.json();
                const cleanAnswer = data.answer || "Non sono riuscito a trovare una risposta adeguata.";
                
                // Determine Mascot expression based on the response content
                let finalState = 'idle';
                if (cleanAnswer.toLowerCase().includes('scusa') || cleanAnswer.toLowerCase().includes('non ho trovato') || cleanAnswer.toLowerCase().includes('non ho appreso')) {
                    finalState = 'skeptical';
                } else if (cleanAnswer.toLowerCase().includes('trovato') || cleanAnswer.toLowerCase().includes('sinapsi')) {
                    finalState = 'dance';
                }

                setChatMessages(prev => [...prev, { 
                    sender: 'blobb', 
                    text: cleanAnswer,
                    state: finalState
                }]);
                setChatBlobbState(finalState);
            } else {
                throw new Error("Errore durante la comunicazione con Blobb");
            }
        } catch (err) {
            console.error(err);
            setChatMessages(prev => [...prev, { 
                sender: 'blobb', 
                text: "Ops! Si è verificato un piccolo errore di rete nelle mie sinapsi gelatinose. Riprova tra un attimo! 🔌",
                state: 'skeptical'
            }]);
            setChatBlobbState('skeptical');
        } finally {
            setIsChatLoading(false);
        }
    };

    const renderMessageContent = (text) => {
        const regex = /\[([^\]]+)\]/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }
            const fileName = match[1];
            parts.push(
                <span key={match.index} className="source-file-badge">
                    <FileText size={12} style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline' }} />
                    {fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`}
                </span>
            );
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        if (parts.length === 0) return text;
        return parts;
    };

    // Orbit controls reference for fly-to transitions
    const controlsRef = useRef();

    // 1. Filter completed subjects (100% progress)
    const completedProjects = useMemo(() => {
        const completed = projects.filter(p => p.totalNodes > 0 && p.completedNodes === p.totalNodes);
        
        // If there are no completed projects, and the user hasn't explicitly disabled demo, default to demo mode
        if (completed.length === 0 && Object.keys(completedDetails).length === 0) {
            // Enable demo mode data
            return Object.values(MOCK_COMPLETED_SUBJECTS)
                .filter(s => {
                    if (s.id === 'mock_tiga') {
                        const stored = localStorage.getItem('synapsia_tiga_completed_nodes');
                        if (stored) {
                            return JSON.parse(stored).length === 17;
                        }
                        return false;
                    }
                    return true;
                })
                .map(s => ({
                    id: s.id,
                    name: s.name,
                    totalNodes: s.totalNodes,
                    completedNodes: s.totalNodes,
                    macroTopics: s.conceptMap.macroTopics
                }));
        }
        return completed;
    }, [projects, completedDetails]);

    // Check if we are running in Mock/Demo mode
    const isMock = useMemo(() => {
        const userCompleted = projects.filter(p => p.totalNodes > 0 && p.completedNodes === p.totalNodes);
        return userCompleted.length === 0 || isDemoMode;
    }, [projects, isDemoMode]);

    // Load detailed concept maps for completed subjects
    useEffect(() => {
        const fetchAllCompletedDetails = async () => {
            // If in mock mode, load the static templates
            if (isMock) {
                const detailsMap = { ...MOCK_COMPLETED_SUBJECTS };
                const storedNodes = localStorage.getItem('synapsia_tiga_completed_nodes');
                const storedEdges = localStorage.getItem('synapsia_tiga_completed_edges');
                const isTigaCompleted = storedNodes && JSON.parse(storedNodes).length === 17;
                
                if (isTigaCompleted) {
                    detailsMap['mock_tiga'] = {
                        ...MOCK_COMPLETED_SUBJECTS['mock_tiga'],
                        completedNodes: JSON.parse(storedNodes),
                        completedEdges: JSON.parse(storedEdges)
                    };
                } else {
                    delete detailsMap['mock_tiga'];
                }
                setCompletedDetails(detailsMap);
                return;
            }

            const completed = projects.filter(p => p.totalNodes > 0 && p.completedNodes === p.totalNodes);
            if (completed.length === 0) return;

            setLoadingDetails(true);
            const detailsMap = {};
            try {
                await Promise.all(completed.map(async (p) => {
                    if (p.id.startsWith('mock_')) {
                        if (p.id === 'mock_tiga') {
                            const storedNodes = localStorage.getItem('synapsia_tiga_completed_nodes');
                            const storedEdges = localStorage.getItem('synapsia_tiga_completed_edges');
                            detailsMap[p.id] = {
                                ...MOCK_COMPLETED_SUBJECTS[p.id],
                                completedNodes: storedNodes ? JSON.parse(storedNodes) : MOCK_COMPLETED_SUBJECTS[p.id].completedNodes,
                                completedEdges: storedEdges ? JSON.parse(storedEdges) : MOCK_COMPLETED_SUBJECTS[p.id].conceptMap.edges.map(e => `${e.from}_to_${e.to}`)
                            };
                        } else {
                            detailsMap[p.id] = MOCK_COMPLETED_SUBJECTS[p.id];
                        }
                        return;
                    }
                    const cached = localStorage.getItem(`synapsia_project_${p.id}`);
                    if (cached) {
                        detailsMap[p.id] = JSON.parse(cached);
                    } else {
                        const res = await fetchWithAuth(`/project/${p.id}`);
                        if (res.ok) {
                            const data = await res.json();
                            detailsMap[p.id] = data;
                            localStorage.setItem(`synapsia_project_${p.id}`, JSON.stringify(data));
                        }
                    }
                }));
                setCompletedDetails(detailsMap);
            } catch (err) {
                console.error("Errore nel recupero dettagli materie concluse:", err);
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchAllCompletedDetails();
    }, [projects, isMock]);

    // 2. Precalculate 3D positions inside the designated brain lobes
    const { nodes3D, edges3D, subjectLobeMap } = useMemo(() => {
        const nodes = [];
        const edges = [];
        const lobeMap = {};
        
        completedProjects.forEach((proj, projIdx) => {
            const detail = completedDetails[proj.id];
            if (!detail || !detail.conceptMap) return;

            const lobeIdx = projIdx % 6;
            const lobe = LOBES[lobeIdx];
            lobeMap[proj.id] = { lobeIdx, center: lobe.center, color: lobe.color, name: lobe.name };

            const conceptMap = detail.conceptMap;
            const projectNodes = conceptMap.nodes || [];
            const projectEdges = conceptMap.edges || [];

            // Distribute macrotopic centers deterministically around the lobe center
            const macroTopics = conceptMap.macroTopics || [];
            const macroCenters = {};

            macroTopics.forEach((topic, tIdx) => {
                const angle = (tIdx / macroTopics.length) * Math.PI * 2 + (projIdx * 0.5);
                const radius = 1.3;
                const mx = lobe.center[0] + Math.cos(angle) * radius;
                const my = lobe.center[1] + Math.sin(tIdx * 3) * 0.3;
                const mz = lobe.center[2] + Math.sin(angle) * radius;
                macroCenters[topic] = [mx, my, mz];
            });

            // Distribute microtopic nodes in clusters around their macrotopic center
            const nodePositions = {};
            projectNodes.forEach((node, nIdx) => {
                const mCenter = macroCenters[node.macroTopic] || lobe.center;
                
                // Deterministic coordinates based on node ID hash to prevent recalculation jumping
                const seed = node.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const angle = (seed % 100 / 100) * Math.PI * 2;
                const radius = 0.55 + (seed % 5) * 0.08;
                
                // Map the Y coordinate (height) directly to the level of abstraction (Y-axis abstractionLevel)
                const heightOffset = (node.abstractionLevel - 3) * 0.65; // Y=5: +1.3, Y=1: -1.3
                const nx = mCenter[0] + Math.cos(angle) * radius;
                const ny = mCenter[1] + heightOffset + Math.sin(seed) * 0.04;
                const nz = mCenter[2] + Math.sin(angle) * radius;

                nodePositions[node.id] = [nx, ny, nz];
                nodes.push({
                    ...node,
                    projectId: proj.id,
                    subjectName: proj.name,
                    position: [nx, ny, nz],
                    lobeColor: lobe.color,
                    lobeName: lobe.name
                });
            });

            // Map edges (lines)
            projectEdges.forEach((edge) => {
                const fromPos = nodePositions[edge.from];
                const toPos = nodePositions[edge.to];
                if (fromPos && toPos) {
                    edges.push({
                        ...edge,
                        projectId: proj.id,
                        fromPos,
                        toPos,
                        lobeColor: lobe.color
                    });
                }
            });
        });

        // Add Z-axis cross-subject connections
        const CROSS_SUBJECT_LINKS = [
            { from: "caso_nokia", to: "caso_netflix_blockbuster", description: "Inerzia strategica e cecità di fronte alle disruption tecnologiche." },
            { from: "lewin_force_field", to: "value_prop_pains", description: "Allineamento tra forze inibitrici e rimedi per i Pains del cliente." },
            { from: "path_dependence", to: "gillette_ip_lockin", description: "Il lock-in tecnologico e commerciale basato su dipendenza da percorso." },
            { from: "greiner_burocracy_crisis", to: "caso_lego_factory", description: "Superare la crisi burocratica mediante la co-creazione e modelli a piattaforma." },
            { from: "resistenza_cambiamento", to: "resistance_to_change", description: "L'introduzione di sistemi IT trasversali richiede di mitigare le resistenze organizzative." },
            { from: "integrazione_informativa", to: "business_model_canvas", description: "La digitalizzazione dei flussi integra le attività chiave del modello di business." }
        ];

        CROSS_SUBJECT_LINKS.forEach(link => {
            const fromNode = nodes.find(n => n.id === link.from);
            const toNode = nodes.find(n => n.id === link.to);
            if (fromNode && toNode) {
                edges.push({
                    ...link,
                    isCrossSubject: true,
                    fromProjId: fromNode.projectId,
                    toProjId: toNode.projectId,
                    fromPos: fromNode.position,
                    toPos: toNode.position,
                    lobeColor: "#a78bfa" // glowing purple/violet
                });
            }
        });

        return { nodes3D: nodes, edges3D: edges, subjectLobeMap: lobeMap };
    }, [completedProjects, completedDetails]);

    // 3. Dynamic camera flight controls
    const activeProjectInfo = useMemo(() => {
        if (!activeProjectId) return null;
        return subjectLobeMap[activeProjectId] || null;
    }, [activeProjectId, subjectLobeMap]);

    const cameraTargets = useMemo(() => {
        // Default idle camera: centered, rotated out
        if (!activeProjectInfo) {
            return {
                position: [0, 0, 16],
                lookAt: [0, 0, 0]
            };
        }
        
        // Active subject view: zoom in above the lobe center
        const C = activeProjectInfo.center;
        return {
            position: [C[0] * 2.1, C[1] * 2.1 + 3.0, C[2] * 2.1 + 5.5],
            lookAt: C
        };
    }, [activeProjectInfo]);

    // 4. Inter-Subject Connection Mapper
    // Scans other completed subjects to find nodes with matching labels
    const getInterSubjectConnectionsForNode = (node) => {
        if (!node) return [];
        const label = node.label.toLowerCase();
        
        const connections = [];
        Object.entries(completedDetails).forEach(([projId, detail]) => {
            if (projId === node.projectId) return; // skip same subject
            
            const matches = (detail.conceptMap?.nodes || []).filter(n => 
                n.label.toLowerCase() === label ||
                n.label.toLowerCase().includes(label) ||
                label.includes(n.label.toLowerCase())
            );

            matches.forEach(match => {
                connections.push({
                    projectId: projId,
                    projectName: detail.name,
                    nodeId: match.id,
                    nodeLabel: match.label,
                    macroTopic: match.macroTopic
                });
            });
        });

        // Add explicit semantic Z-axis connections
        const CROSS_SUBJECT_LINKS = [
            { from: "caso_nokia", to: "caso_netflix_blockbuster", description: "Inerzia strategica e cecità di fronte alle disruption tecnologiche." },
            { from: "lewin_force_field", to: "value_prop_pains", description: "Allineamento tra forze inibitrici e rimedi per i Pains del cliente." },
            { from: "path_dependence", to: "gillette_ip_lockin", description: "Il lock-in tecnologico e commerciale basato su dipendenza da percorso." },
            { from: "greiner_burocracy_crisis", to: "caso_lego_factory", description: "Superare la crisi burocratica mediante la co-creazione e modelli a piattaforma." },
            { from: "resistenza_cambiamento", to: "resistance_to_change", description: "L'introduzione di sistemi IT trasversali richiede di mitigare le resistenze organizzative." },
            { from: "integrazione_informativa", to: "business_model_canvas", description: "La digitalizzazione dei flussi integra le attività chiave del modello di business." }
        ];

        CROSS_SUBJECT_LINKS.forEach(link => {
            if (link.from === node.id || link.to === node.id) {
                const targetId = link.from === node.id ? link.to : link.from;
                Object.entries(completedDetails).forEach(([projId, detail]) => {
                    if (projId === node.projectId) return;
                    const match = (detail.conceptMap?.nodes || []).find(n => n.id === targetId);
                    if (match && !connections.some(c => c.nodeId === match.id)) {
                        connections.push({
                            projectId: projId,
                            projectName: detail.name,
                            nodeId: match.id,
                            nodeLabel: match.label,
                            macroTopic: match.macroTopic,
                            description: link.description
                        });
                    }
                });
            }
        });

        return connections;
    };

    const activeNodeConnections = useMemo(() => {
        return getInterSubjectConnectionsForNode(selectedNode);
    }, [selectedNode, completedDetails]);

    const activeMacroConnections = useMemo(() => {
        if (!selectedMacro || !activeProjectId) return [];
        const detail = completedDetails[activeProjectId];
        if (!detail) return [];

        const macroNodes = (detail.conceptMap?.nodes || []).filter(n => n.macroTopic === selectedMacro);
        const connections = [];

        macroNodes.forEach(node => {
            const nodeConns = getInterSubjectConnectionsForNode({ ...node, projectId: activeProjectId });
            nodeConns.forEach(c => {
                // Prevent duplicate subject listings
                if (!connections.some(conn => conn.projectId === c.projectId && conn.nodeLabel === c.nodeLabel)) {
                    connections.push(c);
                }
            });
        });

        return connections;
    }, [selectedMacro, activeProjectId, completedDetails]);

    // 5. Global Search Implementation
    // Searches macrotopics and microtopics across all active completed subjects
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results = [];

        completedProjects.forEach(proj => {
            const detail = completedDetails[proj.id];
            if (!detail) return;

            // Search macrotopics
            (detail.conceptMap?.macroTopics || []).forEach(macro => {
                if (macro.toLowerCase().includes(query)) {
                    results.push({
                        type: 'macrotopic',
                        name: macro,
                        subjectId: proj.id,
                        subjectName: proj.name,
                        display: `Macroargomento: ${macro} in "${proj.name}"`
                    });
                }
            });

            // Search microtopic nodes
            (detail.conceptMap?.nodes || []).forEach(node => {
                if (node.label.toLowerCase().includes(query)) {
                    results.push({
                        type: 'concept',
                        id: node.id,
                        name: node.label,
                        macroTopic: node.macroTopic,
                        subjectId: proj.id,
                        subjectName: proj.name,
                        display: `Concetto: ${node.label} (${proj.name} > ${node.macroTopic})`
                    });
                }
            });
        });

        setSearchResults(results.slice(0, 8)); // limit results to 8 suggestions
    }, [searchQuery, completedProjects, completedDetails]);

    // Handle search result click: focus camera and open details
    const handleSearchResultSelect = (result) => {
        selectProject(result.subjectId);
        setSearchQuery('');
        setSearchResults([]);
        setSelectedMacro(null);
        setSelectedNode(null);

        // Defer selection slightly to let project details load if not cached
        setTimeout(() => {
            if (result.type === 'macrotopic') {
                setSelectedMacro(result.name);
            } else {
                // Find node
                const fullNode = nodes3D.find(n => n.id === result.id && n.projectId === result.subjectId);
                if (fullNode) {
                    setSelectedNode(fullNode);
                } else {
                    // Fallback using loaded details
                    const detail = completedDetails[result.subjectId];
                    const nodeInfo = detail?.conceptMap?.nodes?.find(n => n.id === result.id);
                    if (nodeInfo) {
                        const lobe = subjectLobeMap[result.subjectId];
                        setSelectedNode({
                            ...nodeInfo,
                            projectId: result.subjectId,
                            subjectName: result.subjectName,
                            lobeColor: lobe?.color,
                            lobeName: lobe?.name,
                            position: [0, 0, 0] // dummy position
                        });
                    }
                }
            }
        }, 150);
    };

    // Filter projects based on left sidebar search
    const filteredProjects = useMemo(() => {
        return completedProjects;
    }, [completedProjects]);

    return (
        <div className="synapsia-map-container">
            {/* Unified Search Bar (Centered at the top) */}
            <div className="map-search-container animate-fade-in">
                <div className="map-search-input-wrapper">
                    <Search size={18} className="map-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Cerca concetti o macroargomenti nel tuo cervello..." 
                        className="map-search-input" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Dropdown Suggestions */}
                {searchResults.length > 0 && (
                    <div className="search-suggestions-dropdown glass-panel">
                        {searchResults.map((res, idx) => (
                            <div 
                                key={idx} 
                                className="search-suggestion-item"
                                onClick={() => handleSearchResultSelect(res)}
                            >
                                <Brain size={14} className="suggestion-icon" />
                                <div className="suggestion-text">
                                    <span className="suggestion-title">{res.name}</span>
                                    <span className="suggestion-subtitle">{res.display}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Left Subjects List Overlay */}
            <div className="subjects-list-overlay animate-fade-in">
                <div className="sidebar-header-title">
                    <Brain size={18} />
                    <h3>Materie Acquisite</h3>
                </div>

                {/* Demo mode banner if empty or toggled */}
                {isMock && (
                    <div className="demo-badge">
                        <TrendingUp size={12} />
                        <span>Modalità Dimostrativa</span>
                    </div>
                )}

                <div className="subjects-scrollable">
                    {filteredProjects.map((project) => {
                        const isSelected = project.id === activeProjectId;
                        const lobe = subjectLobeMap[project.id];
                        
                        return (
                            <div 
                                key={project.id} 
                                className={`subject-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                    if (isSelected) {
                                        // Toggle selection off to see global view
                                        selectProject(null);
                                        setSelectedNode(null);
                                        setSelectedMacro(null);
                                    } else {
                                        selectProject(project.id);
                                        setSelectedNode(null);
                                        setSelectedMacro(null);
                                    }
                                }}
                            >
                                <div 
                                    className="subject-icon-wrapper"
                                    style={{ 
                                        background: lobe ? `${lobe.color}20` : 'var(--accent-color)10',
                                        color: lobe ? lobe.color : 'var(--accent-color)'
                                    }}
                                >
                                    <Brain size={20} />
                                </div>
                                <div className="subject-info">
                                    <h4>{project.name}</h4>
                                    <span className="status">
                                        {lobe ? lobe.name : 'Mappa 3D Attiva'}
                                    </span>
                                </div>
                                <ChevronRight size={16} className="chevron-icon" style={{ marginLeft: 'auto', opacity: isSelected ? 0.8 : 0.3 }} />
                            </div>
                        );
                    })}
                </div>

                {/* Empty State Banner if not in demo and no user projects completed */}
                {projects.filter(p => p.totalNodes > 0 && p.completedNodes === p.totalNodes).length === 0 && !isDemoMode && (
                    <div className="empty-brain-hint glass-panel">
                        <p>Non hai ancora sbloccato mappe 3D. Completa le materie nell'Archivio superando i quiz di Blobb!</p>
                        <button 
                            className="btn-demo-trigger"
                            onClick={() => {
                                setIsDemoMode(true);
                                const detailsMap = { ...MOCK_COMPLETED_SUBJECTS };
                                const storedNodes = localStorage.getItem('synapsia_tiga_completed_nodes');
                                const storedEdges = localStorage.getItem('synapsia_tiga_completed_edges');
                                const isTigaCompleted = storedNodes && JSON.parse(storedNodes).length === 17;
                                if (isTigaCompleted) {
                                    detailsMap['mock_tiga'] = {
                                        ...MOCK_COMPLETED_SUBJECTS['mock_tiga'],
                                        completedNodes: JSON.parse(storedNodes),
                                        completedEdges: JSON.parse(storedEdges)
                                    };
                                } else {
                                    delete detailsMap['mock_tiga'];
                                }
                                setCompletedDetails(detailsMap);
                            }}
                        >
                            Esplora Mappa Demo
                        </button>
                    </div>
                )}

                {isDemoMode && (
                    <button 
                        className="btn-demo-exit"
                        onClick={() => {
                            setIsDemoMode(false);
                            // Reset details map to force refresh
                            setCompletedDetails({});
                            selectProject(null);
                            setSelectedNode(null);
                            setSelectedMacro(null);
                        }}
                    >
                        Torna ai Miei Esami
                    </button>
                )}
            </div>

            {/* Right Side Stats Panel (Opens when Node or Macro is selected) */}
            {(selectedNode || selectedMacro) && (
                <div className="stats-panel-overlay animate-slide-in glass-panel">
                    <button 
                        className="panel-close-btn"
                        onClick={() => {
                            setSelectedNode(null);
                            setSelectedMacro(null);
                        }}
                    >
                        <X size={18} />
                    </button>

                    {selectedNode ? (
                        // Concept Node stats panel
                        <div className="panel-scroll-content">
                            <div className="panel-header">
                                <span className="category-tag concept">Concetto Acquisito</span>
                                <h2 className="node-title">{selectedNode.label}</h2>
                                <p className="subject-subtitle">
                                    <BookOpen size={14} /> {selectedNode.subjectName}
                                </p>
                            </div>

                            <div className="panel-section">
                                <h3><FileText size={16} /> Definizione Unificata</h3>
                                <p className="definition-box">
                                    {completedDetails[selectedNode.projectId]?.answers?.[selectedNode.id]?.revised || 
                                     completedDetails[selectedNode.projectId]?.answers?.[selectedNode.id]?.original || 
                                     selectedNode.description ||
                                     "Nessuna descrizione memorizzata."}
                                </p>
                            </div>

                            <div className="panel-section">
                                <h3><TrendingUp size={16} /> Posizione Cognitiva</h3>
                                <div className="stats-mini-grid">
                                    <div className="stat-box">
                                        <span className="label">Lobo Cerebrale</span>
                                        <span className="val" style={{ color: selectedNode.lobeColor }}>{selectedNode.lobeName.split(' ')[0]}</span>
                                    </div>
                                    <div className="stat-box">
                                        <span className="label">Tipo di Nodo</span>
                                        <span className="val">{selectedNode.type.toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Inter-Subject Connections */}
                            <div className="panel-section">
                                <h3><ExternalLink size={16} /> Connessioni Inter-Materia</h3>
                                {activeNodeConnections.length > 0 ? (
                                    <div className="connections-list">
                                        {activeNodeConnections.map((conn, idx) => (
                                            <div 
                                                key={idx} 
                                                className="connection-link-item"
                                                onClick={() => handleSearchResultSelect({
                                                    type: 'concept',
                                                    id: conn.nodeId,
                                                    subjectId: conn.projectId,
                                                    subjectName: conn.projectName,
                                                    name: conn.nodeLabel,
                                                    macroTopic: conn.macroTopic
                                                })}
                                            >
                                                <div className="link-title">{conn.nodeLabel}</div>
                                                {conn.description && (
                                                    <div className="link-description" style={{ fontSize: '0.82rem', color: '#a78bfa', marginTop: '4px', fontStyle: 'italic', marginBottom: '6px' }}>
                                                        {conn.description}
                                                    </div>
                                                )}
                                                <div className="link-meta">
                                                    Disponibile in <strong>{conn.projectName}</strong>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-conn-text">
                                        Questo concetto è isolato in questa materia. Continua a studiare per sbloccare ponti neurali!
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Macrotopic stats panel
                        <div className="panel-scroll-content">
                            <div className="panel-header">
                                <span className="category-tag macro">Macroargomento</span>
                                <h2 className="node-title">{selectedMacro}</h2>
                                <p className="subject-subtitle">
                                    <BookOpen size={14} /> {projects.find(p => p.id === activeProjectId)?.name || "Materia Attiva"}
                                </p>
                            </div>

                            <div className="panel-section">
                                <h3><HelpCircle size={16} /> Descrizione Capitolo</h3>
                                <p className="definition-box">
                                    Questo macroargomento sintetizza la rete concettuale di "{selectedMacro}" all'interno dell'esame svolto. Clicca sui microargomenti sottostanti o ruota la mappa per esplorare le sinapsi sbloccate.
                                </p>
                            </div>

                            {/* Constituted microtopics */}
                            <div className="panel-section">
                                <h3><Brain size={16} /> Microargomenti Costitutivi</h3>
                                <div className="microtopics-list">
                                    {(completedDetails[activeProjectId]?.conceptMap?.nodes || [])
                                        .filter(n => n.macroTopic === selectedMacro)
                                        .map((node) => (
                                            <div 
                                                key={node.id} 
                                                className="microtopic-bubble-item"
                                                onClick={() => {
                                                    // Select microtopic
                                                    const fullNode = nodes3D.find(n => n.id === node.id && n.projectId === activeProjectId);
                                                    if (fullNode) setSelectedNode(fullNode);
                                                }}
                                            >
                                                <span className="dot" />
                                                <span className="lbl">{node.label}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Macrotopic Inter-Subject Connections */}
                            <div className="panel-section">
                                <h3><ExternalLink size={16} /> Connessioni Inter-Materia</h3>
                                {activeMacroConnections.length > 0 ? (
                                    <div className="connections-list">
                                        {activeMacroConnections.map((conn, idx) => (
                                            <div 
                                                key={idx} 
                                                className="connection-link-item"
                                                onClick={() => handleSearchResultSelect({
                                                    type: 'concept',
                                                    id: conn.nodeId,
                                                    subjectId: conn.projectId,
                                                    subjectName: conn.projectName,
                                                    name: conn.nodeLabel,
                                                    macroTopic: conn.macroTopic
                                                })}
                                            >
                                                <div className="link-title">Collegamento per "{conn.nodeLabel}"</div>
                                                <div className="link-meta">
                                                    Sbloccato ponte con <strong>{conn.projectName}</strong>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-conn-text">
                                        Nessun collegamento trasversale rilevato per i concetti di questo capitolo con altre materie concluse.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 3D Canvas Background */}
            <div className="canvas-wrapper">
                <Canvas camera={{ position: cameraTargets.position, fov: 45 }}>
                    <ambientLight intensity={0.25} />
                    <directionalLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
                    <pointLight position={[-10, 5, -10]} intensity={1.5} color={MAP_COLORS_BY_THEME[theme]?.hub || "#d4a373"} />
                    
                    <BrainVolumePlaceholder 
                        highlightZone={activeProjectInfo ? activeProjectInfo.lobeIdx : null} 
                    />
                    
                    <LobeNodes 
                        activeSubjectId={activeProjectId} 
                        subjectLobeMap={subjectLobeMap}
                        nodes3D={nodes3D}
                        edges3D={edges3D}
                        onSelectNode={(node) => {
                            setSelectedMacro(null);
                            setSelectedNode(node);
                        }}
                        onSelectMacro={(macroName) => {
                            setSelectedNode(null);
                            setSelectedMacro(macroName);
                        }}
                        selectedNodeId={selectedNode?.id}
                        selectedMacroName={selectedMacro}
                    />
                    
                    <CameraController 
                        targetPos={cameraTargets.position} 
                        targetLook={cameraTargets.lookAt} 
                        controlsRef={controlsRef} 
                    />
                    
                    <OrbitControls 
                        ref={controlsRef}
                        enableDamping 
                        dampingFactor={0.06} 
                        enableZoom={true} 
                        minDistance={2}
                        maxDistance={28}
                        autoRotate={!activeProjectId} // Auto-rotate only on global view
                        autoRotateSpeed={0.35}
                    />
                    <Environment preset="city" />
                </Canvas>
            </div>

            {/* Chat with Blobb Window */}
            {isChatOpen && (
                <div className="blobb-chat-window-wrapper animate-slide-in">
                    <div 
                        className="blobb-chat-window glass-panel"
                        style={{ transform: `translate(${chatPosition.x}px, ${chatPosition.y}px)` }}
                    >
                        <div className="chat-header" onMouseDown={handleHeaderMouseDown}>
                            <div className="chat-header-info">
                                <span className="chat-avatar-status pulsing"></span>
                                <h4>Chiedi a Blobb</h4>
                            </div>
                            <button className="chat-close-btn" onClick={() => setIsChatOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="chat-messages-container">
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`chat-message ${msg.sender}`}>
                                    {msg.sender === 'blobb' && (
                                        <div className="chat-blobb-avatar">
                                            <Blobb3D state={msg.state || 'idle'} size="small" />
                                        </div>
                                    )}
                                    <div className="chat-message-bubble">
                                        <p>{renderMessageContent(msg.text)}</p>
                                    </div>
                                </div>
                            ))}
                            {isChatLoading && (
                                <div className="chat-message blobb loading">
                                    <div className="chat-blobb-avatar">
                                        <Blobb3D state="curious" size="small" />
                                    </div>
                                    <div className="chat-message-bubble loading-bubble">
                                        <span className="dot-pulse"></span>
                                        <span className="dot-pulse"></span>
                                        <span className="dot-pulse"></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendChatMessage}>
                            <input
                                type="text"
                                className="chat-input-field"
                                placeholder="Chiedi qualcosa sulle materie completate..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                disabled={isChatLoading}
                                autoFocus
                            />
                            <button type="submit" className="chat-send-btn" disabled={!chatInput.trim() || isChatLoading}>
                                <ArrowRight size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Mascot Overlay */}
            <div 
                className={`mascot-overlay animate-fade-in ${isChatOpen ? 'chat-active' : ''}`}
                onClick={() => {
                    if (isChatOpen) {
                        setIsChatOpen(false);
                    } else {
                        setChatPosition({ x: 0, y: 0 });
                        setIsChatOpen(true);
                    }
                }}
                title="Parla con Blobb delle tue materie completate!"
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            >
                <Blobb3D state={isChatOpen ? chatBlobbState : (activeProjectId ? "curious" : "dance")} size="medium" />
                {!isChatOpen && (
                    <div className="mascot-chat-tooltip">
                        <span>Parla con me! 💬</span>
                    </div>
                )}
            </div>
        </div>
    );
}

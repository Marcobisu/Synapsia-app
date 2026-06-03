import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Play, CheckCircle, Clock, BookOpen, PlusCircle, 
    Trash2, X, UploadCloud, FileText, Loader2, Sparkles, Brain, Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Blobb3D from '../components/Blobb3D';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();
    const { 
        projects, 
        activeProjectId, 
        selectProject, 
        activeProjectDetail,
        mascotName, 
        refreshProjects,
        deleteProject,
        fetchWithAuth
    } = useApp();

    // Modal and creation form states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [textInput, setTextInput] = useState('');
    const [activeTab, setActiveTab] = useState('text'); // 'text' or 'file'
    const [lockAlert, setLockAlert] = useState({ show: false, subjectName: '' });

    // Refresh projects on mount
    useEffect(() => {
        refreshProjects();
    }, []);

    // Set first project as active if none is selected
    useEffect(() => {
        if (projects.length > 0 && !activeProjectId) {
            selectProject(projects[0].id);
        }
    }, [projects, activeProjectId]);

    // Handle project deletion
    const handleDelete = async (e, id, name) => {
        e.stopPropagation(); // Avoid selecting the card
        if (window.confirm(`Sei sicuro di voler eliminare la materia "${name}"? Questa azione è irreversibile.`)) {
            await deleteProject(id);
        }
    };

    // Handle Plain Text submission
    const handleTextSubmit = async (e) => {
        e.preventDefault();
        if (!textInput.trim()) return;

        setCreateLoading(true);
        try {
            const res = await fetchWithAuth('/analyze-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: textInput,
                    projectName: newProjectName.trim() || 'Nuova Materia'
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore durante l\'analisi del testo');

            setNewProjectName('');
            setTextInput('');
            setIsCreateModalOpen(false);
            await refreshProjects();
            selectProject(data.projectId);
            navigate('/sessione');
        } catch (err) {
            alert(`Errore: ${err.message}`);
        } finally {
            setCreateLoading(false);
        }
    };

    // Handle PDF/Txt File Upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setCreateLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('projectName', newProjectName.trim() || file.name.replace(/\.[^.]+$/, ''));

            const res = await fetchWithAuth('/analyze', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore durante l\'analisi del file');

            setNewProjectName('');
            setIsCreateModalOpen(false);
            await refreshProjects();
            selectProject(data.projectId);
            navigate('/sessione');
        } catch (err) {
            alert(`Errore: ${err.message}`);
        } finally {
            setCreateLoading(false);
        }
    };

    // Calculate macro-topics progress sequentially for the selected project
    const macroTopicProgress = useMemo(() => {
        if (!activeProjectDetail || !activeProjectDetail.conceptMap) return [];
        const { macroTopics, nodes } = activeProjectDetail.conceptMap;
        const completedNodes = activeProjectDetail.completedNodes || [];

        let previousTopicCompleted = true;

        return macroTopics.map((topic) => {
            const topicNodes = nodes.filter(n => n.macroTopic === topic);
            const totalNodes = topicNodes.length;
            const completedInTopic = topicNodes.filter(n => completedNodes.includes(n.id)).length;
            const isCompleted = totalNodes > 0 && completedInTopic === totalNodes;

            let status = 'blocked';
            if (isCompleted) {
                status = 'completed';
            } else if (previousTopicCompleted) {
                status = 'active';
            } else {
                status = 'blocked';
            }

            previousTopicCompleted = isCompleted;

            return {
                name: topic,
                completedNodes: completedInTopic,
                totalNodes,
                status,
                progress: totalNodes > 0 ? Math.round((completedInTopic / totalNodes) * 100) : 0
            };
        });
    }, [activeProjectDetail]);

    // Node layout positions for 2D preview map
    const nodePositions = useMemo(() => {
        if (!activeProjectDetail || !activeProjectDetail.conceptMap) return {};
        const { nodes } = activeProjectDetail.conceptMap;
        
        const hubs = nodes.filter(n => n.type === 'hub');
        const intermediates = nodes.filter(n => n.type === 'intermediate');
        const leaves = nodes.filter(n => n.type !== 'hub' && n.type !== 'intermediate');

        const pos = {};

        hubs.forEach((node, i) => {
            pos[node.id] = {
                x: ((i + 1) / (hubs.length + 1)) * 100,
                y: 20
            };
        });

        intermediates.forEach((node, i) => {
            pos[node.id] = {
                x: ((i + 1) / (intermediates.length + 1)) * 100,
                y: 50
            };
        });

        leaves.forEach((node, i) => {
            pos[node.id] = {
                x: ((i + 1) / (leaves.length + 1)) * 100,
                y: 80
            };
        });

        return pos;
    }, [activeProjectDetail]);

    const activeProjectDetailStats = useMemo(() => {
        if (!activeProjectDetail) return null;
        const total = activeProjectDetail.conceptMap.nodes.length + (activeProjectDetail.conceptMap.edges || []).length;
        const completed = activeProjectDetail.completedNodes.length + (activeProjectDetail.completedEdges || []).length;
        return {
            name: activeProjectDetail.name,
            progress: total > 0 
                ? ((activeProjectDetail.id === 'mock_tiga' && activeProjectDetail.completedNodes.length === 16)
                    ? 98
                    : Math.round((completed / total) * 100))
                : 0,
            completedNodes: activeProjectDetail.completedNodes.length,
            totalNodes: activeProjectDetail.conceptMap.nodes.length,
            lastTopic: activeProjectDetail.completedNodes.length > 0 
                ? activeProjectDetail.conceptMap.nodes.find(n => n.id === activeProjectDetail.completedNodes[activeProjectDetail.completedNodes.length - 1])?.label 
                : 'Nessuno'
        };
    }, [activeProjectDetail]);

    // Handle continuing studies on active project
    const handleContinue = (id) => {
        selectProject(id);
        navigate('/sessione');
    };

    return (
        <div className="home-page">
            {/* Header */}
            <header className="home-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div>
                        <h1>Home</h1>
                        <p>La casa della tua conoscenza</p>
                    </div>
                    <div style={{ width: '200px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-30px', marginBottom: '-30px' }}>
                        <Blobb3D state="idle" size="home" />
                    </div>
                </div>
                <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                    <PlusCircle size={20} /> Crea nuova Synapsi
                </button>
            </header>

            {projects.length === 0 ? (
                /* Empty state */
                <div className="empty-home-card glass-panel animate-fade-in">
                    <Blobb3D state="idle" size="large" />
                    <div className="empty-content">
                        <h2>Benvenuto su Synapsia!</h2>
                        <p>
                            Al momento non hai alcuna materia attiva. Clicca sul pulsante qui sotto per caricare il tuo materiale d'esame ed estrarre la tua prima mappa concettuale 3D.
                        </p>
                        <button className="btn-primary btn-large" onClick={() => setIsCreateModalOpen(true)}>
                            <PlusCircle size={20} /> Crea prima Synapsi
                        </button>
                    </div>
                </div>
            ) : (
                /* Subjects Dashboard */
                <div className="home-dashboard-layout">
                    {/* All Subjects Grid */}
                    <section className="subjects-section">
                        <h3>Le tue materie</h3>
                        <div className="subjects-grid">
                            {projects.map((project) => {
                                const isSelected = project.id === activeProjectId;
                                const progressPct = project.totalNodes > 0 
                                    ? ((project.id === 'mock_tiga' && project.completedNodes === 16)
                                        ? 98
                                        : Math.round((project.completedNodes / project.totalNodes) * 100))
                                    : 0;
                                const isCompleted = progressPct === 100;

                                return (
                                    <div 
                                        key={project.id} 
                                        className={`subject-card-dashboard glass-panel glass-panel-hover ${isSelected ? 'selected' : ''}`}
                                        onClick={() => selectProject(project.id)}
                                    >
                                        <div className="subject-card-header">
                                            <div className="subject-title-area">
                                                <Brain size={20} className="subject-icon" />
                                                <h4>{project.name}</h4>
                                            </div>
                                            <button 
                                                className="btn-icon-delete" 
                                                onClick={(e) => handleDelete(e, project.id, project.name)}
                                                title="Elimina materia"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="subject-card-body">
                                            <div className="progress-info">
                                                <span>Progresso cognitivo</span>
                                                <span>{progressPct}%</span>
                                            </div>
                                            <div className="progress-bar-bg">
                                                <div 
                                                    className="progress-bar-fill" 
                                                    style={{ width: `${progressPct}%` }}
                                                ></div>
                                            </div>
                                            <span className="node-stats">
                                                {project.completedNodes} / {project.totalNodes} concetti assimilati
                                            </span>
                                        </div>

                                        <div className="subject-card-footer">
                                            <button 
                                                className={`btn-secondary btn-sm ${!isCompleted ? 'locked' : ''}`}
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    if (!isCompleted) {
                                                        setLockAlert({ show: true, subjectName: project.name });
                                                    } else {
                                                        selectProject(project.id);
                                                        navigate('/synapsia'); 
                                                    }
                                                }}
                                            >
                                                {!isCompleted && <Lock size={12} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />}
                                                Mappa 3D
                                            </button>
                                            <button 
                                                className="btn-primary btn-sm"
                                                onClick={(e) => { e.stopPropagation(); handleContinue(project.id); }}
                                            >
                                                <Play size={14} /> Continua
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Active Subject Detail Section */}
                    {activeProjectDetailStats && (
                        <div className="active-subject-details animate-slide-up">
                            <hr className="divider" />
                            
                            <div className="details-header">
                                <div>
                                    <span className="details-tag">Materia Selezionata</span>
                                    <h2>{activeProjectDetailStats.name}</h2>
                                    <p className="last-topic">
                                        Ultimo concetto costruito: <strong>{activeProjectDetailStats.lastTopic}</strong>
                                    </p>
                                </div>
                                <button 
                                    className="btn-primary btn-large" 
                                    onClick={() => handleContinue(activeProjectId)}
                                >
                                    <Play size={18} /> Continua studio attivo
                                </button>
                            </div>

                            <div className="details-grid">
                                {/* Macro Topics Progress */}
                                <div className="details-card glass-panel">
                                    <div className="card-header">
                                        <h3>Progressione Macro-Argomenti</h3>
                                        <span className="stats-indicator">
                                            {macroTopicProgress.filter(t => t.status === 'completed').length} / {macroTopicProgress.length} Completati
                                        </span>
                                    </div>

                                    <div className="materials-list">
                                        {macroTopicProgress.map((topic, idx) => (
                                            <div key={idx} className={`material-item topic-item ${topic.status}`}>
                                                <div className="material-icon">
                                                    {topic.status === 'completed' ? (
                                                        <CheckCircle size={20} className="icon-success" />
                                                    ) : topic.status === 'active' ? (
                                                        <Clock size={20} className="icon-active" />
                                                    ) : (
                                                        <BookOpen size={20} className="icon-blocked" />
                                                    )}
                                                </div>
                                                <div className="material-details">
                                                    <h4>{topic.name}</h4>
                                                    <span>{topic.completedNodes} / {topic.totalNodes} concetti costruiti</span>
                                                </div>
                                                <div className={`material-status-badge ${topic.status}`}>
                                                    {topic.status === 'completed' ? 'Completato' : topic.status === 'active' ? 'In Corso' : 'Bloccato'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* SVG Map Preview */}
                                <div className="details-card glass-panel">
                                    <div className="card-header">
                                        <h3>Anteprima Mappa Neurone</h3>
                                        <button className="btn-text" onClick={() => navigate('/mappa-2d')}>
                                            Visualizza Mappa 2D →
                                        </button>
                                    </div>

                                    <div className="map-placeholder">
                                        <svg className="edges">
                                            {(activeProjectDetail.conceptMap.edges || [])
                                                .filter(e => e.type !== 'inter')
                                                .map((edge, idx) => {
                                                    const start = nodePositions[edge.from];
                                                    const end = nodePositions[edge.to];
                                                    if (!start || !end) return null;

                                                    const edgeKey = `${edge.from}_to_${edge.to}`;
                                                    const reverseKey = `${edge.to}_to_${edge.from}`;
                                                    const isCompleted = activeProjectDetail.completedEdges.includes(edgeKey) || 
                                                                        activeProjectDetail.completedEdges.includes(reverseKey);

                                                    return (
                                                        <line 
                                                            key={idx}
                                                            x1={`${start.x}%`} 
                                                            y1={`${start.y}%`} 
                                                            x2={`${end.x}%`} 
                                                            y2={`${end.y}%`}
                                                            style={{
                                                                stroke: isCompleted ? 'var(--success-color)' : 'var(--edge-color)',
                                                                opacity: isCompleted ? 0.9 : 0.15,
                                                                strokeWidth: isCompleted ? 2.5 : 1.5
                                                            }}
                                                        />
                                                    );
                                                })}
                                        </svg>

                                        {activeProjectDetail.conceptMap.nodes.map(node => {
                                            const pos = nodePositions[node.id];
                                            if (!pos) return null;

                                            const isCompleted = activeProjectDetail.completedNodes.includes(node.id);

                                            return (
                                                <div 
                                                    key={node.id} 
                                                    style={{ 
                                                        left: `${pos.x}%`, 
                                                        top: `${pos.y}%`,
                                                        backgroundColor: isCompleted ? 'var(--success-color)' : 'var(--bg-surface)',
                                                        opacity: isCompleted ? 1 : 0.5,
                                                        border: isCompleted ? '2px solid var(--success-color)' : '2px solid var(--border-color)',
                                                        width: node.type === 'hub' ? '18px' : node.type === 'intermediate' ? '14px' : '10px',
                                                        height: node.type === 'hub' ? '18px' : node.type === 'intermediate' ? '14px' : '10px',
                                                        boxShadow: isCompleted ? '0 0 10px rgba(64, 192, 87, 0.4)' : 'none'
                                                    }}
                                                    className={`node ${node.type}`}
                                                    title={node.label}
                                                >
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '130%',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        fontSize: '0.6rem',
                                                        color: isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                        whiteSpace: 'nowrap',
                                                        pointerEvents: 'none',
                                                        background: 'var(--bg-surface)',
                                                        padding: '1px 3px',
                                                        borderRadius: '3px',
                                                        border: '1px solid var(--border-color)',
                                                        opacity: 0.95
                                                    }}>
                                                        {node.label}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div className="map-overlay">
                                            <span>Mappa: {activeProjectDetailStats.completedNodes} / {activeProjectDetailStats.totalNodes} concetti sbloccati</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Creation Modal (Nuova Synapsi) */}
            {isCreateModalOpen && (
                <div className="modal-overlay animate-fade-in">
                    <div className="modal-container glass-panel animate-scale-up">
                        <button className="modal-close" onClick={() => setIsCreateModalOpen(false)}>
                            <X size={20} />
                        </button>
                        
                        <div className="modal-header">
                            <Sparkles className="sparkles-icon" size={24} />
                            <h3>Crea nuova Synapsi</h3>
                            <p>Carica il materiale didattico di un esame per inizializzare il tuo percorso neurale.</p>
                        </div>

                        {createLoading ? (
                            <div className="modal-loading">
                                <Loader2 className="spin" size={48} />
                                <h4>Generazione neurale in corso...</h4>
                                <p>L'AI sta leggendo il tuo materiale, estraendo i concetti chiave e costruendo il cervello tridimensionale. Potrebbe richiedere qualche secondo.</p>
                            </div>
                        ) : (
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Nome dell'esame o materia</label>
                                    <input 
                                        type="text" 
                                        value={newProjectName} 
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        placeholder="Es. Diritto Privato, Storia Contemporanea..."
                                        className="modal-input"
                                    />
                                </div>

                                <div className="tab-selector">
                                    <button 
                                        className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('text')}
                                    >
                                        Incolla testo
                                    </button>
                                    <button 
                                        className={`tab-btn ${activeTab === 'file' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('file')}
                                    >
                                        Carica PDF o Txt
                                    </button>
                                </div>

                                {activeTab === 'text' ? (
                                    <form onSubmit={handleTextSubmit} className="tab-content animate-fade-in">
                                        <div className="form-group">
                                            <label>Incolla qui i tuoi appunti, slide o capitoli</label>
                                            <textarea 
                                                required
                                                rows={6}
                                                value={textInput} 
                                                onChange={(e) => setTextInput(e.target.value)}
                                                placeholder="Incolla qui il materiale didattico da analizzare..."
                                                className="modal-textarea"
                                            />
                                        </div>
                                        <button type="submit" className="btn-primary btn-full">
                                            Avvia Analisi Neurale
                                        </button>
                                    </form>
                                ) : (
                                    <div className="tab-content animate-fade-in">
                                        <div className="file-drop-area">
                                            <label className="file-drop-label">
                                                <UploadCloud size={36} className="upload-icon" />
                                                <span>Trascina o clicca per caricare un file PDF o TXT</span>
                                                <input 
                                                    type="file" 
                                                    accept=".pdf,.txt" 
                                                    onChange={handleFileUpload} 
                                                    hidden 
                                                />
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Lock Alert Modal (Avvertimento Blobb) */}
            {lockAlert.show && (
                <div className="modal-overlay animate-fade-in" style={{ zIndex: 110 }}>
                    <div className="modal-container glass-panel animate-scale-up" style={{ maxWidth: '450px', textAlign: 'center' }}>
                        <button className="modal-close" onClick={() => setLockAlert({ show: false, subjectName: '' })}>
                            <X size={20} />
                        </button>
                        
                        <div className="modal-header">
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                                <Blobb3D state="curious" size="medium" />
                            </div>
                            <h3>Mappa 3D Bloccata</h3>
                        </div>
                        
                        <div className="modal-body" style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                            <p>
                                Ehi! 🧠 La mappa tridimensionale completa per <strong>{lockAlert.subjectName}</strong> si sbloccherà solo quando avrai completato tutti i nodi e le relazioni della materia.
                            </p>
                            <p style={{ marginTop: '12px' }}>
                                Continua a rispondere alle domande nel cantiere attivo per consolidare la tua conoscenza ed esplorare il tuo cervello 3D!
                            </p>
                            
                            <button 
                                className="btn-primary" 
                                style={{ marginTop: '20px', width: '100%', padding: '12px' }}
                                onClick={() => setLockAlert({ show: false, subjectName: '' })}
                            >
                                Ho capito, continuiamo!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

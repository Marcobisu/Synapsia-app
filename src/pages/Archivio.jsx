import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, FileText, UploadCloud, Plus, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Archivio.css';

export default function Archivio() {
    const navigate = useNavigate();
    const { projects, refreshProjects, selectProject, fetchWithAuth } = useApp();
    const [loading, setLoading] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [textInput, setTextInput] = useState('');
    const [showTextForm, setShowTextForm] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('projectName', projectName.trim() || file.name.replace(/\.[^.]+$/, ''));

            const res = await fetchWithAuth('/analyze', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore durante l\'analisi del file');

            setProjectName('');
            await refreshProjects();
            selectProject(data.projectId);
            navigate('/sessione');
        } catch (err) {
            alert(`Errore: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleTextSubmit = async (e) => {
        e.preventDefault();
        if (!textInput.trim()) return;

        setLoading(true);
        try {
            const res = await fetchWithAuth('/analyze-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: textInput,
                    projectName: projectName.trim() || 'Nuovo Progetto'
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore durante l\'analisi del testo');

            setProjectName('');
            setTextInput('');
            setShowTextForm(false);
            await refreshProjects();
            selectProject(data.projectId);
            navigate('/sessione');
        } catch (err) {
            alert(`Errore: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="archivio-page">
            <header className="archivio-header">
                <div>
                    <h1>Archivio Progetti</h1>
                    <p>Gestisci i tuoi esami universitari e i materiali di studio associati.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowTextForm(!showTextForm)}>
                    <Plus size={20} /> {showTextForm ? 'Chiudi' : 'Nuovo Progetto'}
                </button>
            </header>

            {showTextForm && (
                <div className="text-upload-form glass-panel animate-slide-up">
                    <h3>Crea Progetto con Testo</h3>
                    <form onSubmit={handleTextSubmit}>
                        <div className="form-group">
                            <label>Nome Materia d'Esame</label>
                            <input 
                                type="text"
                                required
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="Es. Psicologia Cognitiva, Storia Romana..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Materiale Didattico (Incolla qui)</label>
                            <textarea 
                                required
                                rows={8}
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Incolla qui i tuoi appunti, slide o capitoli di testo..."
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <Loader2 className="spin" size={18} /> : 'Crea ed Inizia Studio'}
                        </button>
                    </form>
                </div>
            )}

            <div className="projects-grid">
                {projects.map(project => (
                    <div key={project.id} className="project-card glass-panel">
                        <div className="project-header">
                            <div className="project-title" onClick={() => { selectProject(project.id); navigate('/'); }} style={{ cursor: 'pointer' }}>
                                <Folder className="folder-icon" size={24} />
                                <h2>{project.name}</h2>
                            </div>
                        </div>

                        <div className="materials-list">
                            <div className="material-row">
                                <div className="material-info">
                                    <FileText size={18} className="file-icon" />
                                    <span className="material-name">Dispense Corso Completo</span>
                                </div>
                                <div className="material-meta">
                                    <span className="status-badge ready">
                                        <CheckCircle size={14} /> {project.totalNodes} concetti
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="upload-zone">
                            {loading ? (
                                <div className="loader-container">
                                    <Loader2 className="spin" size={28} />
                                    <span>Analisi in corso...</span>
                                </div>
                            ) : (
                                <label className="file-drop-label">
                                    <UploadCloud size={24} className="upload-icon" />
                                    <span>Seleziona un PDF/Testo per aggiungere materiale</span>
                                    <input type="file" accept=".pdf,.txt" onChange={handleFileUpload} hidden />
                                </label>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

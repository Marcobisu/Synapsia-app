import { useState, useEffect, useMemo, useRef } from 'react';
import { User, Settings, Award, BookOpen, LayoutTemplate, Palette, CheckCircle, LogOut } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useApp } from '../context/AppContext';
import Blobb3D from '../components/Blobb3D';
import './Profilo.css';

// Atmosfere/Colori Mappa per Anteprima 3D
const PREVIEW_COLORS_BY_THEME = {
    calcite: { background: '#f8f9fa', hub: '#c49b6d', intermediate: '#d8bfa5', leaf: '#f0e5d8', edge: '#a39b8c' },
    abisso: { background: '#f0f4f8', hub: '#4a7ca1', intermediate: '#8cb2cc', leaf: '#d0e1ed', edge: '#8da2cc' },
    ambra: { background: '#faf7f5', hub: '#b06d4b', intermediate: '#cca28c', leaf: '#f0dfd5', edge: '#cca28c' },
    foresta: { background: '#f2f6f3', hub: '#4a8060', intermediate: '#8cbd9f', leaf: '#cee8d9', edge: '#8cbd9f' },
    lavanda: { background: '#f5f3f7', hub: '#7d639c', intermediate: '#b3a1cc', leaf: '#ebdff5', edge: '#b3a1cc' },
    cemento: { background: '#f3f3f5', hub: '#757580', intermediate: '#a6a6b2', leaf: '#e3e3e8', edge: '#a6a6b2' }
};

function SpinningGraph({ themeId }) {
    const groupRef = useRef();
    const colors = PREVIEW_COLORS_BY_THEME[themeId] || PREVIEW_COLORS_BY_THEME.calcite;

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
        }
    });

    const isAbisso = themeId === 'abisso';

    return (
        <group ref={groupRef}>
            {/* Center Hub */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.35, 32, 32]} />
                <meshPhysicalMaterial 
                    color={colors.hub} 
                    roughness={0.2} 
                    clearcoat={0.8}
                    transmission={isAbisso ? 0 : 0.2}
                    opacity={1}
                />
            </mesh>

            {/* Intermediate Node */}
            <mesh position={[-1.0, 0.6, 0.4]}>
                <sphereGeometry args={[0.22, 32, 32]} />
                <meshPhysicalMaterial color={colors.intermediate} roughness={0.2} />
            </mesh>

            {/* Leaf Node */}
            <mesh position={[0.8, -0.5, -0.6]}>
                <sphereGeometry args={[0.15, 32, 32]} />
                <meshPhysicalMaterial color={colors.leaf} roughness={0.2} />
            </mesh>

            {/* Lines */}
            <line>
                <bufferGeometry attach="geometry" onUpdate={(self) => {
                    const points = [
                        new THREE.Vector3(0, 0, 0),
                        new THREE.Vector3(-1.0, 0.6, 0.4)
                    ];
                    self.setFromPoints(points);
                }} />
                <lineBasicMaterial attach="material" color={colors.edge} linewidth={2} />
            </line>

            <line>
                <bufferGeometry attach="geometry" onUpdate={(self) => {
                    const points = [
                        new THREE.Vector3(0, 0, 0),
                        new THREE.Vector3(0.8, -0.5, -0.6)
                    ];
                    self.setFromPoints(points);
                }} />
                <lineBasicMaterial attach="material" color={colors.edge} linewidth={2} />
            </line>
        </group>
    );
}

function Mini3DMapPreview({ themeId }) {
    const colors = PREVIEW_COLORS_BY_THEME[themeId] || PREVIEW_COLORS_BY_THEME.calcite;

    return (
        <div className="mini-3d-map-preview-container" style={{ backgroundColor: colors.background }}>
            <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
                <ambientLight intensity={0.9} />
                <directionalLight position={[2, 2, 2]} intensity={1.5} />
                <directionalLight position={[-2, -2, -2]} intensity={0.5} color="#b197fc" />
                <SpinningGraph themeId={themeId} />
            </Canvas>
            <div className="mini-3d-map-tag">
                Atmosfera: {themeId.toUpperCase()}
            </div>
        </div>
    );
}

export default function Profilo() {
    const { 
        user, 
        logout,
        theme, 
        updateTheme, 
        global3DPalette,
        updateGlobal3DPalette,
        mascotName, 
        mascotColor,
        updateMascotColor, 
        sessionLayout, 
        updateSessionLayout,
        projects,
        activeProjectDetail
    } = useApp();

    const [activeTab, setActiveTab] = useState('profilo');

    const themes = [
        { id: 'calcite', name: 'Calcite', color: '#c4a282' },
        { id: 'abisso', name: 'Abisso', color: '#7a99b0' },
        { id: 'ambra', name: 'Ambra', color: '#b0886f' },
        { id: 'foresta', name: 'Foresta', color: '#7ea18c' },
        { id: 'lavanda', name: 'Lavanda', color: '#938ba3' },
        { id: 'cemento', name: 'Cemento', color: '#a2a2ab' },
    ];

    // Dynamically calculate earned badges from user's actual project status
    const earnedBadges = useMemo(() => {
        const badges = [];

        projects.forEach(project => {
            // Find detailed project if cached in localStorage
            const cachedDetailStr = localStorage.getItem(`synapsia_project_${project.id}`);
            if (!cachedDetailStr) return;
            const projectDetail = JSON.parse(cachedDetailStr);

            const completedNodes = projectDetail.completedNodes || [];
            const nodes = projectDetail.conceptMap?.nodes || [];
            const macroTopics = projectDetail.conceptMap?.macroTopics || [];

            // Check completion for each macro topic
            macroTopics.forEach(topic => {
                const topicNodes = nodes.filter(n => n.macroTopic === topic);
                const allDone = topicNodes.length > 0 && topicNodes.every(n => completedNodes.includes(n.id));
                if (allDone) {
                    badges.push({
                        type: 'standard',
                        title: topic,
                        subtitle: project.name,
                        date: 'Oggi'
                    });
                }
            });

            // Check platinum completion (whole project done)
            const totalNodes = nodes.length;
            if (totalNodes > 0 && completedNodes.length >= totalNodes) {
                badges.push({
                    type: 'platinum',
                    title: project.name,
                    subtitle: 'Esame Completato',
                    date: 'Oggi'
                });
            }
        });

        // Fallback demo badges if they have no active projects
        if (badges.length === 0) {
            badges.push(
                { type: 'platinum', title: 'Change Management', subtitle: 'Esame Completato', date: '12/05/2026' },
                { type: 'platinum', title: 'Marketing', subtitle: 'Esame Completato', date: '28/05/2026' },
                { type: 'standard', title: 'Business Model Canvas', subtitle: 'Marketing & Business Strategy', date: 'Oggi' },
                { type: 'standard', title: 'Modelli e Sistemi', subtitle: 'Information Technology & BPM', date: 'Ieri' }
            );
        }

        return badges;
    }, [projects, activeProjectDetail]);

    return (
        <div className="profilo-page">
            <header className="profilo-header">
                <div>
                    <h1>Profilo & Customize</h1>
                    <p className="profile-sub">Personalizza la tua esperienza di studio cognitivo.</p>
                </div>
                <div className="tabs">
                    <button
                        className={`tab-btn ${activeTab === 'profilo' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profilo')}
                    >
                        <User size={18} /> Profilo
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'customize' ? 'active' : ''}`}
                        onClick={() => setActiveTab('customize')}
                    >
                        <Settings size={18} /> Customize
                    </button>
                </div>
            </header>

            <div className="profilo-content">
                {activeTab === 'profilo' ? (
                    <div className="profilo-tab animate-fade-in">
                        <div className="user-info glass-panel">
                            <div className="avatar-placeholder">
                                <User size={40} />
                            </div>
                            <div className="user-details">
                                <h2>{user ? user.name : 'Studente'}</h2>
                                <p>{user ? user.email : 'studente@universita.it'}</p>
                            </div>
                            <button className="btn-logout" onClick={logout} title="Esci dal profilo">
                                <LogOut size={20} /> Logout
                            </button>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card glass-panel">
                                <BookOpen size={24} className="stat-icon" />
                                <h3>Progetti Attivi</h3>
                                <span className="stat-value">{projects.length}</span>
                            </div>
                            <div className="stat-card glass-panel">
                                <Award size={24} className="stat-icon" />
                                <h3>Badge Conseguiti</h3>
                                <span className="stat-value">{earnedBadges.length}</span>
                            </div>
                        </div>

                        <div className="badges-section glass-panel">
                            <h3>Collezione Badge</h3>
                            <p className="badges-intro">Rispondi correttamente per completare i livelli e sbloccare nuovi trofei.</p>
                            <div className="badges-grid">
                                {earnedBadges.map((badge, idx) => (
                                    <div key={idx} className={`badge-item ${badge.type === 'platinum' ? 'platinum' : ''}`}>
                                        {badge.type === 'platinum' ? <Award size={36} className="award-platinum" /> : <CheckCircle size={28} />}
                                        <span>{badge.title}</span>
                                        <small>{badge.subtitle}</small>
                                        <span className="badge-date">{badge.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mybrain-tab animate-fade-in">
                        <div className="settings-panel glass-panel">
                            <div className="setting-group">
                                <h3><Palette size={20} /> Atmosfera Mappa</h3>
                                <p>Scegli la palette cromatica per la tua mappa 3D.</p>
                                <div className="theme-selector">
                                    {themes.map(t => (
                                        <button
                                            key={t.id}
                                            className={`theme-btn ${theme === t.id ? 'active' : ''}`}
                                            style={{ backgroundColor: t.color }}
                                            onClick={() => updateTheme(t.id)}
                                            title={t.name}
                                        >
                                            {theme === t.id && <CheckCircle size={16} color={t.id === 'abisso' ? 'white' : 'black'} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="setting-group">
                                <h3><Palette size={20} /> Palette Vista Globale 3D</h3>
                                <p>Personalizza la palette cromatica per la vista globale tridimensionale.</p>
                                <div className="palette-3d-selector">
                                    {[
                                        { id: 'standard', name: 'Standard', previewColor: '#0284c7' },
                                        { id: 'cyberpunk', name: 'Cyberpunk', previewColor: '#ff007f' },
                                        { id: 'vintage', name: 'Terra', previewColor: '#d84b20' },
                                        { id: 'aurora', name: 'Aurora', previewColor: '#74c0fc' }
                                    ].map(p => (
                                        <button
                                            key={p.id}
                                            className={`palette-3d-btn ${global3DPalette === p.id ? 'active' : ''}`}
                                            onClick={() => updateGlobal3DPalette(p.id)}
                                            title={p.name}
                                        >
                                            <span 
                                                className="palette-color-dot"
                                                style={{ backgroundColor: p.previewColor }}
                                            ></span>
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="setting-group">
                                <h3><Palette size={20} /> Colore Mascotte</h3>
                                <p>Scegli il colore per la gelatina di Blobb.</p>
                                <div className="color-selector" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {[
                                        { hex: '#48cae4', name: 'Aqua' },
                                        { hex: '#ff758f', name: 'Rosa' },
                                        { hex: '#52b788', name: 'Verde' },
                                        { hex: '#7950f2', name: 'Viola' },
                                        { hex: '#f59f00', name: 'Ambra' }
                                    ].map(c => (
                                        <button
                                            key={c.hex}
                                            className={`theme-btn ${mascotColor === c.hex ? 'active' : ''}`}
                                            style={{ 
                                                backgroundColor: c.hex,
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                border: '2px solid var(--border-color)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => updateMascotColor(c.hex)}
                                            title={c.name}
                                        >
                                            {mascotColor === c.hex && <CheckCircle size={16} color="white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="setting-group">
                                <h3><LayoutTemplate size={20} /> Layout Sessione</h3>
                                <p>Scegli il layout visuale per la sessione di studio attivo.</p>
                                <div className="layout-selector">
                                    <button
                                        className={`layout-btn ${sessionLayout === 'focus' ? 'active' : ''}`}
                                        onClick={() => updateSessionLayout('focus')}
                                    >
                                        <div className="layout-mock focus-mock"></div>
                                        <span>Focus</span>
                                    </button>
                                    <button
                                        className={`layout-btn ${sessionLayout === 'contesto' ? 'active' : ''}`}
                                        onClick={() => updateSessionLayout('contesto')}
                                    >
                                        <div className="layout-mock contesto-mock">
                                            <div className="mock-main"></div>
                                            <div className="mock-side"></div>
                                        </div>
                                        <span>Contesto</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="preview-panel glass-panel">
                            <h3>Anteprima Live</h3>
                            <div className="preview-content">
                                <div className="preview-mascot">
                                    <Blobb3D state="idle" size="medium" />
                                    <div className="mascot-name-tag">{mascotName}</div>
                                </div>
                                <div className="preview-3d-map" style={{ width: '100%' }}>
                                    <Mini3DMapPreview themeId={theme} />
                                </div>
                                <div className={`preview-layout-mock ${sessionLayout}`}>
                                    <div className="mock-question">Domanda di esempio formulata da {mascotName}?</div>
                                    {sessionLayout === 'contesto' && (
                                        <div className="mock-map-side">
                                            <div className="mock-node hub"></div>
                                            <div className="mock-node intermediate"></div>
                                            <div className="mock-node leaf"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

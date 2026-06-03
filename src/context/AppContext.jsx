import { createContext, useState, useEffect, useContext } from 'react';
import { MOCK_PROJECTS, MOCK_COMPLETED_SUBJECTS } from '../data/mockData';

// Reset TIGA mock completed state on page load/restart
localStorage.removeItem('synapsia_tiga_completed_nodes');
localStorage.removeItem('synapsia_tiga_completed_edges');

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export default function AppContextProvider({ children }) {
    const [token, setToken] = useState(() => {
        return localStorage.getItem('synapsia_token') || null;
    });

    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('synapsia_user');
        return stored ? JSON.parse(stored) : null;
    });

    const [isOnboarded, setIsOnboarded] = useState(() => {
        return localStorage.getItem('synapsia_onboarded') === 'true';
    });

    const [mascotName] = useState('Blobb');

    const [mascotColor, setMascotColor] = useState(() => {
        return localStorage.getItem('synapsia_mascot_color') || '#48cae4';
    });

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('synapsia_theme') || 'calcite';
    });

    const [global3DPalette, setGlobal3DPalette] = useState(() => {
        return localStorage.getItem('synapsia_global_3d_palette') || 'standard';
    });

    const [sessionLayout, setSessionLayout] = useState(() => {
        return localStorage.getItem('synapsia_session_layout') || 'focus';
    });

    const [activeProjectId, setActiveProjectId] = useState(() => {
        return localStorage.getItem('synapsia_active_project_id') || null;
    });

    const [projects, setProjects] = useState([]);
    const [activeProjectDetail, setActiveProjectDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3001/api'
        : '/api';

    // Centralized authenticated fetch utility
    const fetchWithAuth = async (endpoint, options = {}) => {
        // Intercept mock_tiga calls
        if (endpoint === '/question' && options.method === 'POST') {
            const body = JSON.parse(options.body || '{}');
            if (body.projectId === 'mock_tiga') {
                const storedNodes = localStorage.getItem('synapsia_tiga_completed_nodes');
                const completedNodes = storedNodes ? JSON.parse(storedNodes) : MOCK_COMPLETED_SUBJECTS['mock_tiga'].completedNodes;
                
                if (completedNodes.length === 17) {
                    return new Response(JSON.stringify({ completed: true }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                } else {
                    return new Response(JSON.stringify(MOCK_COMPLETED_SUBJECTS['mock_tiga'].activeQuestion), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }
        }
        
        if (endpoint === '/evaluate' && options.method === 'POST') {
            const body = JSON.parse(options.body || '{}');
            if (body.projectId === 'mock_tiga') {
                const allNodes = MOCK_COMPLETED_SUBJECTS['mock_tiga'].conceptMap.nodes.map(n => n.id);
                const allEdges = MOCK_COMPLETED_SUBJECTS['mock_tiga'].conceptMap.edges.map(e => `${e.from}_to_${e.to}`);
                
                localStorage.setItem('synapsia_tiga_completed_nodes', JSON.stringify(allNodes));
                localStorage.setItem('synapsia_tiga_completed_edges', JSON.stringify(allEdges));
                
                return new Response(JSON.stringify({
                    success: true,
                    completed: true,
                    progress: 100,
                    blobbState: 'dance',
                    feedback: "Fantastico! La tua risposta sul sistema MRP è eccellente e corretta! Il Material Requirements Planning calcola i fabbisogni netti partendo dal piano di produzione principale, incrociandolo con le distinte base e i livelli di scorta. Hai completato TIGA al 100%! La vista globale 3D è ora sbloccata e la materia è stata integrata nel tuo cervello ('My Brain')."
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
        const headers = { ...options.headers };
        const currentToken = token || localStorage.getItem('synapsia_token');
        if (currentToken) {
            headers['Authorization'] = `Bearer ${currentToken}`;
        }
        return fetch(url, {
            ...options,
            headers
        });
    };

    // Verify session on mount or token change
    useEffect(() => {
        const verifySession = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                    if (userData.mascotColor) {
                        setMascotColor(userData.mascotColor);
                        localStorage.setItem('synapsia_mascot_color', userData.mascotColor);
                    }
                    localStorage.setItem('synapsia_user', JSON.stringify(userData));
                } else {
                    logout();
                }
            } catch (err) {
                console.warn('Session verification failed:', err);
                const storedUser = localStorage.getItem('synapsia_user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            }
        };
        verifySession();
    }, [token]);

    // Apply theme to body
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Sync state helpers
    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore durante il login');

            setToken(data.token);
            setUser(data.user);
            setIsOnboarded(true); // User logging in is already onboarded
            if (data.user.mascotColor) {
                setMascotColor(data.user.mascotColor);
                localStorage.setItem('synapsia_mascot_color', data.user.mascotColor);
            }
            localStorage.setItem('synapsia_token', data.token);
            localStorage.setItem('synapsia_user', JSON.stringify(data.user));
            localStorage.setItem('synapsia_onboarded', 'true');
            return data.user;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, mascotColor })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore durante la registrazione');

            setToken(data.token);
            setUser(data.user);
            setIsOnboarded(false); // New user needs onboarding
            localStorage.removeItem('synapsia_onboarded');
            localStorage.setItem('synapsia_token', data.token);
            localStorage.setItem('synapsia_user', JSON.stringify(data.user));
            return data.user;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setIsOnboarded(false);
        setMascotColor('#48cae4');
        setActiveProjectId(null);
        setActiveProjectDetail(null);
        localStorage.removeItem('synapsia_token');
        localStorage.removeItem('synapsia_user');
        localStorage.removeItem('synapsia_onboarded');
        localStorage.removeItem('synapsia_mascot_color');
        localStorage.removeItem('synapsia_mascot_name');
        localStorage.removeItem('synapsia_active_project_id');
    };

    const completeOnboarding = async (customMascotColor) => {
        setIsOnboarded(true);
        localStorage.setItem('synapsia_onboarded', 'true');
        if (customMascotColor) {
            setMascotColor(customMascotColor);
            localStorage.setItem('synapsia_mascot_color', customMascotColor);
            
            // Sync mascot color to DB
            try {
                await fetchWithAuth('/auth/mascot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mascotColor: customMascotColor })
                });
            } catch (err) {
                console.warn('Non sono riuscito a salvare il colore sul server:', err);
            }
        }
    };

    const updateMascotColor = async (color) => {
        setMascotColor(color);
        localStorage.setItem('synapsia_mascot_color', color);
        try {
            await fetchWithAuth('/auth/mascot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mascotColor: color })
            });
        } catch (err) {
            console.warn('Errore aggiornamento colore su server:', err);
        }
    };

    const updateTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('synapsia_theme', newTheme);
    };

    const updateGlobal3DPalette = (newPalette) => {
        setGlobal3DPalette(newPalette);
        localStorage.setItem('synapsia_global_3d_palette', newPalette);
    };

    const updateSessionLayout = (layout) => {
        setSessionLayout(layout);
        localStorage.setItem('synapsia_session_layout', layout);
    };

    const selectProject = (id) => {
        setActiveProjectId(id);
        if (id) {
            localStorage.setItem('synapsia_active_project_id', id);
        } else {
            localStorage.removeItem('synapsia_active_project_id');
            setActiveProjectDetail(null);
        }
    };

    // Fetch projects list
    const refreshProjects = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth('/projects');
            let data = [];
            if (res.ok) {
                data = await res.json();
            } else {
                const backup = localStorage.getItem('synapsia_projects_backup');
                if (backup) data = JSON.parse(backup);
            }
            
            // Merge mock completed projects so they are always visible in the dashboard
            const merged = [...data];
            MOCK_PROJECTS.forEach(mockProj => {
                if (!merged.some(p => p.id === mockProj.id)) {
                    let completedNodesCount = mockProj.completedNodes;
                    if (mockProj.id === 'mock_tiga') {
                        const stored = localStorage.getItem('synapsia_tiga_completed_nodes');
                        if (stored) {
                            completedNodesCount = JSON.parse(stored).length;
                        }
                    }
                    merged.push({
                        ...mockProj,
                        completedNodes: completedNodesCount
                    });
                }
            });
            
            setProjects(merged);
            localStorage.setItem('synapsia_projects_backup', JSON.stringify(merged));
        } catch (err) {
            console.warn('Errore di connessione al server, carico backup locale:', err.message);
            // Append mock projects to backup
            const backup = localStorage.getItem('synapsia_projects_backup');
            let backupData = backup ? JSON.parse(backup) : [];
            const merged = [...backupData];
            MOCK_PROJECTS.forEach(mockProj => {
                if (!merged.some(p => p.id === mockProj.id)) {
                    let completedNodesCount = mockProj.completedNodes;
                    if (mockProj.id === 'mock_tiga') {
                        const stored = localStorage.getItem('synapsia_tiga_completed_nodes');
                        if (stored) {
                            completedNodesCount = JSON.parse(stored).length;
                        }
                    }
                    merged.push({
                        ...mockProj,
                        completedNodes: completedNodesCount
                    });
                }
            });
            setProjects(merged);
        } finally {
            setLoading(false);
        }
    };

    // Fetch active project detail
    const refreshActiveProjectDetail = async () => {
        if (!activeProjectId) {
            setActiveProjectDetail(null);
            return;
        }

        // Return static mock data for simulated completed subjects
        if (MOCK_COMPLETED_SUBJECTS[activeProjectId]) {
            let completedNodes = MOCK_COMPLETED_SUBJECTS[activeProjectId].conceptMap.nodes.map(n => n.id);
            let completedEdges = MOCK_COMPLETED_SUBJECTS[activeProjectId].conceptMap.edges.map(e => `${e.from}_to_${e.to}`);

            if (activeProjectId === 'mock_tiga') {
                const storedNodes = localStorage.getItem('synapsia_tiga_completed_nodes');
                if (storedNodes) {
                    completedNodes = JSON.parse(storedNodes);
                } else {
                    completedNodes = MOCK_COMPLETED_SUBJECTS['mock_tiga'].completedNodes;
                    localStorage.setItem('synapsia_tiga_completed_nodes', JSON.stringify(completedNodes));
                }

                const storedEdges = localStorage.getItem('synapsia_tiga_completed_edges');
                if (storedEdges) {
                    completedEdges = JSON.parse(storedEdges);
                } else {
                    completedEdges = MOCK_COMPLETED_SUBJECTS['mock_tiga'].conceptMap.edges
                        .filter(e => e.to !== 'mrp_system')
                        .map(e => `${e.from}_to_${e.to}`);
                    localStorage.setItem('synapsia_tiga_completed_edges', JSON.stringify(completedEdges));
                }
                
                // Refresh projects dashboard count
                setTimeout(() => {
                    refreshProjects();
                }, 0);
            }

            const mockDetail = {
                ...MOCK_COMPLETED_SUBJECTS[activeProjectId],
                completedNodes,
                completedEdges
            };
            setActiveProjectDetail(mockDetail);
            return;
        }

        try {
            const res = await fetchWithAuth(`/project/${activeProjectId}`);
            if (res.ok) {
                const data = await res.json();
                setActiveProjectDetail(data);
                localStorage.setItem(`synapsia_project_${activeProjectId}`, JSON.stringify(data));
            } else {
                throw new Error('Errore nel recupero dettagli del progetto');
            }
        } catch (err) {
            console.warn('Errore di connessione, carico dettaglio locale:', err.message);
            const cached = localStorage.getItem(`synapsia_project_${activeProjectId}`);
            if (cached) {
                setActiveProjectDetail(JSON.parse(cached));
            }
        }
    };

    const deleteProject = async (id) => {
        try {
            const res = await fetchWithAuth(`/project/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                if (activeProjectId === id) {
                    selectProject(null);
                }
                await refreshProjects();
                return true;
            } else {
                throw new Error('Errore durante l\'eliminazione del progetto');
            }
        } catch (err) {
            console.error('Delete project error:', err);
            const updated = projects.filter(p => p.id !== id);
            setProjects(updated);
            localStorage.setItem('synapsia_projects_backup', JSON.stringify(updated));
            localStorage.removeItem(`synapsia_project_${id}`);
            if (activeProjectId === id) {
                selectProject(null);
            }
            return true;
        }
    };

    // Load projects list on boot and when user is logged in
    useEffect(() => {
        if (user) {
            refreshProjects();
        }
    }, [user]);

    // Load active project detail whenever activeProjectId changes
    useEffect(() => {
        if (activeProjectId) {
            refreshActiveProjectDetail();
        } else {
            setActiveProjectDetail(null);
        }
    }, [activeProjectId]);

    return (
        <AppContext.Provider value={{
            user,
            token,
            isOnboarded,
            mascotName,
            mascotColor,
            theme,
            global3DPalette,
            sessionLayout,
            activeProjectId,
            projects,
            activeProjectDetail,
            loading,
            login,
            register,
            logout,
            completeOnboarding,
            updateMascotColor,
            updateTheme,
            updateGlobal3DPalette,
            updateSessionLayout,
            selectProject,
            refreshProjects,
            refreshActiveProjectDetail,
            deleteProject,
            fetchWithAuth,
            API_BASE
        }}>
            {children}
        </AppContext.Provider>
    );
}

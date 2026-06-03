import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Brain, ArrowRight } from 'lucide-react';
import Blobb3D from '../components/Blobb3D';
import './LoginOnboarding.css';

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }}>
        <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.08-.25-.13-.51-.13-.73z"
        />
        <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
    </svg>
);

export default function LoginOnboarding() {
    const navigate = useNavigate();
    const { user, login, register, isOnboarded, completeOnboarding } = useApp();
    
    // Auth Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isRegisterMode, setIsRegisterMode] = useState(false);

    // Onboarding Step State
    const [step, setStep] = useState(1);
    const [customMascotColor, setCustomMascotColor] = useState('#48cae4');
    const [blobbState, setBlobbState] = useState('idle');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (isRegisterMode) {
                if (!name.trim() || !email.trim() || !password) {
                    setError('Tutti i campi sono obbligatori.');
                    return;
                }
                await register(name, email, password);
            } else {
                if (!email.trim() || !password) {
                    setError('Email e password sono obbligatori.');
                    return;
                }
                const loggedUser = await login(email, password);
                if (loggedUser) {
                    navigate('/');
                }
            }
        } catch (err) {
            setError(err.message || 'Si è verificato un errore.');
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        const googleEmail = 'studente.google@universita.it';
        const googleName = 'Studente Google';
        const googlePassword = 'GoogleMockPassword123!';
        try {
            const loggedUser = await login(googleEmail, googlePassword);
            if (loggedUser) {
                navigate('/');
            }
        } catch (err) {
            try {
                await register(googleName, googleEmail, googlePassword);
            } catch (regErr) {
                setError(regErr.message || 'Si è verificato un errore con l\'accesso Google.');
            }
        }
    };

    // Onboarding Messages Flow
    const renderOnboardingStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="onboarding-bubble-area">
                        <div className="speech-bubble">
                            <p>
                                Ciao! 🌟 Sono <strong>Blobb</strong>, il tuo compagno di studio attivo.
                                Prima di metterci al lavoro nel nostro cantiere cognitivo, ti va di personalizzare la mia tonalità? Scegli il colore che ti ispira di più!
                            </p>
                        </div>
                        <div className="onboarding-actions">
                            <div className="color-selector" style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '16px 0' }}>
                                {[
                                    { hex: '#48cae4', name: 'Aqua' },
                                    { hex: '#ff758f', name: 'Rosa' },
                                    { hex: '#52b788', name: 'Verde' },
                                    { hex: '#7950f2', name: 'Viola' },
                                    { hex: '#f59f00', name: 'Ambra' }
                                ].map(c => (
                                    <button
                                        key={c.hex}
                                        className={`color-btn ${customMascotColor === c.hex ? 'active' : ''}`}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            backgroundColor: c.hex,
                                            border: customMascotColor === c.hex ? '3px solid white' : '1px solid var(--border-color)',
                                            boxShadow: customMascotColor === c.hex ? '0 0 0 2px var(--accent-color)' : 'none',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => {
                                            setCustomMascotColor(c.hex);
                                            setBlobbState('dance');
                                            setTimeout(() => setBlobbState('idle'), 800);
                                        }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                            <div className="actions-row">
                                <button 
                                    className="btn-onboarding btn-primary"
                                    onClick={() => {
                                        setBlobbState('dance');
                                        setTimeout(() => {
                                            setBlobbState('idle');
                                            setStep(2);
                                        }, 1000);
                                    }}
                                >
                                    Conferma Colore
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="onboarding-bubble-area">
                        <div className="speech-bubble">
                            <p>
                                Ottima scelta! Adoro questo aspetto. 🤝 
                                Ti spiego subito come funziona il nostro viaggio. In Synapsia non troverai una mappa pronta. 
                                La mappa la crei tu scoprendola, rispondendo alle mie domande. Io ti guiderò nodo dopo nodo, nel giusto ordine logico. Sei pronto ad attivare il tuo cervello?
                            </p>
                        </div>
                        <div className="onboarding-actions">
                            <div className="actions-row">
                                <button 
                                    className="btn-onboarding btn-secondary"
                                    onClick={() => {
                                        setBlobbState('curious');
                                        setStep(3);
                                    }}
                                >
                                    Come funziona in pratica?
                                </button>
                                <button 
                                    className="btn-onboarding btn-primary"
                                    onClick={() => {
                                        setBlobbState('dance');
                                        setStep(4);
                                    }}
                                >
                                    Sì, iniziamo!
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="onboarding-bubble-area">
                        <div className="speech-bubble">
                            <p>
                                È facilissimo! Carichi il tuo materiale di studio (un file PDF, delle slide o testi incollati) e il gioco è fatto! Ti guiderò io in questo percorso facendoti delle domande, costruiremo insieme una mappa che ti guiderà nella crescita della tua conoscenza
                            </p>
                        </div>
                        <div className="onboarding-actions">
                            <div className="actions-row">
                                <button 
                                    className="btn-onboarding btn-primary"
                                    onClick={() => {
                                        setBlobbState('idle');
                                        setStep(4);
                                    }}
                                >
                                    Capito, andiamo avanti!
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="onboarding-bubble-area">
                        <div className="speech-bubble">
                            <p>
                                Esatto! E ricorda: l'avanzamento nella mappa è la metafora della tua conoscenza reale. Vai avanti e sblocca i premi, costruisci la tua mappa 3D interattiva completa ed esplorabile!
                            </p>
                        </div>
                        <div className="onboarding-actions">
                            <div className="actions-row">
                                <button 
                                    className="btn-onboarding btn-primary"
                                    onClick={() => {
                                        setBlobbState('dance');
                                        completeOnboarding(customMascotColor);
                                        navigate('/');
                                    }}
                                >
                                    Entra nel Cantiere Cognitivo! <ArrowRight size={18} style={{ marginLeft: 8 }} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="login-onboarding-container">
            {!user ? (
                /* Auth Form Screen */
                <div className="auth-card glass-panel">
                    <div className="auth-header">
                        <Brain className="logo-icon" size={80} />
                        <h1>Synapsia</h1>
                        <p>{isRegisterMode ? 'Crea il tuo account per iniziare.' : 'Accedi al tuo spazio di studio attivo.'}</p>
                    </div>

                    {error && (
                        <div className="auth-error-message" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ff6b6b', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {isRegisterMode && (
                            <div className="input-field">
                                <label htmlFor="auth-name">Nome Completo</label>
                                <input 
                                    id="auth-name"
                                    type="text" 
                                    required
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="Esempio: Marco Rossi"
                                />
                            </div>
                        )}
                        <div className="input-field">
                            <label htmlFor="auth-email">Indirizzo Email</label>
                            <input 
                                id="auth-email"
                                type="email" 
                                required
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="Esempio: marco@universita.it"
                            />
                        </div>
                        <div className="input-field">
                            <label htmlFor="auth-password">Password</label>
                            <input 
                                id="auth-password"
                                type="password" 
                                required
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder={isRegisterMode ? "Minimo 8 caratteri" : "Inserisci la tua password"}
                            />
                        </div>
                        <button type="submit" className="btn-primary btn-auth-submit">
                            {isRegisterMode ? 'Registrati e Inizia' : 'Accedi'}
                        </button>
                    </form>

                    <div className="auth-mode-toggle" style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {isRegisterMode ? (
                            <span>
                                Hai già un account?{' '}
                                <button type="button" onClick={() => { setIsRegisterMode(false); setError(null); }} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                                    Accedi
                                </button>
                            </span>
                        ) : (
                            <span>
                                Non hai un account?{' '}
                                <button type="button" onClick={() => { setIsRegisterMode(true); setError(null); }} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                                    Registrati
                                </button>
                            </span>
                        )}
                    </div>

                    <div className="divider">oppure</div>

                    <button className="btn-google" onClick={handleGoogleLogin}>
                        <GoogleIcon /> Accedi con Google
                    </button>
                </div>
            ) : (
                /* Interactive Mascot Onboarding Screen */
                <div className="onboarding-container">
                    <div className="onboarding-mascot-area">
                        <Blobb3D state={blobbState} size="large" color={customMascotColor} />
                        <div className="mascot-onboarding-tag">Blobb</div>
                    </div>
                    {renderOnboardingStep()}
                </div>
            )}
        </div>
    );
}

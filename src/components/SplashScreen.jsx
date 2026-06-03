import { useEffect, useState } from 'react';
import './SplashScreen.css';

export default function SplashScreen() {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Start fading out slightly before the parent removes the splash screen
        const timer = setTimeout(() => {
            setFadeOut(true);
        }, 1600);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
            <div className="splash-logo-container">
                {/* Glowing Background Effect */}
                <div className="splash-glow"></div>
                
                {/* Vector "S" Logo */}
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="splash-logo">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" opacity="0.15" fill="var(--accent-color)" />
                    <path d="M8 14.5c0 1.5 2 2.5 4 2.5s4-1 4-2.5c0-2.5-8-2-8-4.5C8 8.5 10 7.5 12 7.5s4 1 4 2.5" className="logo-s-path" />
                </svg>

                {/* Micro-loading Line */}
                <div className="splash-loader-bar">
                    <div className="splash-loader-progress"></div>
                </div>
                
                <span className="splash-title">SYNAPSIA</span>
            </div>
        </div>
    );
}

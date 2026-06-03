import { useApp } from '../context/AppContext';

// Helper function to get the CSS filter that tints the mascot color
function getMascotFilter(hexColor) {
    switch (hexColor.toLowerCase()) {
        case '#ff758f': // Rosa
            return 'hue-rotate(150deg) saturate(1.2)';
        case '#52b788': // Verde
            return 'hue-rotate(-50deg) saturate(1.1)';
        case '#7950f2': // Viola
            return 'hue-rotate(65deg) saturate(1.3)';
        case '#f59f00': // Ambra
            return 'hue-rotate(200deg) saturate(1.4) brightness(0.95)';
        case '#48cae4': // Aqua
        default:
            return 'none';
    }
}

export default function Blobb3D({ state = 'idle', size = 'medium', color }) {
    const context = useApp();
    const mascotColor = context ? context.mascotColor : '#48cae4';
    const finalColor = color || mascotColor || '#48cae4';
    const filter = getMascotFilter(finalColor);

    const sizeMap = {
        mini: { width: '40px', height: '50px' },
        small: { width: '80px', height: '100px' },
        medium: { width: '160px', height: '200px' },
        home: { width: '200px', height: '250px' },
        large: { width: '280px', height: '350px' }
    };

    // Class name based on state for CSS animations
    const animationClass = `blobb-state-${state}`;

    const imageMap = {
        idle: '/assets/blobb_saluto.png',
        curious: '/assets/blobb_sorpreso.png',
        skeptical: '/assets/blobb_triste.png',
        dance: '/assets/blobb_felice.png',
        yawning: '/assets/blobb_rilassato.png'
    };

    const imgSrc = imageMap[state] || '/assets/blobb_saluto.png';

    return (
        <div 
            className={`blobb-mascot-container ${animationClass}`}
            style={{ 
                ...sizeMap[size], 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
            }}
        >
            <div className="blobb-mascot-wrapper" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                <img 
                    src={imgSrc} 
                    alt="Blobb Mascot" 
                    style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: 'contain',
                        filter: `${filter} drop-shadow(0 8px 24px rgba(15, 23, 42, 0.08))`
                    }} 
                />
            </div>
        </div>
    );
}

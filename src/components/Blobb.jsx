import { useState, useEffect } from 'react';
import './Blobb.css';
import blobbImg from '../assets/blobb.jpg';

export default function Blobb({ state = 'idle', size = 'medium' }) {
    // state can be: 'idle', 'curious', 'dance', 'amazed', 'skeptical', 'yawning'

    return (
        <div className={`blobb-container blobb-${size} blobb-state-${state}`}>
            <div className="blobb-image-wrapper">
                <img src={blobbImg} alt="Blobb Mascot" className="blobb-image" />
            </div>
            <div className="blobb-glow"></div>
        </div>
    );
}

import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useApp } from '../context/AppContext';
import LoginOnboarding from '../pages/LoginOnboarding';
import './Layout.css';

export default function Layout() {
    const { user, isOnboarded } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && isOnboarded) {
            const hasStarted = sessionStorage.getItem('synapsia_session_started');
            if (!hasStarted) {
                sessionStorage.setItem('synapsia_session_started', 'true');
                navigate('/');
            }
        }
    }, [user, isOnboarded, navigate]);

    // For testing purposes, if you want to bypass login, comment out the if block.
    if (!user || !isOnboarded) {
        return <LoginOnboarding />;
    }

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-wrapper">
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Brain, User, ChevronLeft, ChevronRight } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    const navItems = [
        { path: '/', name: 'Home', icon: Home },
        { path: '/synapsia', name: 'My Brain', icon: Brain },
        { path: '/profilo', name: 'Profilo', icon: User },
    ];

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-container">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" opacity="0.2" fill="var(--accent-color)" />
                        <path d="M8 14.5c0 1.5 2 2.5 4 2.5s4-1 4-2.5c0-2.5-8-2-8-4.5C8 8.5 10 7.5 12 7.5s4 1 4 2.5" />
                    </svg>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        title={collapsed ? item.name.replace('\n', ' ') : ''}
                    >
                        <div className="nav-icon-wrapper">
                            <item.icon className="nav-icon" size={24} />
                        </div>
                        {!collapsed && (
                            <span className="nav-label">
                                {item.name.split('\n').map((line, i) => (
                                    <span key={i} style={{ display: 'block', fontSize: i === 1 ? '0.75rem' : 'inherit', opacity: i === 1 ? 0.7 : 1 }}>
                                        {line}
                                    </span>
                                ))}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>
            
            <button
                className="collapse-btn"
                onClick={() => setCollapsed(!collapsed)}
                aria-label="Toggle sidebar"
            >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
        </aside>
    );
}

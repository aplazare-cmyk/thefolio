// frontend/src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RL_KEY = 'writeza_reading_list';
const getRLCount = () => {
    try { return (JSON.parse(localStorage.getItem(RL_KEY)) || []).length; }
    catch { return 0; }
};

export default function Navbar({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Initialise darkMode from localStorage immediately
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [scrolled, setScrolled] = useState(false);
    const [rlCount, setRlCount]   = useState(getRLCount());

    useEffect(() => {
        // Sync body class with state on mount
        if (darkMode) document.body.classList.add('dark-mode');
        else document.body.classList.remove('dark-mode');

        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);

        const onStorage = () => setRlCount(getRLCount());
        window.addEventListener('storage', onStorage);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('storage', onStorage);
        };
    }, [darkMode]);

    const toggleTheme = () => {
        const next = !darkMode;
        setDarkMode(next);
        document.body.classList.toggle('dark-mode', next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
    };

    const handleLogout = () => { logout(); navigate('/home'); };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

            <header style={{ boxShadow: scrolled ? 'var(--sh-sm)' : 'none' }}>
                <nav>
                    <div className="logo" onClick={() => navigate('/home')}>Writeza</div>

                    <ul>
                        {/* Home — always */}
                        <li>
                            <NavLink to="/home" className={({ isActive }) => isActive ? 'active' : ''}>
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3"/></svg>
                                Home
                            </NavLink>
                        </li>

                        {/* About — guests only */}
                        {!user && (
                            <li>
                                <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 16v-4M12 8h.01"/></svg>
                                    About
                                </NavLink>
                            </li>
                        )}

                        {/* My Posts + Reading List — logged in only */}
                        {user && (
                            <>
                                <li>
                                    <NavLink to="/my-posts" className={({ isActive }) => isActive ? 'active' : ''}>
                                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                                        My Posts
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/reading-list" className={({ isActive }) => isActive ? 'active' : ''} style={{ position: 'relative' }}>
                                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                                        Reading List
                                        {rlCount > 0 && (
                                            <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: 'var(--accent)', color: '#fff', borderRadius: '50%', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {rlCount}
                                            </span>
                                        )}
                                    </NavLink>
                                </li>
                            </>
                        )}

                        {/* Contact — always */}
                        <li>
                            <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                Contact
                            </NavLink>
                        </li>

                        {/* Guest links */}
                        {!user && (
                            <>
                                <li>
                                    <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''}>
                                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                        Register
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/login" className={({ isActive }) => `nav-cta${isActive ? ' active' : ''}`}>Log In</NavLink>
                                </li>
                            </>
                        )}

                        {/* Logged-in links */}
                        {user && (
                            <>
                                <li>
                                    <NavLink to="/create-post" className={({ isActive }) => `nav-write${isActive ? ' active' : ''}`}>
                                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                        Write
                                    </NavLink>
                                </li>
                                {user.role === 'admin' && (
                                    <li>
                                        <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
                                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                                            Admin
                                        </NavLink>
                                    </li>
                                )}
                                <li>
                                    <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {user.profilePic
                                            ? <img src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${user.profilePic}`} alt="" className="nav-avatar" />
                                            : <div className="nav-avatar-initials">{user.name?.charAt(0).toUpperCase()}</div>
                                        }
                                        {user.name?.split(' ')[0]}
                                    </NavLink>
                                </li>
                                <li>
                                    <button onClick={handleLogout}
                                        style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-3)', padding: '6px 14px', borderRadius: 'var(--r-sm)', fontSize: '0.74rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}>
                                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                                        Log Out
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>

                    {/* Theme toggle — shows correct state immediately */}
                    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                        <span className="toggle-knob" style={{ transform: darkMode ? 'translateX(19px)' : 'translateX(0)' }} />
                    </button>
                </nav>
            </header>

            <div style={{ flex: 1 }}>
                {children}
            </div>

            <footer style={{ padding: '20px 5%', borderTop: '1px solid var(--border)', background: 'var(--bg-3)', transition: 'background var(--t-slow)' }}>
                <div style={{ maxWidth: 1360, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-4)', margin: 0 }}>
                        © 2026 Writeza — A creative writing community. All rights reserved.
                    </p>
                    <p style={{ display: 'flex', gap: 16, margin: 0 }}>
                        <a href="/contact" style={{ fontSize: '0.78rem', color: 'var(--text-4)' }}>Privacy</a>
                        <a href="/contact" style={{ fontSize: '0.78rem', color: 'var(--text-4)' }}>Terms</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}

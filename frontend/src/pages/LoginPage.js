// frontend/src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { login }  = useAuth();
    const navigate   = useNavigate();
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd]   = useState(false);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            navigate(user.role === 'admin' ? '/admin' : '/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally { setLoading(false); }
    };

    const EyeOn  = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    const EyeOff = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

    return (
        <div className="register-wrapper">
            <main className="register-split-layout">

                {/* LEFT — form */}
                <div className="register-left">
                    <div className="register-form-container">
                        <div className="auth-heading">
                            <span className="eyebrow">Welcome back</span>
                            <h2>Log in to Writeza</h2>
                            <p>Don't have an account? <Link to="/register">Register free</Link></p>
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(179,58,58,0.07)', border: '1px solid rgba(179,58,58,0.2)', borderRadius: 'var(--r-sm)', padding: '11px 15px', marginBottom: 22, color: 'var(--red)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                {error}
                            </div>
                        )}

                        <form className="register-form" onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: 22 }}>
                                <label>Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="your@email.com" required autoFocus />
                            </div>
                            <div className="form-group" style={{ marginBottom: 10 }}>
                                <label>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPwd ? 'text' : 'password'} value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Enter your password" required
                                        style={{ paddingRight: 38 }} />
                                    <button type="button" onClick={() => setShowPwd(p => !p)}
                                        style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', padding: '2px 4px' }}>
                                        {showPwd ? <EyeOff /> : <EyeOn />}
                                    </button>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', marginBottom: 28 }}>
                                <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>
                                    Forgot password?
                                </Link>
                            </div>
                            <button type="submit" className="register-button" disabled={loading}>
                                {loading ? '⏳ Logging in…' : 'Log In'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT — decorative */}
                <div className="register-right">
                    <div className="register-right-content">
                        <div className="register-right-overlay">
                            <span className="eyebrow">Writeza Community</span>
                            <h2>Your stories are waiting</h2>
                            <p>Log back in to continue writing, reading, and connecting with fellow writers on Writeza.</p>
                            <div className="community-features">
                                {[
                                    { icon: '✍️', title: 'Continue writing',  desc: 'Pick up where you left off'             },
                                    { icon: '📖', title: 'Read new stories',  desc: 'See what the community has posted'      },
                                    { icon: '❤️', title: 'Vote and save',     desc: 'Like posts and build your reading list' },
                                    { icon: '👥', title: 'Follow writers',    desc: 'Stay updated on your favourite authors'  },
                                ].map(f => (
                                    <div key={f.title} className="feature-item">
                                        <span className="feature-icon">{f.icon}</span>
                                        <div className="feature-item-text">
                                            <strong>{f.title}</strong>
                                            <span>{f.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
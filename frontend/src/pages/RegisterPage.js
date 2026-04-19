// frontend/src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const FEATURES = [
    { icon: '📝', title: 'Publish your work',    desc: 'Write and share poems, stories, and essays' },
    { icon: '💬', title: 'Join conversations',   desc: 'Comment and engage with fellow writers'     },
    { icon: '👤', title: 'Build your portfolio', desc: 'Create your personalized writing profile'   },
    { icon: '🌍', title: 'Grow your audience',   desc: 'Connect with readers who love great writing' },
];

export default function RegisterPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [showCfm, setShowCfm] = useState(false);
    const [strength, setStrength] = useState({ label: '', color: '', width: 0 });

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (error) setError('');
        if (name === 'password') evalStrength(value);
    };

    const evalStrength = (pw) => {
        let s = 0;
        if (pw.length >= 8) s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[a-z]/.test(pw)) s++;
        if (/\d/.test(pw)) s++;
        if (/[^A-Za-z0-9]/.test(pw)) s++;
        if (!pw) return setStrength({ label: '', color: '', width: 0 });
        if (s <= 2) return setStrength({ label: 'Weak', color: '#dc2626', width: 30 });
        if (s <= 3) return setStrength({ label: 'Fair', color: '#f59e0b', width: 60 });
        setStrength({ label: 'Strong', color: '#10b981', width: 100 });
    };

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'Name is required.';
        if (!form.email.trim()) newErrors.email = 'Email is required.';
        if (form.password.length < 6) newErrors.password = 'Min 6 characters.';
        if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!validate()) return;
        
        setLoading(true);
        try {
            // Register the user
            await API.post('/auth/register', {
                name: form.name,
                email: form.email,
                password: form.password
            });
            
            // Auto login after registration
            await login(form.email, form.password);
            
            setSuccess(true);
            setTimeout(() => navigate('/home'), 1800);
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            setLoading(false);
        }
    };

    const EyeOn = () => (
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    );

    const EyeOff = () => (
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
    );

    return (
        <div className="register-wrapper">
            <main className="register-split-layout">
                <div className="register-left">
                    <div className="register-form-container">
                        {!success ? (
                            <>
                                <div className="auth-heading">
                                    <span className="eyebrow">Join Writeza</span>
                                    <h2>Create your account</h2>
                                    <p>Already a member? <Link to="/login">Sign in here</Link></p>
                                </div>

                                {error && (
                                    <div style={{ background: 'rgba(179,58,58,0.07)', border: '1px solid rgba(179,58,58,0.2)', borderRadius: '8px', padding: '11px 15px', marginBottom: 22, color: '#dc2626', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="12" y1="8" x2="12" y2="12"/>
                                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                                        </svg>
                                        {error}
                                    </div>
                                )}

                                <form className="register-form" onSubmit={handleSubmit}>
                                    <div className="form-group" style={{ marginBottom: 22 }}>
                                        <label>Full Name</label>
                                        <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Your full name" required autoFocus />
                                        {errors.name && <span className="error" style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{errors.name}</span>}
                                    </div>
                                    
                                    <div className="form-group" style={{ marginBottom: 22 }}>
                                        <label>Email Address</label>
                                        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
                                        {errors.email && <span className="error" style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{errors.email}</span>}
                                    </div>
                                    
                                    <div className="form-group" style={{ marginBottom: 22 }}>
                                        <label>Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <input name="password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min 6 characters" required style={{ paddingRight: 38 }} />
                                            <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '2px 4px' }}>
                                                {showPwd ? <EyeOff /> : <EyeOn />}
                                            </button>
                                        </div>
                                        {form.password.length > 0 && (
                                            <div style={{ marginTop: 8 }}>
                                                <div style={{ height: 2, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${strength.width}%`, background: strength.color, borderRadius: 2, transition: 'all 0.3s' }} />
                                                </div>
                                                <span style={{ fontSize: '0.7rem', color: strength.color, fontWeight: 600, marginTop: 3, display: 'block' }}>{strength.label}</span>
                                            </div>
                                        )}
                                        {errors.password && <span className="error" style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{errors.password}</span>}
                                    </div>
                                    
                                    <div className="form-group" style={{ marginBottom: 28 }}>
                                        <label>Confirm Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <input name="confirmPassword" type={showCfm ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} placeholder="Repeat your password" required style={{ paddingRight: 38 }} />
                                            <button type="button" onClick={() => setShowCfm(!showCfm)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '2px 4px' }}>
                                                {showCfm ? <EyeOff /> : <EyeOn />}
                                            </button>
                                        </div>
                                        {form.confirmPassword.length > 0 && (
                                            <span style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, color: form.password === form.confirmPassword ? '#10b981' : '#dc2626' }}>
                                                {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                            </span>
                                        )}
                                        {errors.confirmPassword && <span className="error" style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{errors.confirmPassword}</span>}
                                    </div>
                                    
                                    <button type="submit" className="register-button" disabled={loading} style={{ width: '100%', padding: '12px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                                        {loading ? '⏳ Creating account…' : 'Join Writeza'}
                                    </button>
                                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 14, textAlign: 'center', lineHeight: 1.6 }}>
                                        By joining, you agree to write and share respectfully within the Writeza community.
                                    </p>
                                </form>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '48px 0' }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                    <svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '1.8rem', marginBottom: 10 }}>Welcome to Writeza! ✍️</h3>
                                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Your account is ready. Taking you to the community now…</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="register-right">
                    <div className="register-right-content">
                        <div className="register-right-overlay">
                            <span className="eyebrow">The Writeza Community</span>
                            <h2>Your Writing Home Awaits</h2>
                            <p>Join writers who use Writeza to publish their work, build their portfolio, and connect with readers who love authentic storytelling.</p>
                            <div className="community-features">
                                {FEATURES.map(f => (
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
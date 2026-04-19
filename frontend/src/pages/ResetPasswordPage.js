// frontend/src/pages/ResetPasswordPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function ResetPasswordPage() {
    const { token } = useParams();
    const navigate  = useNavigate();

    const [tokenValid, setTokenValid]   = useState(null); // null=checking, true, false
    const [password, setPassword]       = useState('');
    const [confirm, setConfirm]         = useState('');
    const [showPwd, setShowPwd]         = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [status, setStatus]           = useState('idle'); // idle | loading | success | error
    const [message, setMessage]         = useState('');
    const [strength, setStrength]       = useState({ label: '', color: '#e0d8d0', width: 0 });

    // Validate token on page load
    useEffect(() => {
        API.get(`/auth/reset-password/${token}`)
            .then(() => setTokenValid(true))
            .catch(() => setTokenValid(false));
    }, [token]);

    const evaluateStrength = (pw) => {
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[a-z]/.test(pw)) score++;
        if (/\d/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        if (!pw.length) return setStrength({ label: '', color: '#e0d8d0', width: 0 });
        if (score <= 2) return setStrength({ label: 'Weak', color: '#e05050', width: 33 });
        if (score <= 4) return setStrength({ label: 'Fair', color: '#f0ad4e', width: 66 });
        setStrength({ label: 'Strong', color: '#5cb85c', width: 100 });
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        evaluateStrength(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (password.length < 6) { setMessage('Password must be at least 6 characters.'); setStatus('error'); return; }
        if (password !== confirm) { setMessage('Passwords do not match.'); setStatus('error'); return; }

        setStatus('loading');
        try {
            const { data } = await API.post(`/auth/reset-password/${token}`, { password });
            setMessage(data.message);
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to reset password.');
            setStatus('error');
        }
    };

    // ── Checking token ──
    if (tokenValid === null) return (
        <div className="register-wrapper">
            <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>⏳ Verifying your reset link…</p>
            </main>
        </div>
    );

    // ── Invalid / expired token ──
    if (tokenValid === false) return (
        <div className="register-wrapper">
            <main className="register-split-layout">
                <div className="register-left">
                    <div className="register-form-container" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 56, marginBottom: 16 }}>⏰</div>
                        <h2 style={{ color: '#e05050', marginBottom: 12 }}>Link Expired</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                            This password reset link is invalid or has expired.
                            Reset links are only valid for <strong>15 minutes</strong>.
                        </p>
                        <Link to="/forgot-password"
                            style={{ display: 'inline-block', padding: '12px 28px', background: 'var(--accent)', color: '#fff', borderRadius: 8, fontSize: 14, textDecoration: 'none', fontWeight: 600, marginBottom: 16 }}>
                            Request a New Link
                        </Link>
                        <br />
                        <Link to="/login" style={{ color: 'var(--accent)', fontSize: 14 }}>Back to Login</Link>
                    </div>
                </div>
                <div className="register-right">
                    <div className="register-right-content">
                        <div className="register-right-overlay">
                            <h2>Link Expired</h2>
                            <p>Reset links expire after 15 minutes for your security. Request a new one.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );

    return (
        <div className="register-wrapper">
            <main className="register-split-layout">

                {/* LEFT — Form */}
                <div className="register-left">
                    <div className="register-form-container">

                        <div style={{ marginBottom: 28 }}>
                            <Link to="/login" style={{ color: 'var(--accent)', fontSize: 14, textDecoration: 'none' }}>
                                ← Back to Login
                            </Link>
                        </div>

                        <h2 style={{ marginBottom: 8, fontSize: 22 }}>Create New Password</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
                            Choose a strong new password for your account.
                        </p>

                        {/* Success */}
                        {status === 'success' && (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                                <h3 style={{ color: '#5cb85c', marginBottom: 10 }}>Password Reset!</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                                    Your password has been updated successfully.
                                    Redirecting you to login in 3 seconds…
                                </p>
                                <Link to="/login"
                                    style={{ padding: '12px 28px', background: 'var(--accent)', color: '#fff', borderRadius: 8, fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>
                                    Log In Now
                                </Link>
                            </div>
                        )}

                        {/* Form */}
                        {status !== 'success' && (
                            <form onSubmit={handleSubmit} className="register-form">
                                {status === 'error' && message && (
                                    <div style={{ background: 'rgba(224,80,80,0.1)', border: '1px solid #e05050', borderRadius: 8, padding: '10px 14px', color: '#e05050', fontSize: 14, marginBottom: 16 }}>
                                        {message}
                                    </div>
                                )}

                                {/* New password */}
                                <div className="form-group">
                                    <label>New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPwd ? 'text' : 'password'}
                                            value={password}
                                            onChange={handlePasswordChange}
                                            placeholder="Min 6 characters"
                                            required
                                            style={{ paddingRight: 44, width: '100%' }}
                                        />
                                        <button type="button" onClick={() => setShowPwd(p => !p)}
                                            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 0 }}>
                                            {showPwd ? '🙈' : '👁️'}
                                        </button>
                                    </div>

                                    {/* Strength bar */}
                                    {password.length > 0 && (
                                        <div style={{ marginTop: 8 }}>
                                            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${strength.width}%`, background: strength.color, borderRadius: 2, transition: 'all 0.3s' }} />
                                            </div>
                                            <p style={{ fontSize: 12, color: strength.color, marginTop: 4, fontWeight: 600 }}>{strength.label}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm password */}
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirm}
                                            onChange={e => setConfirm(e.target.value)}
                                            placeholder="Repeat your new password"
                                            required
                                            style={{ paddingRight: 44, width: '100%' }}
                                        />
                                        <button type="button" onClick={() => setShowConfirm(p => !p)}
                                            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 0 }}>
                                            {showConfirm ? '🙈' : '👁️'}
                                        </button>
                                    </div>

                                    {/* Match indicator */}
                                    {confirm.length > 0 && (
                                        <p style={{ fontSize: 12, marginTop: 4, color: password === confirm ? '#5cb85c' : '#e05050', fontWeight: 600 }}>
                                            {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="register-button"
                                    disabled={status === 'loading' || !password || !confirm}>
                                    {status === 'loading' ? '⏳ Resetting…' : '🔒 Reset Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* RIGHT — Decorative */}
                <div className="register-right">
                    <div className="register-right-content">
                        <div className="register-right-overlay">
                            <h2>Create New Password</h2>
                            <p>Choose something strong and memorable to keep your account secure.</p>
                            <div className="community-features">
                                {[
                                    { icon: '🔤', label: 'At least 6 characters' },
                                    { icon: '🔢', label: 'Mix letters & numbers' },
                                    { icon: '🔣', label: 'Add special characters' },
                                    { icon: '🚫', label: "Don't reuse old passwords" },
                                ].map(({ icon, label }) => (
                                    <div key={label} className="feature-item">
                                        <span className="feature-icon">{icon}</span>
                                        <span>{label}</span>
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
// frontend/src/pages/ForgotPasswordPage.js
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

// ── EmailJS config ──────────────────────────────────────────
// Sign up FREE at https://www.emailjs.com and replace these:
const EMAILJS_SERVICE_ID  = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

async function sendCodeEmail({ toEmail, toName, code }) {
    const payload = {
        service_id:  EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id:     EMAILJS_PUBLIC_KEY,
        template_params: { to_email: toEmail, to_name: toName, code, expiry: '5 minutes' },
    };
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('EmailJS send failed');
}

export default function ForgotPasswordPage() {
    const [step, setStep]               = useState(1);
    const [email, setEmail]             = useState('');
    const [, setUserName]               = useState('');
    const [code, setCode]               = useState(['','','','','','']);
    const [resetToken, setResetToken]   = useState('');
    const [password, setPassword]       = useState('');
    const [confirm, setConfirm]         = useState('');
    const [showPwd, setShowPwd]         = useState(false);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState('');
    const [timer, setTimer]             = useState(300);
    const [timerActive, setTimerActive] = useState(false);
    const [strength, setStrength]       = useState({ label: '', color: '', width: 0 });
    const codeRefs = useRef([]);

    useEffect(() => {
        if (!timerActive || timer <= 0) return;
        const t = setInterval(() => setTimer(p => {
            if (p <= 1) { clearInterval(t); setTimerActive(false); return 0; }
            return p - 1;
        }), 1000);
        return () => clearInterval(t);
    }, [timerActive, timer]);

    const formatTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    const evalStrength = pw => {
        let s = 0;
        if (pw.length >= 8) s++; if (/[A-Z]/.test(pw)) s++;
        if (/[a-z]/.test(pw)) s++; if (/\d/.test(pw)) s++;
        if (/[^A-Za-z0-9]/.test(pw)) s++;
        if (!pw.length) return setStrength({ label: '', color: '', width: 0 });
        if (s <= 2) return setStrength({ label: 'Weak',   color: 'var(--red)',   width: 33 });
        if (s <= 4) return setStrength({ label: 'Fair',   color: 'var(--gold)',  width: 66 });
        setStrength({ label: 'Strong', color: 'var(--green)', width: 100 });
    };

    const handleSendCode = async e => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const { data } = await API.post('/auth/forgot-password', { email });
            if (!data.sent) { setError('No account found with that email.'); setLoading(false); return; }
            setUserName(data.userName);
            try { await sendCodeEmail({ toEmail: email, toName: data.userName, code: data.code }); } catch {}
            setStep(2); setTimer(300); setTimerActive(true);
        } catch (err) { setError(err.response?.data?.message || 'Failed. Try again.'); }
        finally { setLoading(false); }
    };

    const handleCodeInput = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const nc = [...code]; nc[index] = value.slice(-1); setCode(nc);
        if (value && index < 5) codeRefs.current[index + 1]?.focus();
    };

    const handleCodeKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) codeRefs.current[index - 1]?.focus();
    };

    const handleCodePaste = e => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) { setCode(pasted.split('')); codeRefs.current[5]?.focus(); }
    };

    const handleVerifyCode = async e => {
        e.preventDefault(); setError('');
        const fullCode = code.join('');
        if (fullCode.length < 6) { setError('Please enter the full 6-digit code.'); return; }
        if (timer <= 0) { setError('Code has expired. Please request a new one.'); return; }
        setLoading(true);
        try {
            const { data } = await API.post('/auth/verify-code', { email, code: fullCode });
            setResetToken(data.resetToken); setStep(3);
        } catch (err) { setError(err.response?.data?.message || 'Invalid code.'); }
        finally { setLoading(false); }
    };

    const handleResetPassword = async e => {
        e.preventDefault(); setError('');
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (password !== confirm) { setError('Passwords do not match.'); return; }
        setLoading(true);
        try {
            await API.post('/auth/reset-password', { resetToken, password });
            setStep(4);
        } catch (err) { setError(err.response?.data?.message || 'Failed to reset password.'); }
        finally { setLoading(false); }
    };

    const handleResend = async () => {
        setError(''); setCode(['','','','','','']); setLoading(true);
        try {
            const { data } = await API.post('/auth/forgot-password', { email });
            if (data.sent) {
                try { await sendCodeEmail({ toEmail: email, toName: data.userName, code: data.code }); } catch {}
                setTimer(300); setTimerActive(true); codeRefs.current[0]?.focus();
            }
        } catch { setError('Failed to resend.'); }
        finally { setLoading(false); }
    };

    const steps = ['Email', 'Verify Code', 'New Password'];

    return (
        <div className="register-wrapper">
            <main className="register-split-layout">
                <div className="register-left">
                    <div className="register-form-container">
                        {step < 4 && <div style={{ marginBottom: 24 }}><Link to="/login" style={{ color: 'var(--accent)', fontSize: 14, textDecoration: 'none' }}>← Back to Login</Link></div>}

                        {step < 4 && (
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
                                {steps.map((label, i) => (
                                    <React.Fragment key={label}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: i + 1 <= step ? 'var(--accent)' : 'var(--border)', color: i + 1 <= step ? '#fff' : 'var(--text-3)', transition: 'all 0.3s' }}>
                                                {i + 1 < step ? '✓' : i + 1}
                                            </div>
                                            <span style={{ fontSize: 11, color: i + 1 <= step ? 'var(--accent)' : 'var(--text-3)', whiteSpace: 'nowrap', fontWeight: i + 1 === step ? 600 : 400 }}>{label}</span>
                                        </div>
                                        {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i + 1 < step ? 'var(--accent)' : 'var(--border)', margin: '0 8px', marginBottom: 24, transition: 'background 0.3s' }} />}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}

                        {error && <div style={{ background: 'rgba(179,58,58,0.07)', border: '1px solid rgba(179,58,58,0.2)', borderRadius: 8, padding: '10px 14px', color: 'var(--red)', fontSize: 14, marginBottom: 20 }}>{error}</div>}

                        {step === 1 && (
                            <>
                                <h2 style={{ marginBottom: 8 }}>Forgot Password?</h2>
                                <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Enter your registered email and we'll send a <strong>6-digit code</strong>.</p>
                                <form onSubmit={handleSendCode} className="register-form">
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your registered email" required autoFocus />
                                    </div>
                                    <button type="submit" className="register-button" disabled={loading || !email.trim()}>{loading ? '⏳ Sending…' : '📧 Send Verification Code'}</button>
                                </form>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h2 style={{ marginBottom: 8 }}>Enter Verification Code</h2>
                                <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 12, lineHeight: 1.6 }}>We sent a 6-digit code to <strong>{email}</strong>.</p>
                                <div style={{ marginBottom: 24 }}>
                                    <span style={{ fontSize: 13, color: timer > 60 ? 'var(--green)' : 'var(--red)', fontWeight: 600, background: timer > 60 ? 'rgba(45,106,79,0.1)' : 'rgba(179,58,58,0.1)', padding: '4px 12px', borderRadius: 20, border: `1px solid ${timer > 60 ? 'rgba(45,106,79,0.3)' : 'rgba(179,58,58,0.3)'}` }}>
                                        ⏱ Expires in {formatTime(timer)}
                                    </span>
                                </div>
                                <form onSubmit={handleVerifyCode}>
                                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }} onPaste={handleCodePaste}>
                                        {code.map((digit, i) => (
                                            <input key={i} ref={el => codeRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={digit}
                                                onChange={e => handleCodeInput(i, e.target.value)} onKeyDown={e => handleCodeKeyDown(i, e)}
                                                style={{ width: 52, height: 60, textAlign: 'center', fontSize: 26, fontWeight: 700, border: `2px solid ${digit ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10, background: 'transparent', color: 'var(--text)', outline: 'none', fontFamily: 'monospace', transition: 'border-color 0.2s' }}
                                                autoFocus={i === 0} />
                                        ))}
                                    </div>
                                    <button type="submit" className="register-button" disabled={loading || code.join('').length < 6 || timer <= 0}>{loading ? '⏳ Verifying…' : '✅ Verify Code'}</button>
                                </form>
                                <div style={{ textAlign: 'center', marginTop: 20 }}>
                                    <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>{timer <= 0 ? 'Code expired.' : "Didn't receive it? Check spam."}</p>
                                    <button onClick={handleResend} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 14, cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-sans)', textDecoration: 'underline' }}>🔄 Resend Code</button>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <h2 style={{ marginBottom: 8 }}>Create New Password</h2>
                                <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Almost done! Choose a strong new password.</p>
                                <form onSubmit={handleResetPassword} className="register-form">
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); evalStrength(e.target.value); }} placeholder="Min 6 characters" required autoFocus style={{ paddingRight: 38 }} />
                                            <button type="button" onClick={() => setShowPwd(p => !p)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', padding: '2px 4px', fontSize: 16 }}>{showPwd ? '🙈' : '👁️'}</button>
                                        </div>
                                        {password.length > 0 && (
                                            <div style={{ marginTop: 8 }}>
                                                <div style={{ height: 2, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}><div style={{ height: '100%', width: `${strength.width}%`, background: strength.color, borderRadius: 2, transition: 'all 0.3s' }} /></div>
                                                <span style={{ fontSize: '0.7rem', color: strength.color, fontWeight: 600, marginTop: 3, display: 'block' }}>{strength.label}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm New Password</label>
                                        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your new password" required />
                                        {confirm.length > 0 && <span style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: 4, display: 'block', color: password === confirm ? 'var(--green)' : 'var(--red)' }}>{password === confirm ? '✓ Passwords match' : '✗ Do not match'}</span>}
                                    </div>
                                    <button type="submit" className="register-button" disabled={loading || !password || !confirm}>{loading ? '⏳ Saving…' : '🔒 Reset Password'}</button>
                                </form>
                            </>
                        )}

                        {step === 4 && (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                                <h2 style={{ color: 'var(--green)', marginBottom: 12 }}>Password Reset!</h2>
                                <p style={{ color: 'var(--text-3)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>Your password has been updated. You can now log in with your new password.</p>
                                <Link to="/login" style={{ display: 'inline-block', padding: '14px 36px', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--r-sm)', fontSize: 15, textDecoration: 'none', fontWeight: 700 }}>Log In Now →</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT */}
                <div className="register-right">
                    <div className="register-right-content">
                        <div className="register-right-overlay">
                            <h2>{['Forgot Password?', 'Check Your Email', 'Almost There!', "You're Back! 🎉"][step - 1]}</h2>
                            <p style={{ marginBottom: 28 }}>
                                {step === 1 && "Enter your email and we'll send a 6-digit code."}
                                {step === 2 && "Enter the 6-digit code from your inbox. Valid for 5 minutes."}
                                {step === 3 && "Create a strong new password to protect your account."}
                                {step === 4 && "Your password has been reset. Welcome back to Writeza!"}
                            </p>
                            <div className="community-features">
                                {[
                                    { icon: step > 1 ? '✅' : '📧', label: 'Enter your email' },
                                    { icon: step > 2 ? '✅' : '🔢', label: 'Verify 6-digit code' },
                                    { icon: step > 3 ? '✅' : '🔒', label: 'Create new password' },
                                    { icon: step >= 4 ? '✅' : '🚀', label: 'Log back in' },
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
// frontend/src/pages/ContactPage.js
import React, { useState } from 'react';
import API from '../api/axios';

const resources = [
    { icon: '📚', title: 'Poetry Foundation',         desc: 'Thousands of poems, poet biographies, and educational resources.',       href: 'https://www.poetryfoundation.org/poems', external: true  },
    { icon: '🎓', title: 'Academy of American Poets', desc: 'Daily poems, audio recordings, lesson plans, and poetry contests.',        href: 'https://poets.org',                      external: true  },
    { icon: '✍️', title: "Writer's Digest",           desc: 'Practical writing advice, creative prompts, and publishing tips.',         href: 'https://www.writersdigest.com',           external: true  },
    { icon: '🌐', title: 'All Poetry',                desc: "The web's largest poetry writing community — beginners to experts.",       href: 'https://allpoetry.com',                   external: true  },
    { icon: '📰', title: 'Poetry Daily',              desc: 'A fresh anthology of contemporary poetry updated every day.',              href: 'https://poems.com',                       external: true  },
    { icon: '🏠', title: 'Browse Writeza',            desc: 'Read poems, stories, and essays from the Writeza community.',             href: '/home',                                   external: false },
];

export default function ContactPage() {
    const [form, setForm]               = useState({ name: '', email: '', message: '' });
    const [errors, setErrors]           = useState({ name: '', email: '', message: '' });
    const [success, setSuccess]         = useState(false);
    const [loading, setLoading]         = useState(false);
    const [serverError, setServerError] = useState('');

    const emailRegex   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validateName    = v => !v.trim() ? 'Required.' : '';
    const validateEmail   = v => !v.trim() ? 'Required.' : !emailRegex.test(v) ? 'Invalid email.' : '';
    const validateMessage = v => !v.trim() ? 'Required.' : '';

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
        if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
        if (serverError) setServerError('');
    };

    const handleBlur = e => {
        const { name, value } = e.target;
        const err = name === 'name' ? validateName(value) : name === 'email' ? validateEmail(value) : validateMessage(value);
        setErrors(p => ({ ...p, [name]: err }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const ne = validateName(form.name), ee = validateEmail(form.email), me = validateMessage(form.message);
        setErrors({ name: ne, email: ee, message: me });
        if (ne || ee || me) return;
        setLoading(true); setServerError('');
        try {
            await API.post('/contact', form);
            setSuccess(true);
            setForm({ name: '', email: '', message: '' });
            setTimeout(() => setSuccess(false), 6000);
        } catch (err) {
            setServerError(err.response?.data?.message || 'Failed to send. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <main className="contact-page">
            <div className="contact-hero">
                <span className="eyebrow">Get in Touch</span>
                <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Contact Writeza</h1>
                <p>Have a question, suggestion, or just want to connect with the Writeza team? We'd love to hear from you.</p>
            </div>

            <div className="contact-body">
                {/* Form */}
                <div className="contact-form-section">
                    <h2>Send a Message</h2>
                    <p>Fill out the form and we'll get back to you as soon as possible.</p>

                    {success && (
                        <div style={{ background: 'rgba(45,106,79,0.08)', border: '1px solid rgba(45,106,79,0.25)', borderRadius: 'var(--r-md)', padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--green)' }}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Message sent! The Writeza team will get back to you soon.</span>
                        </div>
                    )}
                    {serverError && (
                        <div style={{ background: 'rgba(179,58,58,0.08)', border: '1px solid rgba(179,58,58,0.25)', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 24, color: 'var(--red)', fontSize: '0.88rem' }}>{serverError}</div>
                    )}

                    <form className="contact-form" onSubmit={handleSubmit} noValidate>
                        {[
                            { name: 'name',  type: 'text',  label: 'Your Name',     placeholder: 'Full name'       },
                            { name: 'email', type: 'email', label: 'Email Address', placeholder: 'your@email.com'  },
                        ].map(f => (
                            <div key={f.name} className="form-group">
                                <label>{f.label}</label>
                                <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange} onBlur={handleBlur} placeholder={f.placeholder} className={errors[f.name] ? 'input-error' : ''} />
                                <span className="error-message">{errors[f.name]}</span>
                            </div>
                        ))}
                        <div className="form-group">
                            <label>Message</label>
                            <textarea name="message" value={form.message} onChange={handleChange} onBlur={handleBlur} placeholder="Write your message here…" rows={5} className={errors.message ? 'input-error' : ''} />
                            <span className="error-message">{errors.message}</span>
                        </div>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? '⏳ Sending…' : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                                    Send Message
                                </span>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--border-3)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.3rem', marginBottom: 20 }}>Other Ways to Reach Writeza</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { label: 'Email', value: 'writeza@gmail.com',  href: 'mailto:writeza@gmail.com', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                                { label: 'Phone', value: '(+63) 912 345 6702', href: 'tel:+639123456702',       icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                            ].map(c => (
                                <a key={c.label} href={c.href}
                                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-md)', color: 'var(--text-2)', fontSize: '0.9rem', transition: 'all 0.2s', textDecoration: 'none' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)'; }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--accent)' }}>
                                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d={c.icon}/></svg>
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-4)', marginBottom: 2 }}>{c.label}</span>
                                        <span>{c.value}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Resources */}
                <div className="resources-section">
                    <h2>Resources &amp; Links</h2>
                    <p>Helpful links for writers and readers — curated for the Writeza community.</p>
                    <div className="resources-grid">
                        {resources.map(r => (
                            <div key={r.title} className="resource-card" onClick={() => { window.location.href = r.href; }}>
                                <div className="resource-card-inner">
                                    <div className="resource-card-icon">{r.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                            <h3>{r.title}</h3>
                                            {r.external && <span className="badge badge-neutral" style={{ fontSize: '0.58rem' }}>External</span>}
                                        </div>
                                        <p>{r.desc}</p>
                                        <span className="resource-link">
                                            {r.external ? 'Visit website' : 'Go to page'}
                                            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 40 }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.4rem', marginBottom: 8 }}>Find the Writeza Team</h3>
                        <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', marginBottom: 20 }}>Local writing events and workshops in the area.</p>
                        <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--sh-md)' }}>
                            <img src="/assets/CORDILLERA MAP.jpg" alt="Map" style={{ width: '100%', display: 'block' }} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
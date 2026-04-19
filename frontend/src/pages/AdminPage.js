// frontend/src/pages/AdminPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function AdminPage() {
    // Removed { user } here to fix the 'no-unused-vars' build error
    useAuth(); 
    const [tab, setTab] = useState('members');
    // ... the rest of your state variables stay the same

    // Data
    const [members, setMembers]   = useState([]);
    const [posts, setPosts]       = useState([]);
    const [comments, setComments] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [stats, setStats]       = useState({ members: 0, posts: 0, comments: 0, messages: 0 });

    // Loading / error
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    // Selected contact detail
    const [selectedContact, setSelectedContact] = useState(null);

    // Create admin form
    const [showCreateAdmin, setShowCreateAdmin] = useState(false);
    const [adminForm, setAdminForm]             = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [adminError, setAdminError]           = useState('');
    const [adminSuccess, setAdminSuccess]       = useState('');
    const [adminLoading, setAdminLoading]       = useState(false);

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [s, m, p, c, ct] = await Promise.all([
                API.get('/admin/stats'),
                API.get('/admin/users'),
                API.get('/admin/posts'),
                API.get('/admin/comments'),
                API.get('/admin/contacts'),
            ]);
            setStats(s.data);
            setMembers(m.data);
            setPosts(p.data);
            setComments(c.data);
            setContacts(ct.data);
        } catch (err) {
            setError('Failed to load dashboard data. Make sure you are logged in as admin.');
        } finally {
            setLoading(false);
        }
    };

    // ── Deactivate / reactivate member ──────────────────────
    const handleToggleStatus = async (id) => {
        try {
            const { data } = await API.put(`/admin/users/${id}/deactivate`);
            setMembers(prev => prev.map(m => m._id === id ? data : m));
            setStats(s => ({ ...s, members: members.filter(m => m.status === 'active').length }));
        } catch (err) { alert(err.response?.data?.message || 'Could not update status.'); }
    };

    // ── Delete post ─────────────────────────────────────────
    const handleDeletePost = async (id) => {
        if (!window.confirm('Delete this post and all its comments?')) return;
        try {
            await API.delete(`/admin/posts/${id}`);
            setPosts(prev => prev.filter(p => p._id !== id));
            setStats(s => ({ ...s, posts: s.posts - 1 }));
        } catch { alert('Could not delete post.'); }
    };

    // ── Delete comment ───────────────────────────────────────
    const handleDeleteComment = async (id) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await API.delete(`/admin/comments/${id}`);
            setComments(prev => prev.filter(c => c._id !== id));
            setStats(s => ({ ...s, comments: s.comments - 1 }));
        } catch { alert('Could not delete comment.'); }
    };

    // ── Mark contact as read ─────────────────────────────────
    const handleMarkRead = async (id) => {
        try {
            await API.put(`/admin/contacts/${id}/read`);
            setContacts(prev => prev.map(c => c._id === id ? { ...c, read: true } : c));
            setStats(s => ({ ...s, messages: Math.max(0, s.messages - 1) }));
        } catch {}
    };

    // ── Create admin account ─────────────────────────────────
    const handleCreateAdmin = async e => {
        e.preventDefault();
        setAdminError(''); setAdminSuccess('');
        if (adminForm.password !== adminForm.confirmPassword) { setAdminError('Passwords do not match.'); return; }
        if (adminForm.password.length < 6) { setAdminError('Password must be at least 6 characters.'); return; }
        setAdminLoading(true);
        try {
            await API.post('/admin/create-admin', {
                name:     adminForm.name,
                email:    adminForm.email,
                password: adminForm.password,
            });
            setAdminSuccess(`Admin account "${adminForm.name}" created successfully!`);
            setAdminForm({ name: '', email: '', password: '', confirmPassword: '' });
            loadAll(); // refresh members list
            setTimeout(() => { setShowCreateAdmin(false); setAdminSuccess(''); }, 3000);
        } catch (err) {
            setAdminError(err.response?.data?.message || 'Could not create admin account.');
        } finally { setAdminLoading(false); }
    };

    // ── Styles ───────────────────────────────────────────────
    const statCardStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 8 };
    const tableHeaderStyle = { fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-4)', padding: '10px 16px', borderBottom: '1px solid var(--border)', textAlign: 'left', background: 'var(--surface-2)' };
    const tableCellStyle = { padding: '14px 16px', borderBottom: '1px solid var(--border-2)', fontSize: '0.88rem', color: 'var(--text-2)', verticalAlign: 'middle' };
    const btnSmStyle = { padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', background: 'transparent', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-2)', fontFamily: 'var(--font-sans)', transition: 'all 0.18s' };
    const btnDangerStyle = { padding: '5px 12px', border: '1px solid rgba(179,58,58,0.3)', borderRadius: 'var(--r-sm)', background: 'rgba(179,58,58,0.06)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: 'var(--red)', fontFamily: 'var(--font-sans)', transition: 'all 0.18s' };
    const inputStyle = { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', padding: '10px 0', fontSize: '0.95rem', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-sans)' };
    const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 };

    const TABS = [
        { key: 'members',  label: 'Members',  count: members.length },
        { key: 'posts',    label: 'Posts',    count: posts.length   },
        { key: 'comments', label: 'Comments', count: comments.length },
        { key: 'contacts', label: 'Contacts', count: contacts.filter(c => !c.read).length },
    ];

    return (
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 5%' }}>

            {/* Header */}
            <div style={{ marginBottom: 40 }}>
                <span className="eyebrow">Dashboard</span>
                <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: '2.4rem', marginBottom: 6 }}>Admin Dashboard</h1>
                <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', margin: 0 }}>Manage all content, members, and messages.</p>
            </div>

            {error && (
                <div style={{ background: 'rgba(179,58,58,0.08)', border: '1px solid rgba(179,58,58,0.25)', borderRadius: 'var(--r-md)', padding: '14px 18px', marginBottom: 28, color: 'var(--red)', fontSize: '0.88rem' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
                {[
                    { icon: '👥', label: 'Total Members',  value: stats.members  },
                    { icon: '📝', label: 'Total Posts',    value: stats.posts    },
                    { icon: '💬', label: 'Comments',       value: stats.comments },
                    { icon: '📩', label: 'New Messages',   value: stats.messages },
                ].map(s => (
                    <div key={s.label} style={statCardStyle}>
                        <span style={{ fontSize: '1.6rem' }}>{s.icon}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{loading ? '…' : s.value}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-4)' }}>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 32, gap: 0 }}>
                {TABS.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.key ? 'var(--accent)' : 'transparent'}`, marginBottom: -1, fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: tab === t.key ? 600 : 400, color: tab === t.key ? 'var(--accent)' : 'var(--text-3)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {t.label}
                        {t.count > 0 && (
                            <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '1px 7px', borderRadius: 'var(--r-full)', background: tab === t.key ? 'var(--accent)' : 'var(--surface-3)', color: tab === t.key ? '#fff' : 'var(--text-3)' }}>{t.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '48px 0' }}><p style={{ color: 'var(--text-4)' }}>Loading dashboard…</p></div>}

            {/* ── MEMBERS TAB ── */}
            {!loading && tab === 'members' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.5rem', margin: 0 }}>Members ({members.length})</h2>
                        <button onClick={() => { setShowCreateAdmin(v => !v); setAdminError(''); setAdminSuccess(''); }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                            {showCreateAdmin ? '✕ Cancel' : '+ Create Admin Account'}
                        </button>
                    </div>

                    {/* Create admin form */}
                    {showCreateAdmin && (
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 'var(--r-xl)', padding: '32px', marginBottom: 28 }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.3rem', marginBottom: 4 }}>Create New Admin Account</h3>
                            <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginBottom: 24 }}>This will create a new account with admin privileges.</p>

                            {adminError && <div style={{ background: 'rgba(179,58,58,0.08)', border: '1px solid rgba(179,58,58,0.25)', borderRadius: 'var(--r-sm)', padding: '10px 16px', marginBottom: 20, color: 'var(--red)', fontSize: '0.85rem' }}>{adminError}</div>}
                            {adminSuccess && <div style={{ background: 'rgba(45,106,79,0.08)', border: '1px solid rgba(45,106,79,0.25)', borderRadius: 'var(--r-sm)', padding: '10px 16px', marginBottom: 20, color: 'var(--green)', fontSize: '0.85rem' }}>✓ {adminSuccess}</div>}

                            <form onSubmit={handleCreateAdmin} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 32px' }}>
                                <div>
                                    <label style={labelStyle}>Full Name</label>
                                    <input type="text" value={adminForm.name} onChange={e => setAdminForm(p => ({ ...p, name: e.target.value }))} placeholder="Admin name" required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email Address</label>
                                    <input type="email" value={adminForm.email} onChange={e => setAdminForm(p => ({ ...p, email: e.target.value }))} placeholder="admin@email.com" required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Password</label>
                                    <input type="password" value={adminForm.password} onChange={e => setAdminForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" required minLength={6} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Confirm Password</label>
                                    <input type="password" value={adminForm.confirmPassword} onChange={e => setAdminForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Repeat password" required style={inputStyle} />
                                    {adminForm.confirmPassword.length > 0 && (
                                        <span style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: 4, display: 'block', color: adminForm.password === adminForm.confirmPassword ? 'var(--green)' : 'var(--red)' }}>
                                            {adminForm.password === adminForm.confirmPassword ? '✓ Passwords match' : '✗ Do not match'}
                                        </span>
                                    )}
                                </div>
                                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                                    <button type="submit" disabled={adminLoading}
                                        style={{ padding: '10px 24px', background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-sans)', opacity: adminLoading ? 0.7 : 1 }}>
                                        {adminLoading ? 'Creating…' : 'Create Admin Account'}
                                    </button>
                                    <button type="button" onClick={() => setShowCreateAdmin(false)}
                                        style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-2)', fontFamily: 'var(--font-sans)' }}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Member', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => <th key={h} style={tableHeaderStyle}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {members.length === 0 ? (
                                    <tr><td colSpan={6} style={{ ...tableCellStyle, textAlign: 'center', color: 'var(--text-4)', padding: '32px' }}>No members yet.</td></tr>
                                ) : members.map(m => (
                                    <tr key={m._id}>
                                        <td style={tableCellStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                {m.profilePic
                                                    ? <img src={`http://localhost:5000/uploads/${m.profilePic}`} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                                                    : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>{m.name?.charAt(0).toUpperCase()}</div>
                                                }
                                                <span style={{ fontWeight: 500, color: 'var(--text)' }}>{m.name}</span>
                                            </div>
                                        </td>
                                        <td style={tableCellStyle}>{m.email}</td>
                                        <td style={tableCellStyle}>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--r-full)', background: m.role === 'admin' ? 'var(--accent-light)' : 'var(--surface-3)', color: m.role === 'admin' ? 'var(--accent)' : 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{m.role}</span>
                                        </td>
                                        <td style={tableCellStyle}>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--r-full)', background: m.status === 'active' ? 'rgba(45,106,79,0.1)' : 'rgba(179,58,58,0.1)', color: m.status === 'active' ? 'var(--green)' : 'var(--red)' }}>{m.status}</span>
                                        </td>
                                        <td style={{ ...tableCellStyle, color: 'var(--text-4)', fontSize: '0.82rem' }}>{new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td style={tableCellStyle}>
                                            {m.role !== 'admin' && (
                                                <button onClick={() => handleToggleStatus(m._id)}
                                                    style={m.status === 'active' ? btnDangerStyle : btnSmStyle}>
                                                    {m.status === 'active' ? 'Deactivate' : 'Reactivate'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── POSTS TAB ── */}
            {!loading && tab === 'posts' && (
                <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.5rem', marginBottom: 20 }}>Posts ({posts.length})</h2>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>{['Title', 'Author', 'Category', 'Status', 'Date', 'Actions'].map(h => <th key={h} style={tableHeaderStyle}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {posts.length === 0 ? (
                                    <tr><td colSpan={6} style={{ ...tableCellStyle, textAlign: 'center', color: 'var(--text-4)', padding: '32px' }}>No posts yet.</td></tr>
                                ) : posts.map(p => (
                                    <tr key={p._id}>
                                        <td style={{ ...tableCellStyle, maxWidth: 260 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                {p.image
                                                    ? <img src={`http://localhost:5000/uploads/${p.image}`} alt="" style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', objectFit: 'cover', flexShrink: 0 }} />
                                                    : <div style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>✒️</div>
                                                }
                                                <span style={{ fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{p.title}</span>
                                            </div>
                                        </td>
                                        <td style={{ ...tableCellStyle, color: 'var(--text-3)' }}>{p.author?.name || '—'}</td>
                                        <td style={tableCellStyle}>
                                            {p.category ? <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--r-full)', background: 'var(--accent-light)', color: 'var(--accent)' }}>{p.category}</span> : <span style={{ color: 'var(--text-4)' }}>—</span>}
                                        </td>
                                        <td style={tableCellStyle}>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--r-full)', background: p.status === 'published' ? 'rgba(45,106,79,0.1)' : 'rgba(179,58,58,0.1)', color: p.status === 'published' ? 'var(--green)' : 'var(--red)' }}>{p.status}</span>
                                        </td>
                                        <td style={{ ...tableCellStyle, color: 'var(--text-4)', fontSize: '0.82rem' }}>{new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td style={tableCellStyle}>
                                            <button onClick={() => handleDeletePost(p._id)} style={btnDangerStyle}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── COMMENTS TAB ── */}
            {!loading && tab === 'comments' && (
                <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.5rem', marginBottom: 20 }}>Comments ({comments.length})</h2>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>{['Author', 'Comment', 'On Post', 'Date', 'Actions'].map(h => <th key={h} style={tableHeaderStyle}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {comments.length === 0 ? (
                                    <tr><td colSpan={5} style={{ ...tableCellStyle, textAlign: 'center', color: 'var(--text-4)', padding: '32px' }}>No comments yet.</td></tr>
                                ) : comments.map(c => (
                                    <tr key={c._id}>
                                        <td style={{ ...tableCellStyle, fontWeight: 500, color: 'var(--text)' }}>{c.author?.name || '—'}</td>
                                        <td style={{ ...tableCellStyle, maxWidth: 300 }}>
                                            <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--text-2)' }}>{c.body}</span>
                                        </td>
                                        <td style={{ ...tableCellStyle, color: 'var(--text-3)', fontFamily: 'var(--font-display)', fontStyle: 'italic', maxWidth: 180 }}>
                                            <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.post?.title || '—'}</span>
                                        </td>
                                        <td style={{ ...tableCellStyle, color: 'var(--text-4)', fontSize: '0.82rem' }}>{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td style={tableCellStyle}>
                                            <button onClick={() => handleDeleteComment(c._id)} style={btnDangerStyle}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── CONTACTS TAB ── */}
            {!loading && tab === 'contacts' && (
                <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.5rem', marginBottom: 20 }}>
                        Contact Messages ({contacts.length})
                        {contacts.filter(c => !c.read).length > 0 && (
                            <span style={{ marginLeft: 12, fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--r-full)', background: 'var(--accent)', color: '#fff' }}>
                                {contacts.filter(c => !c.read).length} unread
                            </span>
                        )}
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: selectedContact ? '1fr 1fr' : '1fr', gap: 20 }}>
                        {/* Inbox list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {contacts.length === 0 ? (
                                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '48px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                                    <p style={{ color: 'var(--text-4)' }}>No messages yet.</p>
                                </div>
                            ) : contacts.map(c => (
                                <div key={c._id}
                                    onClick={() => { setSelectedContact(c); if (!c.read) handleMarkRead(c._id); }}
                                    style={{ background: 'var(--surface)', border: `1px solid ${selectedContact?._id === c._id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--r-lg)', padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                                    onMouseEnter={e => { if (selectedContact?._id !== c._id) e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                    onMouseLeave={e => { if (selectedContact?._id !== c._id) e.currentTarget.style.borderColor = 'var(--border)'; }}>
                                    {!c.read && (
                                        <span style={{ position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'block' }} />
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text)' }}>{c.name}</span>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-4)', margin: '0 0 6px' }}>{c.email}</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.message}</p>
                                </div>
                            ))}
                        </div>

                        {/* Detail panel */}
                        {selectedContact && (
                            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '28px', position: 'sticky', top: 80, height: 'fit-content' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                    <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.3rem', margin: 0 }}>{selectedContact.name}</h3>
                                    <button onClick={() => setSelectedContact(null)} style={{ background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, padding: 0 }}>✕</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                                    {[
                                        { label: 'Email',    value: selectedContact.email },
                                        { label: 'Date',     value: new Date(selectedContact.createdAt).toLocaleString() },
                                        { label: 'Status',   value: selectedContact.read ? 'Read' : 'Unread' },
                                    ].map(f => (
                                        <div key={f.label}>
                                            <span style={{ fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-4)', display: 'block', marginBottom: 2 }}>{f.label}</span>
                                            <span style={{ fontSize: '0.88rem', color: 'var(--text-2)' }}>{f.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                                    <span style={{ fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-4)', display: 'block', marginBottom: 10 }}>Message</span>
                                    <p style={{ fontSize: '0.92rem', color: 'var(--text-2)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{selectedContact.message}</p>
                                </div>
                                <div style={{ marginTop: 24 }}>
                                    <a href={`mailto:${selectedContact.email}?subject=Re: Your Writeza Message`}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--text)', color: 'var(--bg)', borderRadius: 'var(--r-sm)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                        Reply via Email
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
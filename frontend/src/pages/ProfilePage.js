// frontend/src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const TABS = ['Profile', 'Password', 'Settings'];

const S = {
    card:     { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'40px 48px', boxShadow:'var(--sh-md)', marginBottom:32 },
    label:    { display:'flex', alignItems:'center', gap:6, fontSize:'0.7rem', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8, fontFamily:'var(--font-sans)' },
    input:    { width:'100%', background:'transparent', border:'none', borderBottom:'1px solid var(--border)', padding:'10px 0', fontSize:'0.97rem', color:'var(--text)', outline:'none', fontFamily:'var(--font-sans)', fontWeight:300, transition:'border-color 0.2s' },
    btn:      { display:'inline-flex', alignItems:'center', gap:8, padding:'10px 22px', background:'var(--text)', color:'var(--bg)', border:'none', borderRadius:'var(--r-sm)', cursor:'pointer', fontSize:'0.78rem', fontWeight:600, fontFamily:'var(--font-sans)', transition:'all 0.2s' },
    btnOut:   { display:'inline-flex', alignItems:'center', gap:8, padding:'10px 22px', background:'transparent', color:'var(--text-2)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', cursor:'pointer', fontSize:'0.78rem', fontWeight:500, fontFamily:'var(--font-sans)', transition:'all 0.2s' },
    btnDanger:{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 22px', background:'rgba(179,58,58,0.08)', color:'var(--red)', border:'1px solid rgba(179,58,58,0.25)', borderRadius:'var(--r-sm)', cursor:'pointer', fontSize:'0.78rem', fontWeight:600, fontFamily:'var(--font-sans)', transition:'all 0.2s' },
};

export default function ProfilePage() {
    const { user, setUser, logout } = useAuth();
    const [tab, setTab]               = useState('Profile');
    const [posts, setPosts]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [editMode, setEditMode]     = useState(false);
    const [name, setName]             = useState('');
    const [bio, setBio]               = useState('');
    const [pic, setPic]               = useState(null);
    const [picPreview, setPicPreview] = useState(null);
    const [curPw, setCurPw]           = useState('');
    const [newPw, setNewPw]           = useState('');
    const [cfmPw, setCfmPw]           = useState('');
    const [deletePw, setDeletePw]     = useState('');
    const [showDelete, setShowDelete] = useState(false);
    const [msg, setMsg]               = useState('');
    const [msgType, setMsgType]       = useState('success');

    useEffect(() => {
        if (user) { setName(user.name || ''); setBio(user.bio || ''); }
        API.get('/posts/my').then(r => setPosts(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, [user]);

    const flash = (text, type = 'success') => {
        setMsg(text); setMsgType(type);
        setTimeout(() => setMsg(''), 4000);
    };

    const handleProfileSave = async e => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('name', name); fd.append('bio', bio);
        if (pic) fd.append('profilePic', pic);
        try {
            const { data } = await API.put('/auth/profile', fd);
            setUser(data); setEditMode(false); setPicPreview(null);
            flash('Profile updated!');
        } catch (err) { flash(err.response?.data?.message || 'Update failed.', 'error'); }
    };

    const handlePasswordChange = async e => {
        e.preventDefault();
        if (newPw !== cfmPw) { flash('New passwords do not match.', 'error'); return; }
        try {
            await API.put('/auth/change-password', { currentPassword: curPw, newPassword: newPw });
            setCurPw(''); setNewPw(''); setCfmPw('');
            flash('Password changed!');
        } catch (err) { flash(err.response?.data?.message || 'Failed.', 'error'); }
    };

    const handleDeleteAccount = async () => {
        try {
            await API.post('/auth/deactivate', { password: deletePw });
            logout();
        } catch (err) { flash(err.response?.data?.message || 'Incorrect password.', 'error'); }
    };

    const handleDeletePost = async id => {
        if (!window.confirm('Delete this post?')) return;
        try { await API.delete(`/posts/${id}`); setPosts(p => p.filter(x => x._id !== id)); }
        catch { flash('Could not delete post.', 'error'); }
    };

    const picSrc = picPreview || (user?.profilePic ? `http://localhost:5000/uploads/${user.profilePic}` : null);

    return (
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 5%' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
                {picSrc
                    ? <img src={picSrc} alt="avatar" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                    : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{user?.name?.charAt(0).toUpperCase()}</div>
                }
                <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: 4 }}>Your Account</span>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: '2.2rem', marginBottom: 2 }}>{user?.name}</h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', margin: 0 }}>{user?.email} · <span style={{ textTransform: 'capitalize' }}>{user?.role}</span></p>
                </div>
            </div>

            {/* Flash message */}
            {msg && (
                <div style={{ background: msgType === 'error' ? 'rgba(179,58,58,0.08)' : 'rgba(45,106,79,0.08)', border: `1px solid ${msgType === 'error' ? 'rgba(179,58,58,0.25)' : 'rgba(45,106,79,0.25)'}`, borderRadius: 'var(--r-md)', padding: '12px 18px', marginBottom: 24, color: msgType === 'error' ? 'var(--red)' : 'var(--green)', fontSize: '0.88rem' }}>
                    {msg}
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`, marginBottom: -1, fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: tab === t ? 'var(--accent)' : 'var(--text-3)', cursor: 'pointer', transition: 'all 0.2s' }}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Profile tab */}
            {tab === 'Profile' && (
                <div style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                        <div>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.6rem', marginBottom: 4 }}>Profile Information</h2>
                            <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', margin: 0 }}>Update your display name, bio, and profile picture.</p>
                        </div>
                        {!editMode && <button onClick={() => setEditMode(true)} style={S.btnOut}>Edit Profile</button>}
                    </div>

                    {!editMode ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '24px 40px', alignItems: 'start' }}>
                            <div>
                                {picSrc
                                    ? <img src={picSrc} alt="profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                                    : <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: '#fff' }}>{user?.name?.charAt(0).toUpperCase()}</div>
                                }
                            </div>
                            <div style={{ display: 'grid', gap: 16 }}>
                                {[
                                    { label: 'Display Name', value: user?.name },
                                    { label: 'Email',        value: user?.email },
                                    { label: 'Bio',          value: user?.bio || '—' },
                                    { label: 'Role',         value: user?.role },
                                    { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—' },
                                ].map(f => (
                                    <div key={f.label}>
                                        <span style={{ fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-4)', display: 'block', marginBottom: 3 }}>{f.label}</span>
                                        <span style={{ fontSize: '0.97rem', color: 'var(--text)', textTransform: f.label === 'Role' ? 'capitalize' : 'none' }}>{f.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleProfileSave} style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                {picSrc ? <img src={picSrc} alt="preview" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                                        : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#fff' }}>{user?.name?.charAt(0).toUpperCase()}</div>}
                                <div>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-2)' }}>
                                        Upload Photo
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) { setPic(e.target.files[0]); setPicPreview(URL.createObjectURL(e.target.files[0])); } }} />
                                    </label>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: 4 }}>JPG, PNG or GIF. Max 5MB.</p>
                                </div>
                            </div>
                            <div><label style={S.label}>Display Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} style={S.input} required /></div>
                            <div><label style={S.label}>Bio</label><textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ ...S.input, resize: 'vertical' }} placeholder="Write a short bio…" /></div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="submit" style={S.btn}>Save Changes</button>
                                <button type="button" onClick={() => { setEditMode(false); setPicPreview(null); }} style={S.btnOut}>Cancel</button>
                            </div>
                        </form>
                    )}

                    {/* My Posts mini list */}
                    <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.3rem', margin: 0 }}>My Posts</h3>
                            <Link to="/my-posts" style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>View all →</Link>
                        </div>
                        {loading && <p style={{ color: 'var(--text-3)' }}>Loading…</p>}
                        {!loading && posts.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '32px' }}>
                                <p style={{ color: 'var(--text-3)', marginBottom: 16 }}>No posts yet.</p>
                                <Link to="/create-post" style={{ ...S.btn, textDecoration: 'none' }}>Write Your First Post</Link>
                            </div>
                        )}
                        {posts.slice(0, 3).map(post => (
                            <div key={post._id} style={{ display: 'flex', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border-2)', alignItems: 'center' }}>
                                <div style={{ width: 56, height: 56, borderRadius: 'var(--r-md)', background: 'var(--surface-3)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                    {post.image ? <img src={`http://localhost:5000/uploads/${post.image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '✒️'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '0.97rem', color: 'var(--text)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-4)', margin: 0 }}>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <Link to={`/posts/${post._id}`} style={{ ...S.btnOut, fontSize: '0.68rem', padding: '5px 12px', textDecoration: 'none' }}>View</Link>
                                    <button onClick={() => handleDeletePost(post._id)} style={{ ...S.btnDanger, fontSize: '0.68rem', padding: '5px 12px' }}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Password tab */}
            {tab === 'Password' && (
                <div style={S.card}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.6rem', marginBottom: 4 }}>Change Password</h2>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', marginBottom: 32 }}>Choose a strong password to keep your account secure.</p>
                    <form onSubmit={handlePasswordChange} style={{ maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {[
                            { label: 'Current Password',     val: curPw, set: setCurPw, ph: 'Enter current password' },
                            { label: 'New Password',         val: newPw, set: setNewPw, ph: 'Min 6 characters' },
                            { label: 'Confirm New Password', val: cfmPw, set: setCfmPw, ph: 'Repeat new password' },
                        ].map(f => (
                            <div key={f.label}>
                                <label style={S.label}>{f.label}</label>
                                <input type="password" value={f.val} onChange={e => f.set(e.target.value)} style={S.input} placeholder={f.ph} required minLength={f.label === 'Current Password' ? 1 : 6} />
                            </div>
                        ))}
                        {newPw && cfmPw && (
                            <p style={{ fontSize: '0.76rem', fontWeight: 600, color: newPw === cfmPw ? 'var(--green)' : 'var(--red)', marginTop: -12 }}>
                                {newPw === cfmPw ? '✓ Passwords match' : '✗ Do not match'}
                            </p>
                        )}
                        <div><button type="submit" style={S.btn}>Update Password</button></div>
                    </form>
                </div>
            )}

            {/* Settings tab */}
            {tab === 'Settings' && (
                <div style={S.card}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.6rem', marginBottom: 4 }}>Account Settings</h2>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', marginBottom: 32 }}>Manage your account preferences and data.</p>

                    <div style={{ padding: '24px 0', borderBottom: '1px solid var(--border-2)', marginBottom: 32 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Account Summary</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {[
                                { label: 'Member since',   value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—' },
                                { label: 'Account role',   value: user?.role },
                                { label: 'Total posts',    value: posts.length },
                                { label: 'Account status', value: 'Active' },
                            ].map(f => (
                                <div key={f.label} style={{ padding: '14px 18px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-2)' }}>
                                    <span style={{ fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-4)', display: 'block', marginBottom: 4 }}>{f.label}</span>
                                    <span style={{ fontSize: '0.97rem', color: 'var(--text)', textTransform: 'capitalize' }}>{f.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ border: '1px solid rgba(179,58,58,0.2)', borderRadius: 'var(--r-lg)', padding: '28px 32px', background: 'rgba(179,58,58,0.03)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--red)', marginBottom: 8 }}>⚠️ Danger Zone</h3>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-3)', marginBottom: 20 }}>Permanently delete your account, all posts, and comments. This cannot be undone.</p>
                        {!showDelete ? (
                            <button onClick={() => setShowDelete(true)} style={S.btnDanger}>Delete My Account</button>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 380 }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--red)', fontWeight: 600, margin: 0 }}>Enter your password to confirm:</p>
                                <input type="password" value={deletePw} onChange={e => setDeletePw(e.target.value)} placeholder="Your current password" style={{ ...S.input, borderBottomColor: 'var(--red)' }} />
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button onClick={handleDeleteAccount} style={{ ...S.btnDanger, background: 'var(--red)', color: '#fff' }} disabled={!deletePw}>Yes, Delete Permanently</button>
                                    <button onClick={() => { setShowDelete(false); setDeletePw(''); }} style={S.btnOut}>Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
// frontend/src/pages/MyPostsPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const TABS = [
    { key: 'all',       label: 'All',       icon: '📚' },
    { key: 'Poetry',    label: 'Poetry',    icon: '🌸' },
    { key: 'Essay',     label: 'Essays',    icon: '✍️' },
    { key: 'Fiction',   label: 'Stories',   icon: '📖' },
    { key: 'Personal',  label: 'Personal',  icon: '💭' },
    { key: 'Craft',     label: 'Craft',     icon: '🎨' },
    { key: 'Featured',  label: 'Featured',  icon: '⭐' },
    { key: 'Other',     label: 'Other',     icon: '📝' },
];

export default function MyPostsPage() {
    const navigate = useNavigate();
    const [posts, setPosts]         = useState([]);
    const [loading, setLoading]     = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        API.get('/posts/my').then(r => setPosts(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const handleDelete = async id => {
        if (!window.confirm('Delete this post?')) return;
        try { await API.delete(`/posts/${id}`); setPosts(p => p.filter(x => x._id !== id)); }
        catch { alert('Could not delete post.'); }
    };

    const countFor = key => key === 'all' ? posts.length : posts.filter(p => p.category === key).length;
    const filtered = activeTab === 'all' ? posts : posts.filter(p => p.category === activeTab);
    const activeTabInfo = TABS.find(t => t.key === activeTab);

    return (
        <main style={{ maxWidth: 900, margin: '0 auto', padding: '56px 5%' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 40, flexWrap: 'wrap' }}>
                <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: 6 }}>Your creative works</span>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: '2.4rem', margin: '0 0 6px' }}>My Posts</h1>
                    {!loading && <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', margin: 0 }}>{posts.length} published work{posts.length !== 1 ? 's' : ''}</p>}
                </div>
                <Link to="/create-post"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: 'var(--text)', color: 'var(--bg)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s', flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--text)'}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    New Post
                </Link>
            </div>

            {/* Category tabs */}
            {!loading && (
                <div style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', gap: 0, overflowX: 'auto', borderBottom: '1px solid var(--border)', scrollbarWidth: 'none' }}>
                        {TABS.map(tab => {
                            const count = countFor(tab.key);
                            const active = activeTab === tab.key;
                            return (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 18px', background: 'none', border: 'none', borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`, marginBottom: -1, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: active ? 600 : 400, color: active ? 'var(--accent)' : count === 0 ? 'var(--text-4)' : 'var(--text-3)', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                    <span style={{ minWidth: 20, textAlign: 'center', fontSize: '0.66rem', fontWeight: 700, padding: '1px 6px', borderRadius: 'var(--r-full)', background: active ? 'var(--accent)' : count > 0 ? 'var(--surface-3)' : 'transparent', color: active ? '#fff' : count > 0 ? 'var(--text-3)' : 'var(--text-4)', transition: 'all 0.2s' }}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    {posts.length > 0 && (
                        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-4)' }}>Showing</span>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>{activeTabInfo?.icon} {activeTab === 'all' ? 'All Posts' : activeTabInfo?.label}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-4)' }}>— {filtered.length} work{filtered.length !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
            )}

            {loading && <div style={{ textAlign: 'center', padding: '64px 0' }}><p style={{ color: 'var(--text-4)' }}>Loading your posts…</p></div>}

            {!loading && posts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)' }}>
                    <div style={{ fontSize: 52, marginBottom: 16 }}>✒️</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.8rem', marginBottom: 8 }}>Nothing here yet</h3>
                    <p style={{ color: 'var(--text-3)', marginBottom: 28 }}>Share your first poem, story, or thought.</p>
                    <Link to="/create-post" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: 'var(--text)', color: 'var(--bg)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>Write Your First Post</Link>
                </div>
            )}

            {!loading && posts.length > 0 && filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>{activeTabInfo?.icon}</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.4rem', marginBottom: 8 }}>No {activeTabInfo?.label} posts yet</h3>
                    <p style={{ color: 'var(--text-3)', marginBottom: 20, fontSize: '0.88rem' }}>When you write a post and select <strong>{activeTabInfo?.label}</strong> as its category, it will appear here.</p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                        <Link to="/create-post" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: 'var(--text)', color: 'var(--bg)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>Write a {activeTabInfo?.label} Post</Link>
                        <button onClick={() => setActiveTab('all')} style={{ padding: '9px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-2)', fontFamily: 'var(--font-sans)' }}>Show All</button>
                    </div>
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {filtered.map(post => (
                        <div key={post._id}
                            style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = 'var(--sh-md)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>

                            <div onClick={() => navigate(`/posts/${post._id}`)}
                                style={{ width: 110, minHeight: 110, flexShrink: 0, cursor: 'pointer', overflow: 'hidden', background: 'var(--surface-3)' }}>
                                {post.image
                                    ? <img src={`http://localhost:5000/uploads/${post.image}`} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    : <div style={{ width: '100%', height: '100%', minHeight: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg-2), var(--surface-2))', fontSize: 28 }}>{TABS.find(t => t.key === post.category)?.icon || '✒️'}</div>
                                }
                            </div>

                            <div style={{ flex: 1, padding: '16px 20px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '2px 9px', borderRadius: 'var(--r-full)', background: post.status === 'published' ? 'rgba(45,106,79,0.1)' : 'rgba(179,58,58,0.1)', color: post.status === 'published' ? 'var(--green)' : 'var(--red)' }}>{post.status}</span>
                                    {post.category
                                        ? <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 9px', borderRadius: 'var(--r-full)', background: 'var(--accent-light)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{TABS.find(t => t.key === post.category)?.icon} {post.category}</span>
                                        : <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '2px 9px', borderRadius: 'var(--r-full)', background: 'var(--surface-3)', color: 'var(--text-4)' }}>Uncategorized</span>
                                    }
                                </div>
                                <h2 onClick={() => navigate(`/posts/${post._id}`)} style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', margin: 0, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</h2>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.65 }}>{post.body}</p>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>

                            <div style={{ width: 1, background: 'var(--border-2)', flexShrink: 0 }} />

                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, padding: '16px 18px', flexShrink: 0 }}>
                                {[
                                    { label: 'View',   danger: false, action: () => navigate(`/posts/${post._id}`) },
                                    { label: 'Edit',   danger: false, action: () => navigate(`/edit-post/${post._id}`) },
                                    { label: 'Delete', danger: true,  action: () => handleDelete(post._id) },
                                ].map(btn => (
                                    <button key={btn.label} onClick={btn.action}
                                        style={{ padding: '7px 18px', background: btn.danger ? 'rgba(179,58,58,0.06)' : 'transparent', border: `1px solid ${btn.danger ? 'rgba(179,58,58,0.2)' : 'var(--border)'}`, borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: btn.danger ? 600 : 500, color: btn.danger ? 'var(--red)' : 'var(--text-2)', fontFamily: 'var(--font-sans)', transition: 'all 0.18s', whiteSpace: 'nowrap' }}
                                        onMouseEnter={e => { if (btn.danger) { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--red)'; } else { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; } }}
                                        onMouseLeave={e => { if (btn.danger) { e.currentTarget.style.background = 'rgba(179,58,58,0.06)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(179,58,58,0.2)'; } else { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; } }}>
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
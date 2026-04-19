// frontend/src/pages/ReadingListPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

const RL_KEY = 'writeza_reading_list';
const getReadingList  = () => { try { return JSON.parse(localStorage.getItem(RL_KEY)) || []; } catch { return []; } };
const saveReadingList = list => localStorage.setItem(RL_KEY, JSON.stringify(list));

const CATEGORY_ICONS = { Poetry:'🌸', Essay:'✍️', Fiction:'📖', Personal:'💭', Craft:'🎨', Featured:'⭐', Other:'📝' };

export default function ReadingListPage() {
    const navigate = useNavigate();
    const [list, setList]       = useState([]);
    const [posts, setPosts]     = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const rl = getReadingList();
        setList(rl);
        if (rl.length === 0) { setLoading(false); return; }
        Promise.all(rl.map(item => API.get(`/posts/${item.id}`).then(r => r.data).catch(() => null)))
            .then(results => setPosts(results.filter(Boolean)))
            .finally(() => setLoading(false));
    }, []);

    const removeFromList = id => {
        const newList = list.filter(x => x.id !== id);
        saveReadingList(newList); setList(newList);
        setPosts(p => p.filter(x => x._id !== id));
    };

    const clearAll = () => {
        if (!window.confirm('Clear your entire reading list?')) return;
        saveReadingList([]); setList([]); setPosts([]);
    };

    return (
        <main style={{ maxWidth: 860, margin: '0 auto', padding: '56px 5%' }}>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 40, flexWrap: 'wrap' }}>
                <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: 6 }}>🔖 Your saved stories</span>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: '2.4rem', margin: '0 0 6px' }}>Reading List</h1>
                    {!loading && <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', margin: 0 }}>{posts.length} saved work{posts.length !== 1 ? 's' : ''}</p>}
                </div>
                {posts.length > 0 && (
                    <button onClick={clearAll} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'transparent', border: '1px solid rgba(179,58,58,0.25)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 500, color: 'var(--red)', cursor: 'pointer' }}>Clear All</button>
                )}
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '64px 0' }}><p style={{ color: 'var(--text-4)' }}>Loading your reading list…</p></div>}

            {!loading && posts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)' }}>
                    <div style={{ fontSize: 52, marginBottom: 16 }}>🔖</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.8rem', marginBottom: 8 }}>Your reading list is empty</h3>
                    <p style={{ color: 'var(--text-3)', marginBottom: 28, fontSize: '0.92rem' }}>When you find a story you want to read later, tap the 📌 Reading List button on the post.</p>
                    <Link to="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: 'var(--text)', color: 'var(--bg)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>Browse Stories</Link>
                </div>
            )}

            {!loading && posts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {posts.map(post => (
                        <div key={post._id}
                            style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = 'var(--sh-md)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>

                            <div onClick={() => navigate(`/posts/${post._id}`)}
                                style={{ width: 110, minHeight: 110, flexShrink: 0, cursor: 'pointer', overflow: 'hidden', background: 'var(--surface-3)' }}>
                                {post.image
                                    ? <img src={`http://localhost:5000/uploads/${post.image}`} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    : <div style={{ width: '100%', height: '100%', minHeight: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg-2), var(--surface-2))', fontSize: 28 }}>{CATEGORY_ICONS[post.category] || '✍️'}</div>
                                }
                            </div>

                            <div style={{ flex: 1, padding: '16px 20px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {post.category && <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 9px', borderRadius: 'var(--r-full)', background: 'var(--accent-light)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{CATEGORY_ICONS[post.category]} {post.category}</span>}
                                    {post.likes?.length > 0 && <span style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>❤️ {post.likes.length}</span>}
                                    {post.readCount > 0 && <span style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>👁️ {post.readCount.toLocaleString()}</span>}
                                </div>
                                <h2 onClick={() => navigate(`/posts/${post._id}`)} style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', margin: 0, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</h2>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-4)', margin: 0 }}>by {post.author?.name}</p>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>{post.body}</p>
                            </div>

                            <div style={{ width: 1, background: 'var(--border-2)', flexShrink: 0 }} />

                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, padding: '16px 18px', flexShrink: 0 }}>
                                <button onClick={() => navigate(`/posts/${post._id}`)}
                                    style={{ padding: '7px 18px', background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>Read</button>
                                <button onClick={() => removeFromList(post._id)}
                                    style={{ padding: '7px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-3)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', transition: 'all 0.18s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
// frontend/src/pages/HomePage.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PenIcon     = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>;
const ImageIcon   = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const CommentIcon = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>;
const ArrowIcon   = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>;
const UserIcon    = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
const SendIcon    = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const XIcon       = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const GridIcon    = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const ListIcon    = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;

function Avatar({ user: u, size = 40 }) {
    if (!u) return null;
    return u.profilePic
        ? <img src={`http://localhost:5000/uploads/${u.profilePic}`} alt={u.name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }} />
        : <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700, color: '#fff', flexShrink: 0, border: '2px solid var(--border)' }}>
            {u.name?.charAt(0).toUpperCase()}
          </div>;
}

function Composer({ user: u, onPost }) {
    const [expanded, setExpanded] = useState(false);
    const [title, setTitle]       = useState('');
    const [body, setBody]         = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage]       = useState(null);
    const [preview, setPreview]   = useState(null);
    const [loading, setLoading]   = useState(false);
    const fileRef = useRef();

    const reset = () => { setTitle(''); setBody(''); setCategory(''); setImage(null); setPreview(null); setExpanded(false); };

    const handleImage = e => {
        const f = e.target.files[0]; if (!f) return;
        setImage(f); setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!body.trim()) return;
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('title', title || body.slice(0, 60));
            fd.append('body', body);
            fd.append('status', 'published');
            if (category) fd.append('category', category);
            if (image) fd.append('image', image);
            const { data } = await API.post('/posts', fd);
            onPost(data); reset();
        } catch {}
        finally { setLoading(false); }
    };

    return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: expanded ? '24px' : '16px 20px', marginBottom: 24, boxShadow: 'var(--sh-xs)', transition: 'all 0.25s' }}>
            {!expanded ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'text' }} onClick={() => setExpanded(true)}>
                    <Avatar user={u} size={40} />
                    <div style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '10px 18px', color: 'var(--text-4)', fontSize: '0.92rem', userSelect: 'none' }}>
                        Share your writing with the Writeza community…
                    </div>
                    <button onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'var(--font-sans)', flexShrink: 0 }}>
                        <ImageIcon /> Photo
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { handleImage(e); setExpanded(true); }} />
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        <Avatar user={u} size={40} />
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 4px' }}>{u.name}</p>
                            <select value={category} onChange={e => setCategory(e.target.value)}
                                style={{ fontSize: '0.72rem', color: 'var(--text-4)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '3px 10px', cursor: 'pointer', outline: 'none', fontFamily: 'var(--font-sans)' }}>
                                <option value="">Category (optional)</option>
                                {['Poetry','Essay','Fiction','Personal','Craft','Featured'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <button type="button" onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', padding: 4 }}><XIcon /></button>
                    </div>
                    <input type="text" placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)}
                        style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-2)', padding: '6px 0', fontSize: '1rem', fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--text)', outline: 'none', marginBottom: 12 }} />
                    <textarea autoFocus value={body} onChange={e => setBody(e.target.value)}
                        placeholder="Write a poem, story, essay, or anything you'd like to share…" rows={4}
                        style={{ width: '100%', background: 'transparent', border: 'none', resize: 'none', fontSize: '0.95rem', fontFamily: 'var(--font-sans)', color: 'var(--text)', outline: 'none', lineHeight: 1.8 }} />
                    {preview && (
                        <div style={{ position: 'relative', marginTop: 12, borderRadius: 'var(--r-md)', overflow: 'hidden', maxHeight: 260 }}>
                            <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} />
                            <button type="button" onClick={() => { setImage(null); setPreview(null); }}
                                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><XIcon /></button>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-2)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-3)' }}>
                            <ImageIcon /> Add Photo
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
                        </label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" onClick={reset} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-3)', fontFamily: 'var(--font-sans)' }}>Cancel</button>
                            <button type="submit" disabled={loading || !body.trim()}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px', background: body.trim() ? 'var(--text)' : 'var(--surface-3)', color: body.trim() ? 'var(--bg)' : 'var(--text-4)', border: 'none', borderRadius: 'var(--r-sm)', cursor: body.trim() ? 'pointer' : 'default', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-sans)', transition: 'all 0.2s' }}>
                                <SendIcon /> {loading ? 'Posting…' : 'Post'}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}

function FeedCard({ post, onClick }) {
    return (
        <article style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden', transition: 'all 0.25s', cursor: 'pointer' }}
            onClick={onClick}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--sh-lg)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: post.image ? '1px solid var(--border-2)' : 'none' }}>
                <Avatar user={post.author} size={38} />
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{post.author?.name}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-4)', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {post.category && <><span style={{ opacity: 0.4 }}>·</span><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{post.category}</span></>}
                    </p>
                </div>
                {post.category && (
                    <span style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 'var(--r-full)', background: 'var(--accent-light)', color: 'var(--accent)', flexShrink: 0 }}>
                        {post.category}
                    </span>
                )}
            </div>
            {post.image && (
                <div style={{ width: '100%', maxHeight: 320, overflow: 'hidden', background: 'var(--surface-3)' }}>
                    <img src={`http://localhost:5000/uploads/${post.image}`} alt={post.title} style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }} />
                </div>
            )}
            <div style={{ padding: '16px 20px' }}>
                {post.title && <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8, lineHeight: 1.3 }}>{post.title}</h2>}
                <p style={{ fontSize: '0.9rem', color: 'var(--text-3)', lineHeight: 1.75, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.body}</p>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: 5 }}><CommentIcon /> Leave a comment</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>Read more <ArrowIcon /></span>
            </div>
        </article>
    );
}

function GridCard({ post, onClick }) {
    return (
        <div onClick={onClick} style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', cursor: 'pointer', position: 'relative', background: 'var(--surface-3)', aspectRatio: '1', border: '1px solid var(--border)' }}
            onMouseEnter={e => e.currentTarget.querySelector('.grid-overlay').style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.querySelector('.grid-overlay').style.opacity = '0'}>
            {post.image
                ? <img src={`http://localhost:5000/uploads/${post.image}`} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'linear-gradient(135deg, var(--bg-2), var(--surface-2))' }}>
                    <span style={{ fontSize: '1.5rem', marginBottom: 8 }}>✍️</span>
                    <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-2)', textAlign: 'center', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.title || post.body?.slice(0, 80)}
                    </p>
                  </div>
            }
            <div className="grid-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,23,20,0.88) 0%, rgba(26,23,20,0.2) 100%)', opacity: 0, transition: 'opacity 0.3s', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Avatar user={post.author} size={24} />
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{post.author?.name}</span>
                </div>
                {post.title && <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '0.9rem', color: '#fff', margin: 0, lineHeight: 1.3 }}>{post.title}</p>}
            </div>
        </div>
    );
}

const CATEGORIES = ['all','Poetry','Essay','Fiction','Personal','Craft','Featured'];

export default function HomePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView]       = useState('feed');
    const [filter, setFilter]   = useState('all');

    useEffect(() => {
        API.get('/posts').then(r => setPosts(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const handleNewPost = newPost => setPosts(prev => [newPost, ...prev]);
    const filtered = filter === 'all' ? posts : posts.filter(p => p.category === filter);

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100%' }}>

            {/* Guest hero */}
            {!user && (
                <section style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', padding: '64px 5%' }}>
                    <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
                        <span className="eyebrow" style={{ display: 'block', textAlign: 'center' }}>Welcome to</span>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(2.8rem,6vw,5rem)', marginBottom: 20, letterSpacing: '-0.02em' }}>Writeza</h1>
                        <p style={{ color: 'var(--text-2)', fontSize: '1rem', maxWidth: 640, margin: '0 auto 20px', lineHeight: 1.9 }}>
                            Writeza is a creative space where writers bring their ideas to life and share their voices with the world. Designed as a modern portfolio platform, Writeza allows writers of all levels to publish their stories, poems, essays, and creative pieces in one personalized digital home.
                        </p>
                        <p style={{ color: 'var(--text-3)', fontSize: '0.95rem', maxWidth: 620, margin: '0 auto 36px', lineHeight: 1.9 }}>
                            More than just a publishing site, Writeza is a growing community where creativity meets opportunity — a place to showcase talent, build a writing identity, and connect with readers who value authentic storytelling.
                        </p>
                        <div style={{ display: 'flex', gap: 0, justifyContent: 'center', marginBottom: 40, padding: '24px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                            {[{ value: posts.length || '∞', label: 'Stories Published' }, { value: 'Free', label: 'Always & Forever' }, { value: '✍️', label: 'Write Anything' }].map((s, i) => (
                                <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
                                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', display: 'block', lineHeight: 1, marginBottom: 4 }}>{s.value}</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-4)' }}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/register" className="btn btn-primary"><UserIcon /> Start Writing for Free</Link>
                            <Link to="/login" className="btn btn-outline">Log In</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Logged-in welcome bar */}
            {user && (
                <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '14px 5%' }}>
                    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14 }}>
                        {user.profilePic
                            ? <img src={`http://localhost:5000/uploads/${user.profilePic}`} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }} />
                            : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{user.name?.charAt(0).toUpperCase()}</div>
                        }
                        <div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-4)', margin: 0 }}>Welcome back to Writeza</p>
                            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{user.name} ✍️</p>
                        </div>
                        <Link to="/create-post" className="btn btn-primary" style={{ marginLeft: 'auto', textDecoration: 'none' }}>
                            <PenIcon /> New Full Post
                        </Link>
                    </div>
                </div>
            )}

            {/* Feed */}
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 5%' }}>
                {user && <Composer user={user} onPost={handleNewPost} />}

                {/* Filter + view toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setFilter(cat)}
                                style={{ padding: '5px 14px', borderRadius: 'var(--r-full)', border: `1px solid ${filter === cat ? 'var(--accent)' : 'var(--border)'}`, background: filter === cat ? 'var(--accent)' : 'var(--surface)', color: filter === cat ? '#fff' : 'var(--text-3)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.2s', textTransform: 'capitalize' }}>
                                {cat === 'all' ? 'All Works' : cat}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 3 }}>
                        {[{ id: 'feed', icon: <ListIcon /> }, { id: 'grid', icon: <GridIcon /> }].map(v => (
                            <button key={v.id} onClick={() => setView(v.id)}
                                style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', borderRadius: 'var(--r-xs)', border: 'none', background: view === v.id ? 'var(--surface)' : 'transparent', color: view === v.id ? 'var(--accent)' : 'var(--text-4)', cursor: 'pointer', boxShadow: view === v.id ? 'var(--sh-xs)' : 'none', transition: 'all 0.2s' }}>
                                {v.icon}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && <div style={{ textAlign: 'center', padding: '48px 0' }}><p style={{ color: 'var(--text-4)' }}>Loading the community feed…</p></div>}

                {!loading && filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>✍️</div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.6rem', marginBottom: 8, color: 'var(--text)' }}>{filter !== 'all' ? `No ${filter} posts yet` : 'No posts yet'}</h3>
                        <p style={{ color: 'var(--text-3)', marginBottom: 24, fontSize: '0.92rem' }}>{user ? 'Be the first to share something on Writeza!' : 'Join Writeza and be the first to post!'}</p>
                        {user ? <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn btn-primary"><PenIcon /> Write Something</button>
                               : <Link to="/register" className="btn btn-primary"><UserIcon /> Join Writeza</Link>}
                    </div>
                )}

                {!loading && filtered.length > 0 && view === 'feed' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {filtered.map(post => <FeedCard key={post._id} post={post} onClick={() => navigate(`/posts/${post._id}`)} />)}
                    </div>
                )}

                {!loading && filtered.length > 0 && view === 'grid' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        {filtered.map(post => <GridCard key={post._id} post={post} onClick={() => navigate(`/posts/${post._id}`)} />)}
                    </div>
                )}

                {!user && !loading && posts.length > 0 && (
                    <div style={{ marginTop: 32, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '36px', textAlign: 'center' }}>
                        <span className="eyebrow" style={{ display: 'block', textAlign: 'center' }}>Join Writeza</span>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.6rem', marginBottom: 8, color: 'var(--text)' }}>Ready to share your writing?</h3>
                        <p style={{ color: 'var(--text-3)', marginBottom: 24, fontSize: '0.92rem' }}>Register for free to publish your work, build your portfolio, and connect with a community of writers.</p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <Link to="/register" className="btn btn-primary"><UserIcon /> Join Writeza Free</Link>
                            <Link to="/login" className="btn btn-outline">Log In</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
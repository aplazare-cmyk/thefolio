// frontend/src/pages/PostPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

// ── Reading list helpers ────────────────────────────────────
const RL_KEY          = 'writeza_reading_list';
const getReadingList  = () => { try { return JSON.parse(localStorage.getItem(RL_KEY)) || []; } catch { return []; } };
const saveReadingList = list => localStorage.setItem(RL_KEY, JSON.stringify(list));

// ── Category colours ────────────────────────────────────────
const CAT_COLORS = {
    Poetry:   { bg: 'rgba(123,94,58,0.1)',   color: '#7B5E3A' },
    Essay:    { bg: 'rgba(45,106,79,0.1)',    color: '#2D6A4F' },
    Fiction:  { bg: 'rgba(88,75,158,0.1)',    color: '#584B9E' },
    Personal: { bg: 'rgba(196,150,60,0.1)',   color: '#C4963C' },
    Craft:    { bg: 'rgba(179,58,58,0.1)',    color: '#B33A3A' },
    Featured: { bg: 'rgba(196,150,60,0.15)',  color: '#C4963C' },
    Other:    { bg: 'rgba(100,100,100,0.1)',  color: '#666'    },
};
const CATEGORY_ICONS = { Poetry:'🌸', Essay:'✍️', Fiction:'📖', Personal:'💭', Craft:'🎨', Featured:'⭐', Other:'📝' };

export default function PostPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [post, setPost]                     = useState(null);
    const [comments, setComments]             = useState([]);
    const [loading, setLoading]               = useState(true);
    const [commentText, setCommentText]       = useState('');
    const [submitting, setSubmitting]         = useState(false);
    const [deleteConfirm, setDeleteConfirm]   = useState(false);
    const [commentDeleteId, setCommentDeleteId] = useState(null);
    const [error, setError]                   = useState('');

    // Wattpad features
    const [liked, setLiked]               = useState(false);
    const [likeCount, setLikeCount]       = useState(0);
    const [likeLoading, setLikeLoading]   = useState(false);
    const [inReadingList, setInReadingList] = useState(false);
    const [readerMode, setReaderMode]     = useState(false);
    const [fontSize, setFontSize]         = useState(18);
    const [readTime, setReadTime]         = useState(0);
    const [showShareToast, setShowShareToast] = useState(false);
    const [relatedPosts, setRelatedPosts] = useState([]);

    useEffect(() => {
        Promise.all([API.get(`/posts/${id}`), API.get(`/comments/${id}`)])
            .then(([p, c]) => {
                const postData = p.data;
                setPost(postData);
                setComments(c.data);
                setLikeCount(postData.likes?.length || 0);
                const words = postData.body?.split(/\s+/).length || 0;
                setReadTime(Math.max(1, Math.ceil(words / 200)));
                API.put(`/posts/${id}/read`).catch(() => {});
                if (postData.category) {
                    API.get('/posts').then(all => {
                        setRelatedPosts(all.data.filter(x => x._id !== id && x.category === postData.category).slice(0, 3));
                    }).catch(() => {});
                }
            }).catch(() => setError('Post not found.'))
              .finally(() => setLoading(false));

        const rl = getReadingList();
        setInReadingList(rl.some(x => x.id === id));

        if (user) {
            API.get(`/likes/${id}`).then(r => { setLiked(r.data.liked); setLikeCount(r.data.likes); }).catch(() => {});
        }
    }, [id, user]);

    const handleLike = async () => {
        if (!user) { navigate('/login'); return; }
        setLikeLoading(true);
        try {
            const { data } = await API.post(`/likes/${id}`);
            setLiked(data.liked); setLikeCount(data.likes);
        } catch {}
        finally { setLikeLoading(false); }
    };

    const toggleReadingList = () => {
        const rl = getReadingList();
        if (inReadingList) {
            saveReadingList(rl.filter(x => x.id !== id));
            setInReadingList(false);
        } else {
            saveReadingList([...rl, { id, title: post?.title, author: post?.author?.name, category: post?.category, image: post?.image }]);
            setInReadingList(true);
        }
    };

    const handleShare = () => {
        if (navigator.share) { navigator.share({ title: post?.title, url: window.location.href }).catch(() => {}); }
        else { navigator.clipboard.writeText(window.location.href).then(() => { setShowShareToast(true); setTimeout(() => setShowShareToast(false), 2500); }); }
    };

    const handleDeletePost = async () => {
        try { await API.delete(`/posts/${id}`); navigate('/home'); }
        catch { setError('Could not delete post.'); }
    };

    const handleComment = async e => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setSubmitting(true);
        try {
            const { data } = await API.post(`/comments/${id}`, { body: commentText });
            setComments(p => [...p, data]); setCommentText('');
        } catch { setError('Could not post comment.'); }
        finally { setSubmitting(false); }
    };

    const handleDeleteComment = async cid => {
        try { await API.delete(`/comments/${cid}`); setComments(p => p.filter(c => c._id !== cid)); setCommentDeleteId(null); }
        catch { setError('Could not delete comment.'); }
    };

    if (loading) return <main style={{ maxWidth: 760, margin: '0 auto', padding: '80px 5%', textAlign: 'center' }}><p style={{ color: 'var(--text-3)' }}>Loading…</p></main>;
    if (error && !post) return <main style={{ maxWidth: 760, margin: '0 auto', padding: '80px 5%', textAlign: 'center' }}><p style={{ color: 'var(--red)' }}>{error}</p><Link to="/home" style={{ color: 'var(--accent)' }}>← Back</Link></main>;

    const isOwner = user && post?.author?._id === user._id;
    const isAdmin = user?.role === 'admin';
    const canEdit = isOwner || isAdmin;
    const catStyle = CAT_COLORS[post.category] || CAT_COLORS.Other;

    // ── READER MODE ─────────────────────────────────────────
    if (readerMode) return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <div style={{ position: 'sticky', top: 68, zIndex: 100, background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '10px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={() => setReaderMode(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 500 }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                    Exit Reader
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginRight: 6 }}>Font size</span>
                    {[{ label: 'A-', action: () => setFontSize(s => Math.max(14, s - 2)) }, { label: 'A+', action: () => setFontSize(s => Math.min(28, s + 2)) }].map(b => (
                        <button key={b.label} onClick={b.action} style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-2)' }}>{b.label}</button>
                    ))}
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-2)', minWidth: 24, textAlign: 'center' }}>{fontSize}</span>
                </div>
            </div>
            <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 5%' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(1.8rem,4vw,2.8rem)', marginBottom: 20 }}>{post.title}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                    {post.author?.profilePic
                        ? <img src={`http://localhost:5000/uploads/${post.author.profilePic}`} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>{post.author?.name?.charAt(0).toUpperCase()}</div>
                    }
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-2)', fontWeight: 500 }}>{post.author?.name}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-4)' }}>· {readTime} min read</span>
                </div>
                <div style={{ fontSize, lineHeight: 2.1, color: 'var(--text-2)', fontFamily: 'var(--font-serif)' }}>
                    {post.body?.split('\n').map((line, i) => line.trim() ? <p key={i} style={{ marginBottom: '1.2em' }}>{line}</p> : <br key={i} />)}
                </div>
                <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid var(--border)', display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: liked ? 'rgba(179,58,58,0.1)' : 'var(--surface-2)', border: `1px solid ${liked ? 'rgba(179,58,58,0.3)' : 'var(--border)'}`, borderRadius: 'var(--r-full)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: liked ? '#e05050' : 'var(--text-3)', fontFamily: 'var(--font-sans)' }}>
                        {liked ? '❤️' : '🤍'} {likeCount} {likeCount === 1 ? 'Vote' : 'Votes'}
                    </button>
                    <button onClick={() => setReaderMode(false)} style={{ padding: '10px 24px', background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--r-full)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                        💬 View Comments
                    </button>
                </div>
            </div>
        </div>
    );

    // ── NORMAL VIEW ─────────────────────────────────────────
    return (
        <main style={{ maxWidth: 800, margin: '0 auto', padding: '56px 5%' }}>

            {showShareToast && (
                <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: 'var(--text)', color: 'var(--bg)', padding: '10px 20px', borderRadius: 'var(--r-full)', fontSize: '0.82rem', fontWeight: 600, zIndex: 9999, boxShadow: 'var(--sh-lg)', fontFamily: 'var(--font-sans)' }}>
                    🔗 Link copied to clipboard!
                </div>
            )}

            {/* Back */}
            <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500, marginBottom: 32, padding: 0 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                Back
            </button>

            {/* Meta badges */}
            {post.category && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 'var(--r-full)', background: catStyle.bg, color: catStyle.color }}>
                        {CATEGORY_ICONS[post.category]} {post.category}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        {readTime} min read
                    </span>
                    {post.readCount > 0 && <span style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>👁️ {post.readCount.toLocaleString()} reads</span>}
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>❤️ {likeCount} votes</span>
                </div>
            )}

            {/* Title */}
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.15, marginBottom: 24, letterSpacing: '-0.02em' }}>{post.title}</h1>

            {/* Author row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, paddingBottom: 24, borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => navigate(`/user/${post.author?._id}`)}>
                    {post.author?.profilePic
                        ? <img src={`http://localhost:5000/uploads/${post.author.profilePic}`} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                        : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>{post.author?.name?.charAt(0).toUpperCase()}</div>
                    }
                    <div>
                        <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--accent)', margin: 0 }}>{post.author?.name}</p>
                        <p style={{ fontSize: '0.76rem', color: 'var(--text-4)', margin: 0 }}>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </div>
                {canEdit && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/edit-post/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', fontSize: '0.74rem', fontWeight: 500, color: 'var(--text-2)', textDecoration: 'none' }}>Edit</Link>
                        {!deleteConfirm ? (
                            <button onClick={() => setDeleteConfirm(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'transparent', border: '1px solid rgba(179,58,58,0.3)', borderRadius: 'var(--r-sm)', fontSize: '0.74rem', fontWeight: 500, color: 'var(--red)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Delete</button>
                        ) : (
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 12px', background: 'rgba(179,58,58,0.07)', border: '1px solid rgba(179,58,58,0.2)', borderRadius: 'var(--r-sm)' }}>
                                <span style={{ fontSize: '0.74rem', color: 'var(--red)' }}>Confirm?</span>
                                <button onClick={handleDeletePost} style={{ padding: '3px 8px', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 'var(--r-xs)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Yes</button>
                                <button onClick={() => setDeleteConfirm(false)} style={{ padding: '3px 8px', background: 'transparent', color: 'var(--text-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-xs)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>No</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Cover image */}
            {post.image && (
                <div style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', marginBottom: 40, boxShadow: 'var(--sh-lg)' }}>
                    <img src={`http://localhost:5000/uploads/${post.image}`} alt={post.title} style={{ width: '100%', maxHeight: 460, objectFit: 'cover', display: 'block' }} />
                </div>
            )}

            {/* ── WATTPAD TOOLBAR ── */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap', padding: '14px 18px', background: 'var(--surface-2)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                <button onClick={handleLike} disabled={likeLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: liked ? 'rgba(224,80,80,0.1)' : 'var(--surface)', border: `1px solid ${liked ? 'rgba(224,80,80,0.35)' : 'var(--border)'}`, borderRadius: 'var(--r-full)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: liked ? '#e05050' : 'var(--text-3)', fontFamily: 'var(--font-sans)', transition: 'all 0.2s' }}>
                    {liked ? '❤️' : '🤍'} {likeCount} {likeCount === 1 ? 'Vote' : 'Votes'}
                </button>
                <button onClick={toggleReadingList}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: inReadingList ? 'rgba(45,106,79,0.1)' : 'var(--surface)', border: `1px solid ${inReadingList ? 'rgba(45,106,79,0.35)' : 'var(--border)'}`, borderRadius: 'var(--r-full)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: inReadingList ? 'var(--green)' : 'var(--text-3)', fontFamily: 'var(--font-sans)', transition: 'all 0.2s' }}>
                    {inReadingList ? '🔖' : '📌'} {inReadingList ? 'Saved' : 'Reading List'}
                </button>
                <button onClick={() => setReaderMode(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-3)', fontFamily: 'var(--font-sans)' }}>
                    📖 Reader Mode
                </button>
                <button onClick={handleShare}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-3)', fontFamily: 'var(--font-sans)' }}>
                    🔗 Share
                </button>
                {post.readCount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-4)' }}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        {post.readCount.toLocaleString()} reads
                    </div>
                )}
            </div>

            {/* Body */}
            <div style={{ fontSize: '1.08rem', lineHeight: 2.0, color: 'var(--text-2)', fontFamily: 'var(--font-serif)', fontWeight: 400 }}>
                {post.body?.split('\n').map((line, i) => line.trim() ? <p key={i} style={{ marginBottom: 20 }}>{line}</p> : <br key={i} />)}
            </div>

            {/* End-of-story CTA */}
            <div style={{ margin: '48px 0', padding: '28px', background: 'var(--surface-2)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-3)', marginBottom: 18 }}>{liked ? '✨ Thanks for voting on this story!' : '💫 Did you enjoy this story? Show your support!'}</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={handleLike} disabled={likeLoading}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: liked ? '#e05050' : 'var(--text)', color: '#fff', border: 'none', borderRadius: 'var(--r-full)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, fontFamily: 'var(--font-sans)', transition: 'all 0.2s' }}>
                        {liked ? '❤️ Voted!' : '🤍 Vote for this story'}
                    </button>
                    <button onClick={toggleReadingList}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                        {inReadingList ? '🔖 Saved to Reading List' : '📌 Add to Reading List'}
                    </button>
                </div>
            </div>

            {/* Comments */}
            <section style={{ marginTop: 16, paddingTop: 48, borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.6rem', margin: 0 }}>Comments</h2>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--r-full)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>{comments.length}</span>
                </div>

                {user ? (
                    <form onSubmit={handleComment} style={{ marginBottom: 36 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: 4 }}>{user.name?.charAt(0).toUpperCase()}</div>
                            <div style={{ flex: 1 }}>
                                <textarea value={commentText} onChange={e => setCommentText(e.target.value)} rows={3} placeholder="Leave a comment…"
                                    style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 16px', fontSize: '0.92rem', fontFamily: 'var(--font-sans)', color: 'var(--text)', outline: 'none', resize: 'vertical', transition: 'border-color 0.2s' }}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                                    <button type="submit" disabled={submitting || !commentText.trim()}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--r-sm)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)', opacity: (!commentText.trim() || submitting) ? 0.5 : 1 }}>
                                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                                        {submitting ? 'Posting…' : 'Post Comment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px', textAlign: 'center', marginBottom: 36 }}>
                        <p style={{ color: 'var(--text-2)', marginBottom: 14, fontSize: '0.95rem' }}>Log in to leave a comment.</p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 18px', background: 'var(--text)', color: 'var(--bg)', borderRadius: 'var(--r-sm)', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
                            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 18px', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', fontSize: '0.78rem', fontWeight: 500, textDecoration: 'none' }}>Register Free</Link>
                        </div>
                    </div>
                )}

                {comments.length === 0
                    ? <p style={{ color: 'var(--text-4)', textAlign: 'center', padding: '24px 0' }}>No comments yet. Be the first!</p>
                    : <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {comments.map(c => {
                            const canDelete = (user && c.author?._id === user._id) || isAdmin;
                            return (
                                <div key={c._id} style={{ display: 'flex', gap: 12 }}>
                                    {c.author?.profilePic
                                        ? <img src={`http://localhost:5000/uploads/${c.author.profilePic}`} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginTop: 2 }} />
                                        : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-2)', flexShrink: 0, marginTop: 2, border: '1px solid var(--border)' }}>{c.author?.name?.charAt(0).toUpperCase()}</div>
                                    }
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                            <div>
                                                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>{c.author?.name}</span>
                                                <span style={{ fontSize: '0.74rem', color: 'var(--text-4)', marginLeft: 8 }}>{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            {canDelete && (
                                                commentDeleteId !== c._id
                                                    ? <button onClick={() => setCommentDeleteId(c._id)} style={{ background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'var(--font-sans)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-4)'}>Delete</button>
                                                    : <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.72rem', color: 'var(--red)' }}>Delete?</span>
                                                        <button onClick={() => handleDeleteComment(c._id)} style={{ padding: '2px 8px', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 'var(--r-xs)', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Yes</button>
                                                        <button onClick={() => setCommentDeleteId(null)} style={{ padding: '2px 8px', background: 'transparent', color: 'var(--text-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-xs)', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>No</button>
                                                      </div>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.7, margin: 0 }}>{c.body}</p>
                                    </div>
                                </div>
                            );
                        })}
                      </div>
                }
            </section>

            {/* Related posts */}
            {relatedPosts.length > 0 && (
                <section style={{ marginTop: 56, paddingTop: 40, borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)' }}>More like this</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-4)' }}>— {post.category}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {relatedPosts.map(rp => (
                            <div key={rp._id} onClick={() => navigate(`/posts/${rp._id}`)}
                                style={{ display: 'flex', gap: 16, padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                                {rp.image
                                    ? <img src={`http://localhost:5000/uploads/${rp.image}`} alt={rp.title} style={{ width: 64, height: 64, borderRadius: 'var(--r-md)', objectFit: 'cover', flexShrink: 0 }} />
                                    : <div style={{ width: 64, height: 64, borderRadius: 'var(--r-md)', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{CATEGORY_ICONS[rp.category] || '✍️'}</div>
                                }
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--text)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rp.title}</h4>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-4)', margin: '0 0 4px' }}>by {rp.author?.name}</p>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rp.body}</p>
                                </div>
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ color: 'var(--text-4)', flexShrink: 0, alignSelf: 'center' }}><path strokeLinecap="round" d="M9 18l6-6-6-6"/></svg>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
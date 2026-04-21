// frontend/src/pages/UserProfilePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { getImageUrl } from '../utils/imageHelper';

const CATEGORY_ICONS = { Poetry:'🌸', Essay:'✍️', Fiction:'📖', Personal:'💭', Craft:'🎨', Featured:'⭐', Other:'📝' };

export default function UserProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: me } = useAuth();

    const [profile, setProfile]               = useState(null);
    const [posts, setPosts]                   = useState([]);
    const [loading, setLoading]               = useState(true);
    const [following, setFollowing]           = useState(false);
    const [followerCount, setFollowerCount]   = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [followLoading, setFollowLoading]   = useState(false);
    const [activeTab, setActiveTab]           = useState('posts');
    const [error, setError]                   = useState('');

    const isMyProfile = me && me._id === id;

    useEffect(() => {
        if (isMyProfile) { navigate('/profile'); return; }
        setLoading(true);
        Promise.all([API.get(`/auth/user/${id}`), API.get('/posts')])
            .then(([u, p]) => {
                setProfile(u.data);
                setFollowerCount((u.data.followers || []).length);
                setFollowingCount((u.data.following || []).length);
                setPosts(p.data.filter(post => post.author?._id === id));
            }).catch(() => setError('User not found.')).finally(() => setLoading(false));

        if (me) { API.get(`/follow/${id}`).then(r => { setFollowing(r.data.following); setFollowerCount(r.data.followerCount); setFollowingCount(r.data.followingCount); }).catch(() => {}); }
        else    { API.get(`/follow/${id}/stats`).then(r => { setFollowerCount(r.data.followerCount); setFollowingCount(r.data.followingCount); }).catch(() => {}); }
    }, [isMyProfile, navigate, id, me]);

    const handleFollow = async () => {
        if (!me) { navigate('/login'); return; }
        setFollowLoading(true);
        try { const { data } = await API.post(`/follow/${id}`); setFollowing(data.following); setFollowerCount(data.followerCount); }
        catch {} finally { setFollowLoading(false); }
    };

    if (loading) return <main style={{ maxWidth: 860, margin: '0 auto', padding: '80px 5%', textAlign: 'center' }}><p style={{ color: 'var(--text-4)' }}>Loading profile…</p></main>;
    if (error || !profile) return (
        <main style={{ maxWidth: 860, margin: '0 auto', padding: '80px 5%', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: 8 }}>Writer not found</h2>
            <p style={{ color: 'var(--text-3)', marginBottom: 24 }}>This profile doesn't exist or has been removed.</p>
            <button onClick={() => navigate(-1)} style={{ padding: '10px 22px', background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Go Back</button>
        </main>
    );

    const publishedPosts = posts.filter(p => p.status === 'published');
    const totalVotes     = publishedPosts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
    const totalReads     = publishedPosts.reduce((sum, p) => sum + (p.readCount || 0), 0);
    const profilePicSrc  = getImageUrl(profile.profilePic);

    return (
        <main style={{ background: 'var(--bg)', minHeight: '100%' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--bg-2) 0%, var(--bg-3) 100%)', borderBottom: '1px solid var(--border)', padding: '48px 5%' }}>
                <div style={{ maxWidth: 860, margin: '0 auto' }}>
                    <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500, marginBottom: 32, padding: 0 }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>Back
                    </button>
                    <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            {profilePicSrc
                                ? <img src={profilePicSrc} alt={profile.name} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--surface)', boxShadow: 'var(--sh-md)' }} />
                                : <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 700, color: '#fff', border: '3px solid var(--surface)', boxShadow: 'var(--sh-md)' }}>{profile.name?.charAt(0).toUpperCase()}</div>
                            }
                            <div style={{ position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: '50%', background: 'var(--green)', border: '2px solid var(--surface)' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                                <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(1.6rem,4vw,2.4rem)', margin: 0 }}>{profile.name}</h1>
                                <span style={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 'var(--r-full)', background: profile.role === 'admin' ? 'var(--accent-light)' : 'var(--surface-3)', color: profile.role === 'admin' ? 'var(--accent)' : 'var(--text-4)', border: '1px solid var(--border)' }}>
                                    {profile.role === 'admin' ? '⭐ Admin' : '✍️ Writer'}
                                </span>
                            </div>
                            {profile.bio && <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 16, maxWidth: 500 }}>{profile.bio}</p>}
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-4)', marginBottom: 20 }}>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <button onClick={handleFollow} disabled={followLoading}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: following ? 'transparent' : 'var(--accent)', color: following ? 'var(--text-2)' : '#fff', border: `1px solid ${following ? 'var(--border)' : 'var(--accent)'}`, borderRadius: 'var(--r-full)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-sans)', transition: 'all 0.2s', minWidth: 130 }}>
                                    {followLoading ? '…' : following ? '✓ Following' : '+ Follow'}
                                </button>
                                {!me && <p style={{ fontSize: '0.78rem', color: 'var(--text-4)', alignSelf: 'center' }}><Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Log in</Link> to follow</p>}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 0, marginTop: 36, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
                        {[
                            { value: publishedPosts.length, label: 'Stories',    icon: '📖' },
                            { value: followerCount,         label: 'Followers',  icon: '👥' },
                            { value: followingCount,        label: 'Following',  icon: '✨' },
                            { value: totalReads > 999 ? `${(totalReads/1000).toFixed(1)}K` : totalReads, label: 'Total Reads', icon: '👁️' },
                            { value: totalVotes,            label: 'Total Votes', icon: '❤️' },
                        ].map((s, i) => (
                            <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '0 12px', borderRight: i < 4 ? '1px solid var(--border)' : 'none' }}>
                                <span style={{ fontSize: '0.9rem', display: 'block', marginBottom: 2 }}>{s.icon}</span>
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', display: 'block', lineHeight: 1 }}>{s.value}</span>
                                <span style={{ fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-4)' }}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 5%', display: 'flex' }}>
                    {[{ key: 'posts', label: `Stories (${publishedPosts.length})` }, { key: 'followers', label: `Followers (${followerCount})` }, { key: 'following', label: `Following (${followingCount})` }].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            style={{ padding: '14px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab.key ? 'var(--accent)' : 'transparent'}`, marginBottom: -1, fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: activeTab === tab.key ? 600 : 400, color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-3)', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 5%' }}>
                {activeTab === 'posts' && (
                    publishedPosts.length === 0
                        ? <div style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)' }}><div style={{ fontSize: 48, marginBottom: 12 }}>✍️</div><h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.5rem', marginBottom: 8 }}>No stories yet</h3><p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>{profile.name} hasn't published any stories yet.</p></div>
                        : <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {publishedPosts.map(post => {
                                const postImg = getImageUrl(post.image);
                                return (
                                    <div key={post._id} onClick={() => navigate(`/posts/${post._id}`)}
                                        style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = 'var(--sh-md)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                                        <div style={{ width: 100, minHeight: 100, flexShrink: 0, overflow: 'hidden', background: 'var(--surface-3)' }}>
                                            {postImg ? <img src={postImg} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                                     : <div style={{ width: '100%', height: '100%', minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg-2), var(--surface-2))', fontSize: 26 }}>{CATEGORY_ICONS[post.category] || '✍️'}</div>}
                                        </div>
                                        <div style={{ flex: 1, padding: '16px 20px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {post.category && <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 9px', borderRadius: 'var(--r-full)', background: 'var(--accent-light)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{CATEGORY_ICONS[post.category]} {post.category}</span>}
                                                {post.likes?.length > 0 && <span style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>❤️ {post.likes.length}</span>}
                                                {post.readCount > 0 && <span style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>👁️ {post.readCount.toLocaleString()}</span>}
                                            </div>
                                            <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</h3>
                                            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>{post.body}</p>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', color: 'var(--text-4)', flexShrink: 0 }}>
                                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 18l6-6-6-6"/></svg>
                                        </div>
                                    </div>
                                );
                            })}
                          </div>
                )}

                {['followers','following'].map(tabKey => activeTab === tabKey && (
                    <div key={tabKey}>
                        {(profile[tabKey] || []).length === 0
                            ? <div style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)' }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>{tabKey === 'followers' ? '👥' : '✨'}</div>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.5rem', marginBottom: 8 }}>{tabKey === 'followers' ? 'No followers yet' : 'Not following anyone yet'}</h3>
                                <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>{tabKey === 'followers' ? `Be the first to follow ${profile.name}!` : `${profile.name} hasn't followed any writers yet.`}</p>
                              </div>
                            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                                {(profile[tabKey] || []).map(u => {
                                    const uPicSrc = getImageUrl(u.profilePic);
                                    return (
                                        <div key={u._id} onClick={() => navigate(`/user/${u._id}`)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', cursor: 'pointer', transition: 'all 0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--sh-md)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                            {uPicSrc
                                                ? <img src={uPicSrc} alt={u.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                                : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{u.name?.charAt(0).toUpperCase()}</div>
                                            }
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
                                                <p style={{ fontSize: '0.72rem', color: 'var(--text-4)', margin: 0 }}>✍️ Writer</p>
                                            </div>
                                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ color: 'var(--text-4)', flexShrink: 0 }}><path strokeLinecap="round" d="M9 18l6-6-6-6"/></svg>
                                        </div>
                                    );
                                })}
                              </div>
                        }
                    </div>
                ))}
            </div>
        </main>
    );
}
// frontend/src/pages/EditPostPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function EditPostPage() {
    const { id }   = useParams();
    const navigate = useNavigate();

    const [title, setTitle]         = useState('');
    const [body, setBody]           = useState('');
    const [category, setCategory]   = useState('');
    const [status, setStatus]       = useState('published');
    const [existingImage, setExistingImage] = useState('');
    const [newImage, setNewImage]   = useState(null);
    const [newPreview, setNewPreview] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [error, setError]         = useState('');

    useEffect(() => {
        API.get(`/posts/${id}`)
            .then(({ data }) => {
                setTitle(data.title || '');
                setBody(data.body || '');
                setCategory(data.category || '');
                setStatus(data.status || 'published');
                setExistingImage(data.image || '');
            })
            .catch(() => setError('Could not load post.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleNewImage = e => {
        const file = e.target.files[0]; if (!file) return;
        setNewImage(file);
        setNewPreview(URL.createObjectURL(file));
        setRemoveImage(false);
    };

    const handleRemoveImage = () => {
        setNewImage(null); setNewPreview(null);
        setRemoveImage(true);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!title.trim() || !body.trim()) { setError('Title and content are required.'); return; }
        setSaving(true); setError('');
        try {
            const fd = new FormData();
            fd.append('title', title);
            fd.append('body', body);
            fd.append('category', category);
            fd.append('status', status);
            if (newImage) fd.append('image', newImage);
            else if (removeImage) fd.append('image', '');
            await API.put(`/posts/${id}`, fd);
            navigate(`/posts/${id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save changes.');
            setSaving(false);
        }
    };

    const inputStyle = { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', padding: '10px 0', fontSize: '0.97rem', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-sans)', transition: 'border-color 0.2s' };
    const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 };

    // Determine what image to show
    const showExisting = existingImage && !removeImage && !newPreview;
    const showNew      = !!newPreview;
    const showNone     = removeImage || (!existingImage && !newPreview);

    if (loading) return <main style={{ maxWidth: 760, margin: '0 auto', padding: '80px 5%', textAlign: 'center' }}><p style={{ color: 'var(--text-3)' }}>Loading…</p></main>;

    return (
        <main style={{ maxWidth: 760, margin: '0 auto', padding: '56px 5%' }}>

            <div style={{ marginBottom: 48 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: 8 }}>Editing Post</span>
                <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: '2.4rem', margin: 0 }}>Edit Post</h1>
            </div>

            {error && (
                <div style={{ background: 'rgba(179,58,58,0.07)', border: '1px solid rgba(179,58,58,0.2)', borderRadius: 'var(--r-md)', padding: '12px 18px', marginBottom: 28, color: 'var(--red)', fontSize: '0.88rem' }}>{error}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                <div>
                    <label style={labelStyle}>Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                        style={{ ...inputStyle, fontSize: '1.3rem', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
                        onFocus={e => e.target.style.borderBottomColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
                        required />
                </div>

                <div>
                    <label style={labelStyle}>Content</label>
                    <textarea value={body} onChange={e => setBody(e.target.value)} rows={14}
                        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.9, fontSize: '1rem' }}
                        onFocus={e => e.target.style.borderBottomColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
                        required />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>{body.split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                        <label style={labelStyle}>Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                            <option value="">— Select category —</option>
                            {['Poetry','Essay','Fiction','Personal','Craft','Featured','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                </div>

                {/* Cover image */}
                <div>
                    <label style={labelStyle}>Cover Image</label>

                    {/* Existing image */}
                    {showExisting && (
                        <div style={{ position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 12 }}>
                            <img src={`http://localhost:5000/uploads/${existingImage}`} alt="current cover" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} />
                            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
                                <label style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: 'var(--r-full)', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                                    Change
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleNewImage} />
                                </label>
                                <button type="button" onClick={handleRemoveImage} style={{ background: 'rgba(179,58,58,0.8)', color: '#fff', border: 'none', borderRadius: 'var(--r-full)', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Remove</button>
                            </div>
                        </div>
                    )}

                    {/* New image preview */}
                    {showNew && (
                        <div style={{ position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--accent)', marginBottom: 12 }}>
                            <img src={newPreview} alt="new cover" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} />
                            <div style={{ position: 'absolute', top: 8, left: 12 }}>
                                <span style={{ background: 'var(--green)', color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--r-full)' }}>New image</span>
                            </div>
                            <button type="button" onClick={() => { setNewImage(null); setNewPreview(null); }}
                                style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: 'var(--r-full)', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                                ✕ Cancel
                            </button>
                        </div>
                    )}

                    {/* No image / upload prompt */}
                    {(showNone || (!showExisting && !showNew)) && (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '32px 24px', border: '2px dashed var(--border)', borderRadius: 'var(--r-lg)', cursor: 'pointer', background: 'var(--surface-2)', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface-2)'; }}>
                            <span style={{ fontSize: '2rem' }}>🖼️</span>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: 600, color: 'var(--text-2)', margin: '0 0 4px', fontSize: '0.92rem' }}>{removeImage ? 'Image removed — upload a new one?' : 'Click to upload a cover image'}</p>
                                <p style={{ color: 'var(--text-4)', margin: 0, fontSize: '0.78rem' }}>JPG, PNG or GIF · Max 5MB</p>
                            </div>
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleNewImage} />
                        </label>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <button type="submit" disabled={saving}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--r-sm)', cursor: saving ? 'default' : 'pointer', fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--font-sans)', transition: 'all 0.2s', opacity: saving ? 0.7 : 1 }}
                        onMouseEnter={e => { if (!saving) e.currentTarget.style.background = 'var(--accent)'; }}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--text)'}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => navigate(`/posts/${id}`)}
                        style={{ padding: '12px 24px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-2)', fontFamily: 'var(--font-sans)' }}>
                        Cancel
                    </button>
                </div>
            </form>
        </main>
    );
}
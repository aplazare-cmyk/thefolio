// frontend/src/pages/CreatePostPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function CreatePostPage() {
    const navigate = useNavigate();
    const [title, setTitle]         = useState('');
    const [body, setBody]           = useState('');
    const [category, setCategory]   = useState('');
    const [status, setStatus]       = useState('published');
    const [image, setImage]         = useState(null);
    const [preview, setPreview]     = useState(null);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState('');

    const handleImage = e => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }
        
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const removeImage = () => { 
        setImage(null); 
        if (preview) {
            URL.revokeObjectURL(preview);
        }
        setPreview(null); 
    };

    // frontend/src/pages/CreatePostPage.js - Updated handleSubmit
const handleSubmit = async e => {
    e.preventDefault();
    
    if (!title.trim() || !body.trim()) { 
        setError('Title and content are required.'); 
        return; 
    }
    
    setLoading(true); 
    setError('');
    
    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('body', body);
        formData.append('category', category);
        formData.append('status', status);
        
        if (image) {
            formData.append('image', image);
            console.log('📷 Image to upload:', {
                name: image.name,
                type: image.type,
                size: image.size + ' bytes'
            });
        }
        
        console.log('📤 Sending request to:', API.defaults.baseURL + '/posts');
        
        const { data } = await API.post('/posts', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        console.log('✅ Post created:', data);
        navigate(`/post/${data._id}`);
    } catch (err) {
        console.error('❌ Error details:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
            statusText: err.response?.statusText
        });
        
        let errorMessage = 'Could not create post. ';
        if (err.response?.data?.message) {
            errorMessage += err.response.data.message;
        } else if (err.message) {
            errorMessage += err.message;
        }
        setError(errorMessage);
        setLoading(false);
    }
};

    const inputStyle = { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', padding: '10px 0', fontSize: '0.97rem', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-sans)', transition: 'border-color 0.2s' };
    const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 };

    return (
        <main style={{ maxWidth: 760, margin: '0 auto', padding: '56px 5%' }}>

            {/* Header */}
            <div style={{ marginBottom: 48 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: 8 }}>New Post</span>
                <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: '2.4rem', margin: 0 }}>Write Something</h1>
            </div>

            {error && (
                <div style={{ background: 'rgba(179,58,58,0.07)', border: '1px solid rgba(179,58,58,0.2)', borderRadius: 'var(--r-md)', padding: '12px 18px', marginBottom: 28, color: 'var(--red)', fontSize: '0.88rem' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                {/* Title */}
                <div>
                    <label style={labelStyle}>Title</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        placeholder="Give your post a title…"
                        style={{ ...inputStyle, fontSize: '1.3rem', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
                        onFocus={e => e.target.style.borderBottomColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
                        required 
                    />
                </div>

                {/* Body */}
                <div>
                    <label style={labelStyle}>Content</label>
                    <textarea 
                        value={body} 
                        onChange={e => setBody(e.target.value)}
                        placeholder="Write your poem, story, essay… let it flow."
                        rows={14}
                        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.9, fontSize: '1rem' }}
                        onFocus={e => e.target.style.borderBottomColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
                        required 
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>{body.split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                </div>

                {/* Category + Status row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                        <label style={labelStyle}>Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)}
                            style={{ ...inputStyle, cursor: 'pointer' }}>
                            <option value="">— Select category —</option>
                            {['Poetry','Essay','Fiction','Personal','Craft','Featured','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)}
                            style={{ ...inputStyle, cursor: 'pointer' }}>
                            <option value="published">Published — visible to everyone</option>
                            <option value="draft">Draft — only visible to you</option>
                        </select>
                    </div>
                </div>

                {/* Cover image */}
                <div>
                    <label style={labelStyle}>Cover Image (optional)</label>
                    {!preview ? (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '36px 24px', border: '2px dashed var(--border)', borderRadius: 'var(--r-lg)', cursor: 'pointer', transition: 'all 0.2s', background: 'var(--surface-2)' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface-2)'; }}>
                            <span style={{ fontSize: '2rem' }}>🖼️</span>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: 600, color: 'var(--text-2)', margin: '0 0 4px', fontSize: '0.92rem' }}>Click to upload a cover image</p>
                                <p style={{ color: 'var(--text-4)', margin: 0, fontSize: '0.78rem' }}>JPG, PNG or GIF · Max 5MB</p>
                            </div>
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
                        </label>
                    ) : (
                        <div style={{ position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }} />
                            <button type="button" onClick={removeImage}
                                style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: 'var(--r-full)', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                                ✕ Remove
                            </button>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <button type="submit" disabled={loading}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--r-sm)', cursor: loading ? 'default' : 'pointer', fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--font-sans)', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--accent)'; }}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--text)'}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                        {loading ? 'Publishing…' : status === 'published' ? 'Publish Post' : 'Save Draft'}
                    </button>
                    <button type="button" onClick={() => navigate(-1)}
                        style={{ padding: '12px 24px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-2)', fontFamily: 'var(--font-sans)' }}>
                        Cancel
                    </button>
                </div>
            </form>
        </main>
    );
}
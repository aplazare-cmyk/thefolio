// src/components/PostCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Reusable card for displaying a single post preview.
 * Props:
 *   post   — { _id, title, body, author, createdAt, category }
 *   onDelete — optional callback (shown only to post owner / admin)
 */
export default function PostCard({ post, onDelete }) {
    const { user } = useAuth();

    const canEdit = user && (user._id === post.author?._id || user.role === 'admin');

    // Show a short excerpt (first 150 chars of body)
    const excerpt = post.body?.length > 150
        ? post.body.slice(0, 150) + '…'
        : post.body;

    return (
        <article className="portfolio-card" style={{ display: 'flex', flexDirection: 'column' }}>
            {post.image && (
                <div className="card-image">
                    <img src={post.image} alt={post.title} />
                </div>
            )}

            <div className="card-content" style={{ flex: 1 }}>
                {post.category && (
                    <span className="card-category">{post.category}</span>
                )}

                <h2>{post.title}</h2>

                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    By {post.author?.name || 'Unknown'} &bull;{' '}
                    {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString()
                        : ''}
                </p>

                <p>{excerpt}</p>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: 'auto' }}>
                    <Link to={`/post/${post._id}`} className="read-more">
                        Read More →
                    </Link>

                    {canEdit && (
                        <>
                            <Link
                                to={`/edit-post/${post._id}`}
                                style={{ fontSize: '13px', color: 'var(--accent)' }}
                            >
                                Edit
                            </Link>
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(post._id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#e05050',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                >
                                    Delete
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </article>
    );
}
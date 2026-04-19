// frontend/src/pages/SplashPage.js
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useNavigate } from 'react-router-dom';

export default function SplashPage() {
    const [progress, setProgress] = useState(0);
    const [ready, setReady]       = useState(false);
    const [exiting, setExiting]   = useState(false);
    const navigate = useNavigate();

    // Changed: Wrapped goHome in useCallback to satisfy dependency rules
    const goHome = useCallback(() => {
        setExiting(true);
        setTimeout(() => navigate('/home'), 500);
    }, [navigate]);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) { clearInterval(interval); setReady(true); return 100; }
                return prev + 2;
            });
        }, 80);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => goHome(), 5500);
        return () => clearTimeout(timer);
    }, [goHome]); // Added goHome as dependency

    useEffect(() => {
        const handleKey = e => {
            if (['Enter', 'Escape', ' '].includes(e.key)) { e.preventDefault(); goHome(); }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [goHome]); // Added goHome as dependency

    return (
        <div className="splash-body">
            <div className="splash-gradient" />
            <div className="particles">
                {[1,2,3,4,5,6].map(i => <div key={i} className={`particle particle-${i}`} />)}
            </div>
            <div className="deco-pen">✒️</div>
            <div className="deco-book">📖</div>
            <div className="deco-scroll">📜</div>

            <div className={`splash-card ${exiting ? 'exit' : ''}`}>
                <div className="feather-container">
                    <span className="feather-icon">✍️</span>
                </div>

                <h1 className="splash-title">
                    {'Writeza'.split('').map((letter, i) => (
                        <span key={i} className="title-letter">{letter}</span>
                    ))}
                </h1>

                <p className="splash-tagline">
                    <span className="tagline-word">Write</span>
                    <span className="bullet">·</span>
                    <span className="tagline-word">Share</span>
                    <span className="bullet">·</span>
                    <span className="tagline-word">Inspire</span>
                </p>

                <blockquote className="splash-quote">
                    <span className="quote-text">
                        A creative space where writers bring their ideas to life
                    </span>
                </blockquote>

                <div className="splash-progress-wrap">
                    <span className="splash-progress-label">Loading Writeza</span>
                    <div className="splash-progress-container">
                        <div className="splash-progress-bar">
                            <div className="splash-progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="progress-percentage">{progress}%</div>
                    </div>
                </div>

                <button className={`splash-enter ${ready ? 'ready' : ''}`} onClick={goHome}>
                    <span className="btn-text">{ready ? 'Enter Writeza' : 'Loading…'}</span>
                    <span className="btn-arrow">→</span>
                </button>

                <p className="splash-copyright">© 2026 Writeza — A creative writing community</p>
            </div>
        </div>
    );
}
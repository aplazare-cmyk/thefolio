// frontend/src/pages/AboutPage.js
import React, { useState, useEffect, useCallback } from 'react';

const ARTICLES = [
    {
        id: 'timeless-change',
        category: 'POETRY · WORDS',
        title: 'Timeless Change',
        image: '/assets/poetry.jpg',
        alt: 'Deep dive into poetry',
        excerpt: 'A reflection on the doorways we cross and the thresholds that change us. Exploring how the spaces we enter shape our identity.',
        content: `There is a particular kind of magic that lives in doorways.

Not the grand, gilded arches of palaces — but the ordinary ones. The ones we pass through every single day without a second thought. The door to your childhood home. The entrance to your first classroom.

Doorways are not just architectural features. They are the universe's way of asking us: Are you ready?

**The Courage of Crossing**

I have been thinking about the doorways I have crossed in my life. The ones I walked through trembling, certain I was making a mistake. The ones I rushed through, too afraid to linger.

Poetry, I have come to believe, is what happens when we finally step through. When we commit the unspeakable to language — when we take the quivering mass of feeling inside us and shape it into syllables and line breaks — we are crossing a threshold.

**What Change Asks of Us**

Change asks us to be fluid when everything in us wants to be solid. It asks us to hold our identity loosely, like water in cupped palms, knowing some of it will inevitably spill.

The poet's task is to catch what spills. To write it down before it evaporates. To honor the version of ourselves that existed before the crossing.

*The door was always open. I just needed to learn how to walk through.*`,
    },
    {
        id: 'motivation-writing',
        category: 'ESSAY · INSPIRATION',
        title: 'Struggling with Finding Motivation on Writing',
        image: '/assets/peace.jpg',
        alt: 'Finding peace in writing',
        excerpt: 'Discover ancient wisdom applied to modern creative practices. Timeless principles of storytelling that transform your approach to writing.',
        content: `There are days when the blank page is not an invitation — it is an accusation.

It stares at you. It knows you haven't written in three weeks. The blank page has infinite patience. It will wait.

**Why Motivation is a Myth**

Here is the uncomfortable truth: motivation is not a prerequisite for writing. It is a reward for having written.

The ancient Stoics had a concept called amor fati — love of fate. Applied to writing: you sit down with whatever energy you have. Not the energy you wish you had. What you actually have, right now.

You write anyway.

**The Ritual Before the Ritual**

Ancient writers understood something we've largely forgotten: creativity is not spontaneous. It is cultivated. It has conditions.

Your ritual doesn't need to be elaborate. It can be as simple as a particular cup of tea. The brain is a pattern-recognition machine. Give it a pattern.

**What to Do When You Truly Cannot Write**

Sometimes the block is not laziness. Sometimes it is grief, or exhaustion. In those moments, feed the writer instead. Read voraciously. Walk slowly. Notice the way light falls through curtains at four in the afternoon.

You are not wasting time. You are filling the well.

*The page will still be there. So will you.*`,
    },
    {
        id: 'share-your-craft',
        category: 'CRAFT · WRITING',
        title: 'Share Your Craft. Create. Motivate. Inspire.',
        image: '/assets/aquarium.jpg',
        alt: 'Creating and sharing craft',
        excerpt: 'Sometimes the greatest poetry comes from building something new. Examining the creative process of construction — in words and in life.',
        content: `I want to tell you something that took me years to understand:

Your work does not exist until someone else reads it.

I don't mean this in the cold, commercial sense. I mean something stranger and more beautiful. A story held only in your mind is a seed in your pocket. It has all the potential in the world. But it is not yet a tree.

**The Act of Sharing as Creation**

Sharing is not the final step of the creative process. It is part of the creative process itself. When you share your work, you discover what it actually is. Readers show you what you've made.

**Building Something That Lasts**

The craftspeople of the ancient world understood this intuitively. A potter didn't make a vessel and hide it. A weaver didn't complete a tapestry and roll it up in darkness. The craft existed in community.

When you share your writing — whether on Writeza or a story sent to a friend — you are participating in this ancient exchange. You are adding your thread to the tapestry.

Create not because you are certain of your talent. Create because you have something to say.

*Build the space. Fill it with honest work. Someone will find their way inside.*`,
    },
    {
        id: 'be-a-writer',
        category: 'FEATURED · PROJECTS',
        title: 'Be a Writer. Dreamer. Storyteller.',
        image: '/assets/creative.jpg',
        alt: 'Creative writing and storytelling',
        excerpt: 'An exploration of sustainability in creativity. How can we create art that lasts, that matters, that leaves the world better than we found it?',
        content: `The first story I ever wrote was six sentences long and featured a dragon who was afraid of fire.

I was seven years old. I didn't know I was doing anything significant. I was just putting something that lived in my head onto paper, because paper felt more permanent than thought.

**What It Means to Be a Writer**

Being a writer is not about publication. It is not about word counts or writing streaks or the number of rejections you've collected.

The essence is this: you notice things. You cannot help but notice things. The way a particular silence sounds different from other silences.

You notice, and then you feel the compulsion — nearly physical — to record what you've noticed. That compulsion is your identity as a writer. Everything else is craft, which can be learned. The noticing is already in you.

**The Dreamer's Responsibility**

Every innovation in human history began as someone's dream. Every movement for justice began as someone imagining a world that wasn't yet real.

Your stories do this work too. Even the small ones. Especially the small ones.

Be a writer. Be a dreamer. Be a storyteller. That is what Writeza is here for.

*The story you're afraid to tell is probably the one someone desperately needs to hear.*`,
    },
];

const EMOJI_SETS = [
    ['🐶','🐱','🐭','🐹'],
    ['🦊','🐻','🐼','🐨','🐯','🦁'],
    ['🐸','🐙','🦋','🌈','🍦','🎈','🚀','⭐'],
    ['🍕','🍔','🌮','🍩','🍭','🎂','🍓','🍉','🍋','🌻'],
    ['🎨','🎸','🎺','🎻','🥁','🎯','🎲','🎮','🏆','⚽','🌍','🦄'],
];
const LEVEL_NAMES = ['Baby Steps 🐣','Easy Peasy 🌟','Getting Fun 🎉','Challenge! 🔥','Master! 👑'];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function MemoryGame() {
    const [level, setLevel]             = useState(0);
    const [cards, setCards]             = useState(() => shuffle([...EMOJI_SETS[0], ...EMOJI_SETS[0]].map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }))));
    const [flipped, setFlipped]         = useState([]);
    const [moves, setMoves]             = useState(0);
    const [score, setScore]             = useState(0);
    const [locked, setLocked]           = useState(false);
    const [won, setWon]                 = useState(false);
    const [allDone, setAllDone]         = useState(false);
    const [stars, setStars]             = useState([]);
    const [timer, setTimer]             = useState(0);
    const [timerActive, setTimerActive] = useState(true);

    useEffect(() => {
        if (!timerActive || won) return;
        const t = setInterval(() => setTimer(p => p + 1), 1000);
        return () => clearInterval(t);
    }, [timerActive, won]);

    const startLevel = useCallback(lvl => {
        const emojis = EMOJI_SETS[lvl];
        setLevel(lvl);
        setCards(shuffle([...emojis, ...emojis].map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }))));
        setFlipped([]); setMoves(0); setLocked(false); setWon(false); setTimer(0); setTimerActive(true);
    }, []);

    const handleCard = idx => {
        if (locked || cards[idx].flipped || cards[idx].matched || flipped.length === 2) return;
        const nc = cards.map((c, i) => i === idx ? { ...c, flipped: true } : c);
        const nf = [...flipped, idx];
        setCards(nc); setFlipped(nf);
        if (nf.length === 2) {
            setMoves(m => m + 1); setLocked(true);
            const [a, b] = nf;
            if (nc[a].emoji === nc[b].emoji) {
                setTimeout(() => {
                    const matched = nc.map((c, i) => i === a || i === b ? { ...c, matched: true } : c);
                    setCards(matched); setFlipped([]); setLocked(false);
                    if (matched.every(c => c.matched)) {
                        setTimerActive(false);
                        const pts = Math.max((EMOJI_SETS[level].length * 10) - (moves * 2), 10);
                        setScore(s => s + pts);
                        setStars(Array(Math.max(3 - Math.floor(moves / 5), 1)).fill('⭐'));
                        setWon(true);
                    }
                }, 400);
            } else {
                setTimeout(() => { setCards(nc.map((c, i) => i === a || i === b ? { ...c, flipped: false } : c)); setFlipped([]); setLocked(false); }, 900);
            }
        }
    };

    const cols = Math.ceil(Math.sqrt(cards.length));

    if (allDone) return (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🏆</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.8rem', color: 'var(--text)', marginBottom: 8 }}>Memory Master!</h3>
            <p style={{ color: 'var(--text-2)', marginBottom: 8 }}>You completed all 5 levels!</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--accent)', marginBottom: 24 }}>Final Score: {score}</p>
            <button onClick={() => { setScore(0); setAllDone(false); startLevel(0); }}
                style={{ padding: '10px 24px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                🔄 Play Again
            </button>
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
                {[
                    { label: 'LEVEL', value: `${level + 1}/5`, sub: LEVEL_NAMES[level] },
                    { label: 'MOVES', value: moves },
                    { label: 'SCORE', value: score },
                    { label: 'TIME',  value: `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}` },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', minWidth: 80 }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-4)', display: 'block', marginBottom: 4 }}>{s.label}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)', display: 'block', lineHeight: 1 }}>{s.value}</span>
                        {s.sub && <span style={{ fontSize: '0.7rem', color: 'var(--text-4)' }}>{s.sub}</span>}
                    </div>
                ))}
            </div>

            {/* Level progress bars */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
                {EMOJI_SETS.map((_, i) => (
                    <div key={i} style={{ height: 6, width: 40, borderRadius: 3, background: i < level ? 'var(--green)' : i === level ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s' }} />
                ))}
            </div>

            {!won ? (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8, maxWidth: cols * 76, margin: '0 auto 24px', justifyContent: 'center' }}>
                        {cards.map((card, idx) => (
                            <div key={card.id} onClick={() => handleCard(idx)}
                                style={{ width: 68, height: 68, borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', cursor: card.matched ? 'default' : 'pointer', background: card.matched ? 'rgba(45,106,79,0.12)' : card.flipped ? 'var(--surface)' : 'var(--accent)', border: card.matched ? '1px solid rgba(45,106,79,0.3)' : card.flipped ? '1px solid var(--accent)' : '1px solid transparent', transform: (card.flipped || card.matched) ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.2s', userSelect: 'none' }}>
                                {card.flipped || card.matched ? card.emoji : '❓'}
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <button onClick={() => startLevel(level)} style={{ padding: '8px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-2)', fontFamily: 'var(--font-sans)' }}>🔄 Restart Level</button>
                    </div>
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>{level === EMOJI_SETS.length - 1 ? '🏆' : '🎉'}</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--accent)', marginBottom: 8 }}>Level Complete!</h3>
                    <p style={{ fontSize: '1.5rem', marginBottom: 4 }}>{stars.join('')}</p>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', marginBottom: 20 }}>{moves} moves · {timer}s</p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => startLevel(level)} style={{ padding: '9px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-2)', fontFamily: 'var(--font-sans)' }}>🔄 Retry</button>
                        {level + 1 < EMOJI_SETS.length
                            ? <button onClick={() => startLevel(level + 1)} style={{ padding: '9px 20px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>Next Level ➡️</button>
                            : <button onClick={() => setAllDone(true)} style={{ padding: '9px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>🏆 Finish!</button>
                        }
                    </div>
                </div>
            )}
        </div>
    );
}

function ArticleView({ article, onBack }) {
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
    const paragraphs = article.content.split('\n\n');
    return (
        <main style={{ maxWidth: 760, margin: '0 auto', padding: '56px 5%' }}>
            <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500, marginBottom: 40, padding: 0 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                Back to About
            </button>
            <span style={{ fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', background: 'var(--accent-light)', padding: '4px 12px', borderRadius: 'var(--r-full)', display: 'inline-block', marginBottom: 16 }}>{article.category}</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.15, marginBottom: 36, letterSpacing: '-0.02em' }}>{article.title}</h1>
            <div style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', marginBottom: 48, boxShadow: 'var(--sh-lg)' }}>
                <img src={article.image} alt={article.alt} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ fontSize: '1.05rem', lineHeight: 2.0, color: 'var(--text-2)', fontFamily: 'var(--font-serif)' }}>
                {paragraphs.map((para, i) => {
                    if (!para.trim()) return null;
                    if (para.startsWith('**') && para.endsWith('**')) return (
                        <h2 key={i} style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.5rem', color: 'var(--text)', marginTop: 40, marginBottom: 16 }}>{para.replace(/\*\*/g, '')}</h2>
                    );
                    if (para.startsWith('*') && para.endsWith('*')) return (
                        <p key={i} style={{ fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--accent)', textAlign: 'center', margin: '40px 0', padding: '20px 32px', borderLeft: '3px solid var(--accent)', background: 'var(--accent-light)', borderRadius: '0 var(--r-md) var(--r-md) 0' }}>{para.replace(/\*/g, '')}</p>
                    );
                    return <p key={i} style={{ marginBottom: 24 }}>{para}</p>;
                })}
            </div>
            <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
                <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>← Back to About</button>
            </div>
        </main>
    );
}

export default function AboutPage() {
    const [activeArticle, setActiveArticle] = useState(null);
    if (activeArticle) return <ArticleView article={activeArticle} onBack={() => setActiveArticle(null)} />;

    return (
        <main className="about-page">

            {/* Header */}
            <div className="about-header">
                <div className="about-header-inner">
                    <div>
                        <span className="eyebrow">About Writeza</span>
                        <h1 className="page-title">Where Writers<br />Come Alive</h1>
                        <p className="page-description">
                            Writeza is a creative space where writers of all levels publish their stories, poems, essays, and creative pieces — and connect with a community that values authentic storytelling.
                        </p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 32, flexWrap: 'wrap' }}>
                            {['Poetry', 'Essays', 'Stories', 'Community'].map(t => (
                                <span key={t} style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 'var(--r-full)', background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--border)' }}>{t}</span>
                            ))}
                        </div>
                    </div>
                    <div className="about-header-image">
                        <img src="/assets/me.jpg" alt="Writeza" />
                    </div>
                </div>
            </div>

            {/* Mission */}
            <section style={{ background: 'var(--bg)', padding: '72px 5%' }}>
                <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
                    <div className="section-label" style={{ justifyContent: 'center' }}>
                        <span className="eyebrow">Our Mission</span>
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1.8rem,4vw,3rem)', marginBottom: 24 }}>
                        Write, Share, and Inspire Without Limits
                    </h2>
                    <p style={{ color: 'var(--text-2)', fontSize: '1rem', lineHeight: 1.95, maxWidth: 720, margin: '0 auto' }}>
                        Writeza's mission is to empower writers by providing a creative and accessible platform where ideas, stories, and voices can be shared freely. We aim to inspire creativity, support self-expression, and help writers build meaningful portfolios while connecting with a community that values storytelling, originality, and growth. Writeza strives to make writing opportunities open to everyone — from aspiring storytellers to experienced authors — by creating a space where creativity thrives and words make an impact.
                    </p>
                </div>
            </section>

            {/* Portfolio cards */}
            <div className="portfolio-grid">
                {ARTICLES.map(article => (
                    <article key={article.id} className="portfolio-card">
                        <div className="card-image"><img src={article.image} alt={article.alt} /></div>
                        <div className="card-content">
                            <span className="card-category">{article.category}</span>
                            <h2>{article.title}</h2>
                            <p>{article.excerpt}</p>
                            <button onClick={() => { setActiveArticle(article); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="read-more">
                                Read More
                                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            {/* Purpose */}
            <section className="purpose-statement">
                <div style={{ maxWidth: 1360, margin: '0 auto' }}>
                    <div className="section-label"><span className="eyebrow">Why Writeza</span></div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>What Writeza Stands For</h2>
                    <div className="purpose-columns">
                        {[
                            {
                                icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" d="M5 3l14 9-14 9V3z"/></svg>,
                                title: 'To Showcase',
                                body: 'Every piece published on Writeza represents a moment in time, a feeling captured, a story told. Your profile is your creative archive — proof that your words have power.',
                            },
                            {
                                icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>,
                                title: 'To Connect',
                                body: 'Art exists in the space between creator and audience. Writeza is a bridge — an invitation to dialogue, and an opportunity to find common ground in our shared human experience.',
                            },
                            {
                                icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
                                title: 'To Inspire',
                                body: 'If even one person reads your words and feels less alone, more understood, or inspired to create their own work, then Writeza has served its truest purpose.',
                            },
                        ].map(p => (
                            <div key={p.title} className="purpose-item">
                                <div className="purpose-item-icon">{p.icon}</div>
                                <h3>{p.title}</h3>
                                <p>{p.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Memory Game */}
            <section style={{ padding: '80px 5%', background: 'var(--bg)' }}>
                <div style={{ maxWidth: 1360, margin: '0 auto' }}>
                    <div className="section-label"><span className="eyebrow">Mini Game</span></div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: 8 }}>Emoji Memory Match</h2>
                    <p style={{ color: 'var(--text-3)', marginBottom: 40 }}>Take a creative break — flip the cards and find all matching pairs!</p>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '48px', boxShadow: 'var(--sh-md)' }}>
                        <MemoryGame />
                    </div>
                </div>
            </section>
        </main>
    );
}

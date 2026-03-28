'use client';

import { useState, useEffect } from 'react';

type Task = {
    id: number;
    label: string;
    points: number; // positive or negative
};

const TASKS: Task[] = [
    { id: 1, label: 'Practice Guitar Strumming', points: 7 },
    { id: 2, label: 'Practice Guitar Fingerstyle', points: 10 },
    { id: 3, label: 'Reading 10 pages of a book', points: 5 },
    { id: 4, label: 'Play 3 PUBG games', points: -20 },
    { id: 5, label: 'Random scrolling 30 min', points: -15 },
    { id: 6, label: 'Tech Course', points: 15 },
];

export default function Home() {
    const [points, setPoints] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [animateScore, setAnimateScore] = useState(false);
    const [lastAction, setLastAction] = useState<{ label: string, points: number } | null>(null);

    // Load initial points from Database
    useEffect(() => {
        fetch('/api/logs')
            .then((res) => res.json())
            .then((data) => {
                if (typeof data.total === 'number') {
                    setPoints(data.total);
                }
            })
            .catch((err) => console.error('Failed to fetch points:', err))
            .finally(() => setLoading(false));
    }, []);

    const handleTaskClick = async (task: Task) => {
        // Optimistic update
        const previousPoints = points;
        setPoints((prev) => prev + task.points);
        setAnimateScore(true);
        setLastAction({ label: task.label, points: task.points });

        // Reset animation trigger
        setTimeout(() => setAnimateScore(false), 300);
        // Clear last action message
        setTimeout(() => setLastAction(null), 2000);

        try {
            const res = await fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: task.label, points: task.points }),
            });

            if (!res.ok) throw new Error('Failed to save');

            const data = await res.json();
            // Sync strictly with server total to catch any drift
            setPoints(data.total);
        } catch (error) {
            // Revert on error
            console.error(error);
            setPoints(previousPoints);
            alert('Failed to save point. Please try again.');
        }
    };

    const getScoreColorClass = () => {
        if (points > 0) return 'score-positive';
        if (points < 0) return 'score-negative';
        return '';
    };

    return (
        <main className="container">
            <header className="header animate-slide-in" style={{ animationDelay: '0s' }}>
                <h1 style={{ fontSize: '1.5rem', opacity: 0.8 }}>LifePoint Tracker</h1>
                {loading ? (
                    <div className="lifepoint-score" style={{ fontSize: '2rem', opacity: 0.5 }}>Loading...</div>
                ) : (
                    <div
                        className={`lifepoint-score ${getScoreColorClass()} ${animateScore ? 'pulse' : ''}`}
                        style={{ animation: animateScore ? 'pulse 0.3s ease-in-out' : 'none' }}
                    >
                        {points > 0 ? '+' : ''}{points}
                    </div>
                )}

                {/* Feedback Message */}
                <div style={{ height: '2rem', marginBottom: '1rem', color: lastAction?.points && lastAction.points > 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 'bold' }}>
                    {lastAction && (
                        <span className="animate-slide-in">
                            {lastAction.points > 0 ? '+' : ''}{lastAction.points} for {lastAction.label}
                        </span>
                    )}
                </div>
            </header>

            <div className="task-list">
                {TASKS.map((task, index) => (
                    <button
                        key={task.id}
                        className={`card ${task.points > 0 ? 'positive' : 'negative'} animate-slide-in`}
                        style={{ animationDelay: `${index * 0.1}s`, width: '100%' }}
                        onClick={() => handleTaskClick(task)}
                    >
                        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{task.label}</span>
                        <span className={`points-badge ${task.points > 0 ? 'points-positive' : 'points-negative'}`}>
                            {task.points > 0 ? '+' : ''}{task.points}
                        </span>
                    </button>
                ))}
            </div>
        </main>
    );
}

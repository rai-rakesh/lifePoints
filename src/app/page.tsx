'use client';

import { useState, useEffect } from 'react';

type Task = {
    id: number;
    label: string;
    points: number; // positive or negative
};

const TASKS: Task[] = [
    { id: 1, label: 'Practice Guitar Strumming 30 min', points: 10 },
    { id: 2, label: 'Practice Guitar Fingerstyle 30 min', points: 15 },
    { id: 3, label: 'Reading for 20 min', points: 8 },
    { id: 4, label: '4 BGMI matches', points: -20 },
    { id: 5, label: 'Random scrolling 30 min', points: -15 },
    { id: 6, label: 'Complete a 40 min lecture', points: 12 },
    { id: 7, label: 'Learn chess for 20 min', points: 10 },
    { id: 8, label: 'Medidate / Write Thoughts for 20 min', points: 15 },
    { id: 9, label: 'NPF', points: -50 },
    { id: 10, label: 'Random YT video for 30 min', points: -15 },
    { id: 11, label: 'Gym', points: 5 },
    { id: 12, label: 'Vibe coding on a project for 40 min', points: 15 },
    { id: 13, label: 'Cold face wash', points: 5 },
    { id: 14, label: 'Guitar Practice', points: 10 },
    { id: 15, label: '1 RC game', points: -15 },
    { id: 16, label: 'Night Schedule', points: 8 },
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

            <div className="task-columns">
                <div className="task-column">
                    <h2 className="column-title positive-title">Positive Habits</h2>
                    {TASKS.filter(t => t.points > 0).map((task, index) => (
                        <button
                            key={task.id}
                            className="card positive animate-slide-in"
                            style={{ animationDelay: `${index * 0.1}s`, width: '100%' }}
                            onClick={() => handleTaskClick(task)}
                        >
                            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', textAlign: 'left' }}>{task.label}</span>
                            <span className="points-badge points-positive">
                                +{task.points}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="task-column">
                    <h2 className="column-title negative-title">Negative Habits</h2>
                    {TASKS.filter(t => t.points < 0).map((task, index) => (
                        <button
                            key={task.id}
                            className="card negative animate-slide-in"
                            style={{ animationDelay: `${index * 0.1}s`, width: '100%' }}
                            onClick={() => handleTaskClick(task)}
                        >
                            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', textAlign: 'left' }}>{task.label}</span>
                            <span className="points-badge points-negative">
                                {task.points}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </main>
    );
}

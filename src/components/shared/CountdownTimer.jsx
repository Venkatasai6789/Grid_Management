import React, { useState, useEffect } from 'react';

// Fully isolated timer — only renders its own number, no parent re-renders
const CountdownTimer = ({ seconds, onExpire }) => {
    const [remaining, setRemaining] = useState(seconds);

    useEffect(() => {
        if (remaining <= 0) {
            onExpire();
            return;
        }
        const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
        return () => clearTimeout(id);
    }, [remaining, onExpire]);

    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;

    return (
        <span className={`font-mono font-black text-lg ${remaining <= 10 ? 'text-red-500 animate-pulse' : remaining <= 30 ? 'text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}>
            {mins > 0 && `${mins}:`}{secs.toString().padStart(2, '0')}s
        </span>
    );
};

export default CountdownTimer;

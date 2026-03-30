'use client';

import { useState, useEffect } from 'react';

export function LocalTime({ date, format = 'toLocaleString' }) {
    const [formattedDate, setFormattedDate] = useState('...');

    useEffect(() => {
        if (!date) return;
        const d = new Date(date);
        
        // Handle invalid dates gracefully
        if (isNaN(d.getTime())) {
            setFormattedDate('Invalid Date');
            return;
        }

        if (format === 'toLocaleDateString') {
            setFormattedDate(d.toLocaleDateString());
        } else if (format === 'toLocaleTimeString') {
            setFormattedDate(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else {
            setFormattedDate(d.toLocaleString());
        }
    }, [date, format]);

    return <span suppressHydrationWarning>{formattedDate}</span>;
}

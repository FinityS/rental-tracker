import React from 'react';

export function Input({ className = '', ...props }) {
    return (
        <input
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            style={{
                backgroundColor: 'transparent',
                borderColor: 'hsl(var(--input))',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderRadius: 'var(--radius)',
                padding: '0.5rem 0.75rem',
                width: '100%',
                color: 'hsl(var(--foreground))',
            }}
            {...props}
        />
    );
}

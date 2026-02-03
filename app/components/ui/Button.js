import React from 'react';

export function Button({ children, variant = 'default', className = '', ...props }) {
    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius)',
        fontSize: '0.875rem',
        fontWeight: '500',
        height: '2.5rem',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        transition: 'colors 0.2s',
        border: 'none',
        outline: 'none',
    };

    const variants = {
        default: {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
        },
        outline: {
            backgroundColor: 'transparent',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
        },
        ghost: {
            backgroundColor: 'transparent',
            color: 'hsl(var(--foreground))',
        },
        destructive: {
            backgroundColor: 'hsl(var(--destructive))',
            color: 'hsl(var(--destructive-foreground))',
        }
    };

    const style = { ...baseStyles, ...variants[variant] };

    return (
        <button
            className={className}
            style={style}
            onMouseOver={(e) => {
                if (variant === 'default') e.currentTarget.style.opacity = '0.9';
                if (variant === 'outline') e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
            }}
            onMouseOut={(e) => {
                if (variant === 'default') e.currentTarget.style.opacity = '1';
                if (variant === 'outline') e.currentTarget.style.backgroundColor = 'transparent';
            }}
            {...props}
        >
            {children}
        </button>
    );
}

import React from 'react';

interface HealthBarProps {
    current: number;
    max: number;
    width?: number; // Pixel width
    height?: number;
    style?: React.CSSProperties;
}

export const HealthBar: React.FC<HealthBarProps> = React.memo(({ current, max, width = 40, height = 4, style }) => {
    const percent = Math.max(0, Math.min(100, (current / max) * 100));

    // Color logic
    let color = '#2ecc71'; // Green
    if (percent < 50) color = '#f1c40f'; // Yellow
    if (percent < 25) color = '#e74c3c'; // Red

    return (
        <div
            style={{
                width: width,
                height: height,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: height / 2,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                pointerEvents: 'none', // Optimization: Ensure it doesn't block clicks
                ...style
            }}
        >
            <div
                style={{
                    width: `${percent}%`,
                    height: '100%',
                    backgroundColor: color,
                    transition: 'width 0.2s ease-out'
                }}
            />
        </div>
    );
});

HealthBar.displayName = 'HealthBar';

import React from 'react';

export interface ProjectileData {
    id: string;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    progress: number; // 0 to 1
    targetUnitId?: string; // Unit to damage on hit
}

export const Projectile: React.FC<ProjectileData> = ({ startX, startY, targetX, targetY, progress }) => {
    // Interpolate
    const curX = startX + (targetX - startX) * progress;
    const curY = startY + (targetY - startY) * progress;

    // Iso convert
    const left = (curX - curY) * 50;
    const top = (curX + curY) * 25;

    // Arc height (Parabola)
    // h = 4 * maxH * x * (1-x)
    const arcHeight = 100 * 4 * progress * (1 - progress);

    const zIndex = 5000; // Always on top

    return (
        <div
            style={{
                position: 'absolute',
                left: left,
                top: top - arcHeight, // Apply arc
                zIndex: zIndex,
                pointerEvents: 'none',
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.05s linear'
            }}
        >
            <div className="w-3 h-3 bg-black rounded-full shadow-md border border-gray-600"></div>
        </div>
    );
};

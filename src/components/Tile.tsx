
import React from 'react';
import '../styles/Isometric.css';

interface TileProps {
    x: number;
    y: number;
    isSelected?: boolean;
    onClick?: (x: number, y: number) => void;
    onHover?: (x: number, y: number) => void;
}

const TILE_WIDTH = 100;
const TILE_HEIGHT = 50;

/**
 * Calculates the screen position for an isometric tile at (x, y).
 * 
 * Standard Isometric:
 * screenX = (x - y) * (width / 2)
 * screenY = (x + y) * (height / 2)
 */
export const Tile: React.FC<TileProps> = React.memo(({ x, y, isSelected, onClick, onHover }) => {
    const screenX = (x - y) * (TILE_WIDTH / 2);
    const screenY = (x + y) * (TILE_HEIGHT / 2);

    // We add a 'top' and 'left' offset to center the grid (0,0) roughly or shift it.
    // Although simpler is to handle centering via the parent container.

    return (
        <div
            className={`tile ${isSelected ? 'selected' : ''}`}
            style={{
                left: `${screenX}px`,
                top: `${screenY}px`,
                zIndex: x + y, // Simple painter's algorithm for stacking
            }}
            title={`Tile ${x},${y}`}
            onClick={() => onClick?.(x, y)}
            onMouseEnter={() => onHover?.(x, y)}
        >
            {/* SVG is handled via CSS background-image for optimization,
          But we can override here if needed for dynamic content like buildings.
      */}
            <img
                src="/grass3.png"
                alt="grass"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    display: 'block',
                    transform: 'scale(1.02)' // Slight overlap to prevent sub-pixel gaps
                }}
            />
            {isSelected && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(241, 196, 15, 0.3)',
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    pointerEvents: 'none',
                    zIndex: 1
                }} />
            )}
        </div>
    );
});

Tile.displayName = 'Tile';

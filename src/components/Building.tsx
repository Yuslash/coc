import React from 'react';
import { BUILDINGS } from '../hooks/useBuildingSystem';
import type { BuildingType } from '../hooks/useBuildingSystem';
import { UNIT_TYPES } from '../hooks/useUnitSystem';
import type { UnitData } from '../hooks/useUnitSystem';
import { HealthBar } from './HealthBar'; // Import

interface BuildingProps {
    id: string;
    type: BuildingType;
    x: number;
    y: number;
    width: number;
    height: number;
    isSelected?: boolean;
    units?: UnitData[];
    showRange?: boolean;
    hp?: number;
    maxHp?: number;
    onClick?: () => void;
    pointerEvents?: 'auto' | 'none'; // Control clickability
}

const TILE_WIDTH = 100;
const TILE_HEIGHT = 50;
const BOX_HEIGHT = 40;

// Cannon Config
const CANNON_RANGE = 7; // Tiles

export const Building: React.FC<BuildingProps> = React.memo(({ type, x, y, width, height, isSelected, units = [], showRange = false, hp, maxHp, onClick, pointerEvents = 'auto' }) => {
    const buildingColor = BUILDINGS[type].color;

    const [isHovered, setIsHovered] = React.useState(false);
    const shouldShowHp = (isSelected || isHovered) && (hp !== undefined && maxHp !== undefined);

    // Position the building div the same way tiles are positioned
    const divLeft = (x - y) * (TILE_WIDTH / 2);
    const divTop = (x + y) * (TILE_HEIGHT / 2);

    const w = width;
    const h = height;
    const bh = BOX_HEIGHT;

    // Calculate drawing coordinates
    const topX = 0, topY = 0;
    const rightX = w * 50, rightY = w * 25;
    const bottomX = (w - h) * 50, bottomY = (w + h) * 25;
    const leftX = -h * 50, leftY = h * 25;

    // Determine SVG bounding box requirements
    const minX = Math.min(topX, rightX, bottomX, leftX) - 20;
    const maxX = Math.max(topX, rightX, bottomX, leftX) + 20;
    const minY = Math.min(topY, rightY, bottomY, leftY) - bh - 50;
    const maxY = Math.max(topY, rightY, bottomY, leftY) + 20;

    // Expand SVG for Range Circle
    const rangePx = CANNON_RANGE * 50;
    const svgMinX = showRange ? Math.min(minX, -rangePx) : minX;
    const svgMaxX = showRange ? Math.max(maxX, rangePx) : maxX;
    const svgMinY = showRange ? Math.min(minY, -rangePx / 2) : minY;

    const svgWidth = svgMaxX - svgMinX;
    const svgHeight = maxY - svgMinY;

    const zIndex = 2000 + (x + y) * 10;

    // ... (Troop generation logic remains same) ...
    const troops = [];
    if (type === 'ArmyCamp' && units.length > 0) {
        const unitCount = units.length;
        const rows = Math.ceil(Math.sqrt(unitCount));
        const cols = Math.ceil(unitCount / rows);

        for (let i = 0; i < unitCount; i++) {
            const unit = units[i];
            const unitColor = UNIT_TYPES[unit.type].color;
            const row = Math.floor(i / cols);
            const col = i % cols;
            const margin = 0.2;
            const avail = 1.0 - 2 * margin;
            const a = margin + (col / (cols || 1)) * avail;
            const b = margin + (row / (rows || 1)) * avail;
            const tx = (rightX * a) + (leftX * b);
            const ty = (rightY * a) + (leftY * b) - bh;
            troops.push(
                <circle key={unit.id} cx={tx} cy={ty} r="4" fill={unitColor} stroke="white" strokeWidth="1" />
            );
        }
    }

    // Calculate specific anchor points for Health Bar
    const roofY = topY - bh;
    const centerX = (topX + bottomX) / 2;

    return (
        <div
            className="building"
            style={{
                position: 'absolute',
                left: divLeft,
                top: divTop,
                width: 0,
                height: 0,
                zIndex: zIndex,
                pointerEvents: 'none', // Let clicks pass through to tiles
                transition: 'left 0.1s ease-out, top 0.1s ease-out', // Smooth movement!
            }}
        >
            {/* Health Bar Overlay */}
            {shouldShowHp && hp !== undefined && maxHp !== undefined && (
                <div
                    style={{
                        position: 'absolute',
                        top: roofY + 15, // 15px above the roof
                        left: centerX + 50,
                        transform: 'translateX(-50%)',
                        zIndex: zIndex + 100,
                        pointerEvents: 'none'
                    }}
                >
                    <HealthBar current={hp} max={maxHp} width={80} height={10} />
                </div>
            )}

            <svg
                style={{
                    position: 'absolute',
                    left: 50 + svgMinX,
                    top: svgMinY,
                    overflow: 'visible',
                    pointerEvents: pointerEvents, // Controlled by prop
                    transition: 'opacity 0.2s',
                }}
                width={svgWidth}
                height={svgHeight}
                viewBox={`${svgMinX} ${svgMinY} ${svgWidth} ${svgHeight}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <g>
                    {/* RANGE INDICATOR */}
                    {showRange && type === 'Cannon' && (
                        <ellipse
                            cx={(topX + bottomX) / 2}
                            cy={(topY + bottomY) / 2}
                            rx={CANNON_RANGE * 50}
                            ry={CANNON_RANGE * 25}
                            fill="rgba(255, 255, 255, 0.1)"
                            stroke="white"
                            strokeWidth="2"
                            strokeDasharray="10 5"
                        />
                    )}

                    {/* BASE FOOTPRINT (Shadow) - Always show for grounding */}
                    <polygon
                        points={`${topX},${topY} ${rightX},${rightY} ${bottomX},${bottomY} ${leftX},${leftY}`}
                        fill="rgba(0,0,0,0.2)"
                        stroke="rgba(0,0,0,0.1)"
                        strokeWidth="1"
                    />

                    {/* RENDER TEXTURE IF DEFINED IN CONFIG */}
                    {BUILDINGS[type].texture ? (
                        <image
                            href={BUILDINGS[type].texture?.src}
                            x={BUILDINGS[type].texture?.offsetX}
                            y={BUILDINGS[type].texture?.offsetY}
                            width={BUILDINGS[type].texture?.width}
                            height={BUILDINGS[type].texture?.height}
                            preserveAspectRatio="xMidYBottom"
                            style={{
                                pointerEvents: 'none' // Ensure clicks pass through to SVG
                            }}
                        />
                    ) : (
                        /* STANDARD KEY CUBE RENDERING */
                        <>
                            {/* TOP FACE */}
                            <polygon
                                points={`${topX},${topY - bh} ${rightX},${rightY - bh} ${bottomX},${bottomY - bh} ${leftX},${leftY - bh}`}
                                fill={buildingColor}
                                stroke="rgba(255,255,255,0.3)"
                                strokeWidth="1.5"
                            />

                            {/* RIGHT FACE */}
                            <polygon
                                points={`${rightX},${rightY - bh} ${rightX},${rightY} ${bottomX},${bottomY} ${bottomX},${bottomY - bh}`}
                                fill={adjustBrightness(buildingColor, -30)}
                                stroke="rgba(0,0,0,0.2)"
                                strokeWidth="1"
                            />

                            {/* LEFT FACE */}
                            <polygon
                                points={`${leftX},${leftY - bh} ${leftX},${leftY} ${bottomX},${bottomY} ${bottomX},${bottomY - bh}`}
                                fill={adjustBrightness(buildingColor, -50)}
                                stroke="rgba(0,0,0,0.2)"
                                strokeWidth="1"
                            />
                        </>
                    )}



                    {/* UNITS / TROOPS */}
                    {troops}

                    {/* Label */}
                    <text
                        x={bottomX}
                        y={topY - bh - 8}
                        textAnchor="middle"
                        fill="white"
                        fontSize="13"
                        fontWeight="bold"
                        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' } as React.CSSProperties}
                    >
                        {type === 'TownHall' ? 'Town Hall' : type}
                    </text>
                </g>
            </svg>
        </div>
    );
});

Building.displayName = 'Building';

function adjustBrightness(hex: string, amount: number): string {
    hex = hex.replace('#', '');
    const num = parseInt(hex, 16);
    let r = Math.min(255, Math.max(0, ((num >> 16) & 0xFF) + amount));
    let g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
    let b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default Building;

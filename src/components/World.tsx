import React, { useState, useEffect } from 'react';
import { Tile } from './Tile';
import { Building } from './Building';
import { Projectile } from './Projectile';
import { BuildingMenu } from './BuildingMenu';
import { BuildingActionMenu } from './BuildingActionMenu';
import { InfoModal } from './InfoModal';
import { TrainingModal } from './TrainingModal';
import { VictoryModal } from './VictoryModal';
import { HealthBar } from './HealthBar'; // Import
import { usePanZoom } from '../hooks/usePanZoom';
import { useBuildingSystem, BUILDINGS } from '../hooks/useBuildingSystem';
import { useUnitSystem, UNIT_TYPES } from '../hooks/useUnitSystem';
import { useCombatSystem } from '../hooks/useCombatSystem';
import type { BuildingType, BuildingData } from '../hooks/useBuildingSystem';
import type { WalkingUnit, UnitType } from '../hooks/useUnitSystem';
import { TEST_ENEMY_BASE } from '../data/enemyBase';

const GRID_SIZE = 20;

// 1. Grid Logic - Static
const gridPoints: { x: number, y: number }[] = [];
for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
        gridPoints.push({ x, y });
    }
}

export const World: React.FC = () => {
    // 2. Systems
    const { transform, handleMouseDown } = usePanZoom();
    const { buildings, placeBuilding, checkCollision, moveBuilding, loadLevel, damageBuilding } = useBuildingSystem();
    const { units, trainingQueue, walkingUnits, addToQueue, cancelTraining, getTotalCapacity, getTotalUsedCapacity, getUnitsForBuilding, removeUnit, deployUnit, clearWalkingUnits, setWalkingUnits } = useUnitSystem(buildings);
    const [gameState, setGameState] = useState<'HOME' | 'ATTACK'>('HOME');
    const { projectiles } = useCombatSystem(buildings, walkingUnits, damageBuilding, setWalkingUnits, gameState);

    const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
    const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
    const [placementMode, setPlacementMode] = useState<BuildingType | null>(null);
    const [movingBuildingId, setMovingBuildingId] = useState<string | null>(null);
    const [infoBuildingId, setInfoBuildingId] = useState<string | null>(null);
    const [hoverPos, setHoverPos] = useState<{ x: number, y: number } | null>(null);

    // Attack Mode State
    const [selectedTroopToDeploy, setSelectedTroopToDeploy] = useState<UnitType | null>(null);
    const [playerBaseSnapshot, setPlayerBaseSnapshot] = useState<BuildingData[]>([]);
    const [showVictoryModal, setShowVictoryModal] = useState(false);
    const [availableArmy, setAvailableArmy] = useState<Record<string, number>>({});
    const [deployedCount, setDeployedCount] = useState<Record<string, number>>({});

    // --- Game Logic Hooks ---
    // Check Victory
    useEffect(() => {
        if (gameState === 'ATTACK' && buildings.length === 0 && !showVictoryModal) {
            setShowVictoryModal(true);
        }
    }, [gameState, buildings, showVictoryModal]);

    // Start Attack
    const handleStartAttack = () => {
        // Snapshot the player's trained army
        const armyCounts: Record<string, number> = {};
        units.forEach(u => {
            armyCounts[u.type] = (armyCounts[u.type] || 0) + 1;
        });

        setAvailableArmy(armyCounts);
        setDeployedCount({});
        setPlayerBaseSnapshot(JSON.parse(JSON.stringify(buildings))); // Deep copy Home
        loadLevel(JSON.parse(JSON.stringify(TEST_ENEMY_BASE))); // Load Enemy (Deep copy)
        setGameState('ATTACK');
        clearWalkingUnits(); // Clear walking home units

        // Default to first available troop type
        const firstType = Object.keys(armyCounts).find(t => armyCounts[t] > 0) as UnitType | undefined;
        setSelectedTroopToDeploy(firstType || null);
    };

    // Return Home
    const handleReturnHome = () => {
        loadLevel(playerBaseSnapshot); // Restore Home
        setGameState('HOME');
        setShowVictoryModal(false);
        clearWalkingUnits(); // Clear deployed units
    };

    // 3. Interaction Handlers - Memoized
    const handleTileClick = React.useCallback((x: number, y: number) => {
        if (gameState === 'ATTACK') {
            // DEPLOY LOGIC
            // Simple: Check collision with buildings? No, can deploy anywhere valid? 
            // Let's say deploy anywhere NOT inside a building
            const isBlocked = buildings.some(b =>
                x >= b.x && x < b.x + b.width &&
                y >= b.y && y < b.y + b.height
            );

            if (!isBlocked && selectedTroopToDeploy) {
                // Check if we have troops left to deploy
                const remaining = (availableArmy[selectedTroopToDeploy] || 0) - (deployedCount[selectedTroopToDeploy] || 0);
                if (remaining > 0) {
                    deployUnit(selectedTroopToDeploy, x + 0.5, y + 0.5);
                    setDeployedCount(prev => ({
                        ...prev,
                        [selectedTroopToDeploy]: (prev[selectedTroopToDeploy] || 0) + 1
                    }));
                }
            }
            return;
        }

        if (placementMode) {
            const success = placeBuilding(placementMode, x, y);
            if (success) {
                setPlacementMode(null);
            }
        } else if (movingBuildingId) {
            const success = moveBuilding(movingBuildingId, x, y);
            if (success) {
                setMovingBuildingId(null);
                setSelectedBuildingId(null);
            }
        } else {
            // Check if clicked on a building
            const clickedBuilding = buildings.find(b =>
                x >= b.x && x < b.x + b.width &&
                y >= b.y && y < b.y + b.height
            );

            if (clickedBuilding) {
                setSelectedBuildingId(clickedBuilding.id);
            } else {
                setSelectedBuildingId(null);
                setMovingBuildingId(null);
            }
        }
    }, [buildings, placementMode, movingBuildingId, placeBuilding, moveBuilding, gameState, selectedTroopToDeploy, deployUnit, availableArmy, deployedCount]);

    const handleTileHover = React.useCallback((x: number, y: number) => {
        setHoverPos({ x, y });
    }, []);

    // Calculate center offset
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 4;

    const activeType = placementMode || (movingBuildingId ? buildings.find(b => b.id === movingBuildingId)?.type : null);
    const activeWidth = activeType ? BUILDINGS[activeType].width : 2;
    const activeHeight = activeType ? BUILDINGS[activeType].height : 2;

    const isPlacementValid = (placementMode || movingBuildingId) && hoverPos && !checkCollision(
        hoverPos.x,
        hoverPos.y,
        activeWidth,
        activeHeight,
        movingBuildingId || undefined
    );

    // Memoize Grid Render
    const renderedGrid = React.useMemo(() => (
        <>
            {gridPoints.map((point) => (
                <Tile
                    key={`tile-${point.x}-${point.y}`}
                    x={point.x}
                    y={point.y}
                    isSelected={false}
                    onClick={handleTileClick}
                    onHover={handleTileHover}
                />
            ))}
        </>
    ), [handleTileClick, handleTileHover]);

    // Render Walking Units
    const renderWalkingUnit = (unit: WalkingUnit) => {
        const curX = unit.startX + (unit.endX - unit.startX) * unit.progress;
        const curY = unit.startY + (unit.endY - unit.startY) * unit.progress;

        const left = (curX - curY) * 50;
        const top = (curX + curY) * 25;

        const zIndex = 3000 + Math.floor(curX + curY);

        // Simple Hover Check: Dist < 1.0 (Manhattan-ish or Euclidean squared for speed)
        let isUnitHovered = false;
        if (hoverPos) {
            const dx = Math.abs(curX - hoverPos.x);
            const dy = Math.abs(curY - hoverPos.y);
            if (dx < 0.8 && dy < 0.8) isUnitHovered = true; // Slightly tighter tolerance
        }

        return (
            <div
                key={unit.id}
                style={{
                    position: 'absolute',
                    left: left,
                    top: top,
                    zIndex: zIndex,
                    pointerEvents: 'none',
                    transform: 'translate(-50%, -100%)',
                    transition: 'all 0.05s linear'
                }}
            >
                {/* Health Bar for Unit - always show for deployed units */}
                {(unit.id.startsWith('deployed-') || isUnitHovered) && unit.hp !== undefined && unit.maxHp !== undefined && (
                    <div style={{ position: 'absolute', bottom: '160%', left: '50%', transform: 'translateX(-50%)', marginBottom: '2px' }}>
                        <HealthBar current={unit.hp} max={unit.maxHp} width={30} height={3} />
                    </div>
                )}

                <div className="relative">
                    <div className="absolute top-0 left-[-8px] w-4 h-2 bg-black/30 rounded-full blur-[1px]"></div>
                    <div
                        className="w-4 h-4 rounded-full border border-white shadow-sm"
                        style={{
                            backgroundColor: UNIT_TYPES[unit.type].color,
                            transform: 'translateY(-10px)'
                        }}
                    ></div>
                </div>
            </div>
        );
    };

    return (
        <div
            className="w-screen h-screen overflow-hidden bg-[radial-gradient(circle_at_center,_#34495e_0%,_#2c3e50_100%)] select-none"
            onMouseDown={handleMouseDown as unknown as React.MouseEventHandler}
        >
            <div
                style={{
                    transform: `translate(${transform.x + centerX}px, ${transform.y + centerY}px) scale(${transform.scale})`,
                    transformOrigin: '0 0',
                    transition: 'transform 0.1s linear',
                    position: 'absolute',
                }}
            >
                {/* Grid Background */}
                <div
                    style={{
                        backgroundColor: "green",
                        position: 'absolute',
                        top: 0,
                        left: -950, // (0 - 19) * 50
                        width: 2000, // 20 * 100
                        height: 1000, // 20 * 50
                        backgroundImage: 'url("/gras2.png")',
                        backgroundPosition: 'center', // Centers the image within the diamond
                        backgroundSize: 'cover', // Match tile size for seamless look if aligned
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                        pointerEvents: 'none',
                    }}
                />

                {/* 1. Render Grid Tiles */}
                {renderedGrid}

                {/* 2. Render Placed Buildings */}
                {buildings.map((b) => {
                    if (b.id === movingBuildingId) {
                        // Show ghost of original building position
                        return (
                            <div key={b.id} style={{ opacity: 0.25, filter: 'grayscale(1)', pointerEvents: 'none' }}>
                                <Building
                                    id={b.id}
                                    type={b.type}
                                    x={b.x}
                                    y={b.y}
                                    width={b.width}
                                    height={b.height}
                                />
                            </div>
                        );
                    }
                    return (
                        <Building
                            key={b.id}
                            id={b.id}
                            type={b.type}
                            x={b.x}
                            y={b.y}
                            width={b.width}
                            height={b.height}
                            isSelected={gameState === 'HOME' && selectedBuildingId === b.id}
                            showRange={gameState === 'HOME' && selectedBuildingId === b.id}
                            units={getUnitsForBuilding(b.id)}
                            hp={b.hp}
                            maxHp={b.maxHp}
                            onClick={() => handleTileClick(b.x, b.y)}
                        />
                    );
                })}

                {/* 2.5 Render Walking Units */}
                {walkingUnits.map(renderWalkingUnit)}

                {/* 2.6 Render Projectiles */}
                {projectiles.map(p => (
                    <Projectile
                        key={p.id}
                        {...p}
                    />
                ))}

                {/* 3. Render Placement/Move Preview */}
                {(placementMode || movingBuildingId) && hoverPos && activeType && (
                    <div
                        style={{
                            pointerEvents: 'none',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            zIndex: 5000,
                            opacity: 0.85,
                            filter: isPlacementValid ? 'drop-shadow(0 0 8px rgba(34,197,94,0.7))' : 'drop-shadow(0 0 8px rgba(239,68,68,0.7))',
                            transform: 'translateY(-4px)',
                            transition: 'filter 0.15s ease',
                        }}
                    >
                        <Building
                            id="preview"
                            type={activeType}
                            x={hoverPos.x}
                            y={hoverPos.y}
                            width={activeWidth}
                            height={activeHeight}
                            showRange={activeType === 'Cannon'}
                            pointerEvents="none"
                        />
                    </div>
                )}
            </div>

            {/* UI Overlay */}
            <div className="absolute top-4 left-4 bg-slate-900/80 text-white p-4 rounded-2xl backdrop-blur-md select-none z-[1000] border border-slate-700 shadow-2xl ring-1 ring-white/5 animate-in slide-in-from-left-4">
                <h3 className="m-0 mb-3 text-amber-400 font-orbitron font-bold uppercase tracking-widest text-xs border-b border-slate-700 pb-2 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${gameState === 'HOME' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    {gameState === 'HOME' ? 'System Status' : '⚔️ COMBAT MODE'}
                </h3>
                <div className="space-y-2 text-xs font-rajdhani font-bold text-slate-300">
                    {gameState === 'HOME' ? (
                        <>
                            <p className="m-0 flex justify-between items-center gap-4">
                                <span className="text-slate-500 uppercase tracking-wider">Grid</span>
                                <span className="text-emerald-400 bg-emerald-900/20 px-1.5 rounded">{GRID_SIZE}x{GRID_SIZE}</span>
                            </p>
                            <p className="m-0 flex justify-between items-center gap-4">
                                <span className="text-slate-500 uppercase tracking-wider">Zoom</span>
                                <span className="text-blue-400 bg-blue-900/20 px-1.5 rounded">{transform.scale.toFixed(2)}x</span>
                            </p>
                            <p className="m-0 flex justify-between items-center gap-4">
                                <span className="text-slate-500 uppercase tracking-wider">Mode</span>
                                <span className={`px-1.5 rounded ${placementMode ? 'text-amber-400 bg-amber-900/20' : movingBuildingId ? 'text-orange-400 bg-orange-900/20' : 'text-slate-200 bg-slate-800'}`}>
                                    {placementMode ? `PLACING: ${placementMode}` : movingBuildingId ? 'MOVING' : 'VIEW'}
                                </span>
                            </p>
                            <p className="m-0 flex justify-between items-center gap-4">
                                <span className="text-slate-500 uppercase tracking-wider">Army</span>
                                <span className="text-purple-400 bg-purple-900/20 px-1.5 rounded">{units.length} troops</span>
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="m-0 flex justify-between items-center gap-4">
                                <span className="text-red-400 uppercase tracking-wider">Target</span>
                                <span className="text-red-300 bg-red-900/30 px-1.5 rounded">Enemy Base</span>
                            </p>
                            <p className="m-0 flex justify-between items-center gap-4">
                                <span className="text-slate-500 uppercase tracking-wider">Buildings Left</span>
                                <span className="text-amber-400 bg-amber-900/20 px-1.5 rounded">{buildings.length}</span>
                            </p>
                            <p className="m-0 flex justify-between items-center gap-4">
                                <span className="text-slate-500 uppercase tracking-wider">Troops Alive</span>
                                <span className="text-emerald-400 bg-emerald-900/20 px-1.5 rounded">{walkingUnits.filter(u => u.id.startsWith('deployed-')).length}</span>
                            </p>
                            {Object.keys(availableArmy).map(type => {
                                const total = availableArmy[type] || 0;
                                const deployed = deployedCount[type] || 0;
                                const remaining = total - deployed;
                                return (
                                    <p key={type} className="m-0 flex justify-between items-center gap-4">
                                        <span className="text-slate-500 uppercase tracking-wider">{type}</span>
                                        <span className={`px-1.5 rounded ${remaining > 0 ? 'text-emerald-400 bg-emerald-900/20' : 'text-red-400 bg-red-900/20'}`}>
                                            {remaining}/{total}
                                        </span>
                                    </p>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>

            {/* Enemy Base Banner */}
            {gameState === 'ATTACK' && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-900/90 text-red-100 px-8 py-2 rounded-xl border border-red-600 font-orbitron font-bold uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center gap-3">
                    <span className="text-lg">💀</span>
                    ENEMY BASE
                    <span className="text-lg">💀</span>
                </div>
            )}

            {/* Surrender Button (Bottom Left, Attack Only) */}
            {gameState === 'ATTACK' && (
                <div className="absolute bottom-4 left-4 z-[1000]">
                    <button
                        onClick={handleReturnHome}
                        className="bg-slate-800 hover:bg-red-700 text-white font-orbitron font-bold text-sm px-6 py-3 rounded-xl border-2 border-red-600 shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <span>🏳️</span>
                        SURRENDER
                    </button>
                </div>
            )}

            {/* Attack Button (Bottom Left) */}
            {gameState === 'HOME' && !movingBuildingId && !placementMode && (
                <div className="absolute bottom-4 left-4 z-[1000]">
                    <button
                        onClick={handleStartAttack}
                        className="bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-xl px-8 py-4 rounded-xl border-4 border-red-800 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-transform hover:scale-105 active:scale-95 flex items-center gap-3"
                    >
                        <span>⚔️</span>
                        ATTACK
                    </button>
                </div>
            )}

            {/* Attack Deployment Menu (Bottom Center) */}
            {gameState === 'ATTACK' && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-700 backdrop-blur-md">
                    {Object.keys(availableArmy).filter(t => (availableArmy[t] || 0) > 0).map(type => {
                        const total = availableArmy[type] || 0;
                        const deployed = deployedCount[type] || 0;
                        const remaining = total - deployed;
                        return (
                            <button
                                key={type}
                                onClick={() => setSelectedTroopToDeploy(type as UnitType)}
                                disabled={remaining <= 0}
                                className={`
                                    relative w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all
                                    ${remaining <= 0 ? 'border-slate-700 bg-slate-800/50 opacity-40 cursor-not-allowed' :
                                        selectedTroopToDeploy === type ? 'border-amber-400 bg-amber-900/30 scale-110' : 'border-slate-600 bg-slate-800 hover:border-slate-400'}
                                `}
                            >
                                <div className="w-10 h-10 rounded-full border border-white/20 shadow-lg" style={{ backgroundColor: UNIT_TYPES[type as UnitType].color }}></div>
                                <span className="text-[10px] font-bold text-white uppercase mt-0.5">{type}</span>
                                <span className={`absolute -top-2 -right-2 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${remaining > 0 ? 'bg-emerald-500 text-white' : 'bg-red-600 text-white'}`}>
                                    {remaining}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Building Menu (Home Only) */}
            {gameState === 'HOME' && !movingBuildingId && !selectedBuildingId && (
                <BuildingMenu
                    onSelectBuilding={setPlacementMode}
                    selectedType={placementMode}
                    existingBuildings={buildings}
                />
            )}

            {/* Action Menu (Home Only) */}
            {gameState === 'HOME' && selectedBuildingId && !movingBuildingId && !infoBuildingId && (
                <BuildingActionMenu
                    selectedBuildingId={selectedBuildingId}
                    selectedBuildingType={buildings.find(b => b.id === selectedBuildingId)?.type || null}
                    onMove={() => {
                        setMovingBuildingId(selectedBuildingId);
                    }}
                    onInfo={() => setInfoBuildingId(selectedBuildingId)}
                    onClose={() => setSelectedBuildingId(null)}
                    onTrain={() => setIsTrainingModalOpen(true)}
                />
            )}

            {/* Info Modal */}
            {infoBuildingId && (
                <InfoModal
                    building={buildings.find(b => b.id === infoBuildingId)!}
                    onClose={() => setInfoBuildingId(null)}
                    units={getUnitsForBuilding(infoBuildingId)}
                    onRemoveUnit={removeUnit}
                />
            )}

            {/* Training Modal */}
            <TrainingModal
                isOpen={isTrainingModalOpen}
                onClose={() => setIsTrainingModalOpen(false)}
                onTrain={(type) => addToQueue(type)}
                onCancel={cancelTraining}
                queue={trainingQueue}
                totalCapacity={getTotalCapacity()}
                usedCapacity={getTotalUsedCapacity()}
            />

            {/* Victory Modal */}
            <VictoryModal
                isOpen={showVictoryModal}
                onReturnHome={handleReturnHome}
                baseDestroyed={true}
            />

            {movingBuildingId && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-auto bg-slate-900/90 flex gap-4 items-center p-3 rounded-xl border border-red-500 shadow-2xl z-[5000]">
                    <p className="m-0 text-white font-bold text-sm font-rajdhani">Moving Building...</p>
                    <button
                        onClick={() => {
                            setMovingBuildingId(null);
                            setSelectedBuildingId(null);
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white border-0 px-4 py-1.5 rounded-lg cursor-pointer font-bold text-xs transition-colors shadow-md font-orbitron"
                    >
                        CANCEL
                    </button>
                </div>
            )}
        </div>
    );
};

import { useState, useCallback, useEffect } from 'react';
import type { BuildingData } from './useBuildingSystem';

export type UnitType = 'Barbarian' | 'Archer';

export interface UnitConfig {
    size: number;
    trainingTime: number; // in seconds
    color: string;
    speed: number; // tiles per second
    maxHp: number;
}

export const UNIT_TYPES: Record<UnitType, UnitConfig> = {
    Barbarian: {
        size: 1,
        trainingTime: 3,
        color: '#e74c3c',
        speed: 4,
        maxHp: 100
    },
    Archer: {
        size: 2,
        trainingTime: 5,
        color: '#f1c40f',
        speed: 5,
        maxHp: 60
    }
};

export interface UnitData {
    id: string;
    type: UnitType;
    homeBuildingId: string;
    hp: number;
    maxHp: number;
}

export interface QueuedUnit {
    id: string;
    type: UnitType;
    totalTime: number;
    remainingTime: number;
}

export interface WalkingUnit {
    id: string;
    type: UnitType;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    progress: number; // 0 to 1
    targetBuildingId: string | null; // Nullable for deployment
    state: 'WALK' | 'ATTACK' | 'IDLE';
    lastAttackTime?: number;
    hp: number;
    maxHp: number;
}

const TROOP_LIMIT_PER_CAMP = 10;
const UNIT_SAVE_KEY = 'clash-clone-units';

export function useUnitSystem(buildings: BuildingData[]) {
    // ACTIVE UNITS (Stationed)
    const [units, setUnits] = useState<UnitData[]>(() => {
        const saved = localStorage.getItem(UNIT_SAVE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Deduplicate by ID immediately on load AND backfill stats
                const unique = Array.from(new Map(parsed.map((item: any) => [item.id, item])).values());
                return unique.map((u: any) => ({
                    ...u,
                    hp: u.hp ?? UNIT_TYPES[u.type as UnitType]?.maxHp ?? 10,
                    maxHp: u.maxHp ?? UNIT_TYPES[u.type as UnitType]?.maxHp ?? 10
                })) as UnitData[];
            } catch (e) {
                console.error("Failed to parse unit save data", e);
            }
        }
        return [];
    });

    // WALKING UNITS (Animating)
    const [walkingUnits, setWalkingUnits] = useState<WalkingUnit[]>([]);

    // TRAINING QUEUE
    const [trainingQueue, setTrainingQueue] = useState<QueuedUnit[]>([]);

    useEffect(() => {
        localStorage.setItem(UNIT_SAVE_KEY, JSON.stringify(units));
    }, [units]);

    // Clean up units if building removed
    useEffect(() => {
        setUnits(prev => prev.filter(u => buildings.some(b => b.id === u.homeBuildingId)));
    }, [buildings]);

    // --- Capacity Logic ---
    const getTotalCapacity = useCallback(() => {
        const armyCamps = buildings.filter(b => b.type === 'ArmyCamp');
        return armyCamps.length * TROOP_LIMIT_PER_CAMP;
    }, [buildings]);

    // Total used capacity including queued AND walking
    const getTotalUsedCapacity = useCallback(() => {
        const activeSize = units.reduce((total, unit) => total + UNIT_TYPES[unit.type].size, 0);
        const queuedSize = trainingQueue.reduce((total, item) => total + UNIT_TYPES[item.type].size, 0);
        const walkingSize = walkingUnits.reduce((total, item) => total + UNIT_TYPES[item.type].size, 0);
        return activeSize + queuedSize + walkingSize;
    }, [units, trainingQueue, walkingUnits]);

    // --- Training Loop ---
    useEffect(() => {
        if (trainingQueue.length === 0) return;

        const interval = setInterval(() => {
            setTrainingQueue(prev => {
                if (prev.length === 0) return [];

                const current = { ...prev[0] };
                current.remainingTime -= 1; // 1 second tick

                if (current.remainingTime <= 0) {
                    return [{ ...current, isFinished: true } as any, ...prev.slice(1)];
                }

                return [current, ...prev.slice(1)];
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [trainingQueue.length]);

    // Process finished units -> Spawn Walker
    useEffect(() => {
        const finishedUnit = trainingQueue.find((u: any) => u.isFinished);
        if (finishedUnit) {
            // 1. Find a Barracks (Source)
            const barracks = buildings.filter(b => b.type === 'Barracks');
            const sourceBuilding = barracks.length > 0 ? barracks[0] : buildings.find(b => b.type === 'TownHall'); // Fallback

            // 2. Find an Army Camp (Target)
            const armyCamps = buildings.filter(b => b.type === 'ArmyCamp');
            const unitSize = UNIT_TYPES[finishedUnit.type].size;

            let targetCampId: string | null = null;

            // Simple balancing: Find first camp with space
            // NOTE: We need to account for INCOMING walkers too!
            // But for simplicity, we checked GLOBAL capacity at queue time.
            // We just need a valid physical target.
            for (const camp of armyCamps) {
                const campUnits = units.filter(u => u.homeBuildingId === camp.id);
                const incomingUnits = walkingUnits.filter(u => u.targetBuildingId === camp.id);

                const currentSize = campUnits.reduce((sum, u) => sum + UNIT_TYPES[u.type].size, 0);
                const incomingSize = incomingUnits.reduce((sum, u) => sum + UNIT_TYPES[u.type].size, 0);

                if (currentSize + incomingSize + unitSize <= TROOP_LIMIT_PER_CAMP) {
                    targetCampId = camp.id;
                    break;
                }
            }

            // If no valid camp found (maybe deleted?), just fallback to first camp or dont spawn
            if (!targetCampId && armyCamps.length > 0) targetCampId = armyCamps[0].id;

            if (sourceBuilding && targetCampId) {
                const targetCamp = buildings.find(b => b.id === targetCampId)!;

                // Create Walking Unit
                const newWalker: WalkingUnit = {
                    id: finishedUnit.id,
                    type: finishedUnit.type,
                    startX: sourceBuilding.x + sourceBuilding.width / 2,
                    startY: sourceBuilding.y + sourceBuilding.height / 2,
                    endX: targetCamp.x + targetCamp.width / 2,
                    endY: targetCamp.y + targetCamp.height / 2,
                    progress: 0,
                    targetBuildingId: targetCampId,
                    state: 'WALK',
                    hp: UNIT_TYPES[finishedUnit.type].maxHp,
                    maxHp: UNIT_TYPES[finishedUnit.type].maxHp
                };

                setWalkingUnits(prev => [...prev, newWalker]);
            } else {
                // Edge case: No buildings? Just add directly if possible or discard
                // For now, if no camp, we discard (but capacity check should prevent this unless deleted mid-train)
            }

            // Remove from queue
            setTrainingQueue(prev => prev.slice(1));
        }
    }, [trainingQueue, buildings, units, walkingUnits]);

    // --- Animation Loop ---
    useEffect(() => {
        if (walkingUnits.length === 0) return;

        const frameRate = 30;
        const interval = setInterval(() => {
            setWalkingUnits(prev => {
                const next: WalkingUnit[] = [];
                const arrivedHome: WalkingUnit[] = [];

                prev.forEach(u => {
                    // Deployed/attacking units are managed by combat AI, not this loop
                    if (u.state === 'IDLE' || u.state === 'ATTACK') {
                        next.push(u);
                        return;
                    }

                    // Distance calculation
                    const dx = u.endX - u.startX;
                    const dy = u.endY - u.startY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 0.1) {
                        // Deployed unit arrived at target = switch to ATTACK
                        if (u.id.startsWith('deployed-')) {
                            next.push({ ...u, state: 'ATTACK', progress: 1 });
                        } else {
                            arrivedHome.push(u);
                        }
                        return;
                    }

                    const speed = UNIT_TYPES[u.type].speed;
                    const step = speed / frameRate;
                    const percentStep = step / dist;
                    const newProgress = u.progress + percentStep;

                    if (newProgress >= 1) {
                        // Deployed unit arrived at target = switch to ATTACK
                        if (u.id.startsWith('deployed-')) {
                            next.push({ ...u, state: 'ATTACK', progress: 1 });
                        } else {
                            arrivedHome.push(u);
                        }
                    } else {
                        next.push({ ...u, progress: newProgress });
                    }
                });

                // Handle home arrivals only (trained units going to army camps)
                if (arrivedHome.length > 0) {
                    setUnits(currentUnits => {
                        const newUnits = arrivedHome
                            .filter(walker => walker.targetBuildingId !== null)
                            .map(walker => ({
                                id: walker.id,
                                type: walker.type,
                                homeBuildingId: walker.targetBuildingId!,
                                hp: walker.hp,
                                maxHp: walker.maxHp
                            }))
                            .filter(newUnit => !currentUnits.some(existing => existing.id === newUnit.id));

                        if (newUnits.length === 0) return currentUnits;
                        return [...currentUnits, ...newUnits];
                    });
                }

                return next;
            });
        }, 1000 / frameRate);

        return () => clearInterval(interval);
    }, [walkingUnits.length]);


    // --- Actions ---
    const addToQueue = useCallback((type: UnitType) => {
        const config = UNIT_TYPES[type];
        const totalCap = getTotalCapacity();
        const usedCap = getTotalUsedCapacity();

        if (usedCap + config.size > totalCap) {
            return false;
        }

        const newQueueItem: QueuedUnit = {
            id: `${type}-${Date.now()}-${Math.random()}`,
            type,
            totalTime: config.trainingTime,
            remainingTime: config.trainingTime
        };

        setTrainingQueue(prev => [...prev, newQueueItem]);
        return true;
    }, [getTotalCapacity, getTotalUsedCapacity]);

    const getUnitsForBuilding = useCallback((buildingId: string) => {
        return units.filter(u => u.homeBuildingId === buildingId);
    }, [units]);

    const cancelTraining = useCallback((id: string) => {
        setTrainingQueue(prev => prev.filter(u => u.id !== id));
    }, []);

    const removeUnit = useCallback((unitId: string) => {
        setUnits(prev => prev.filter(u => u.id !== unitId));
    }, []);

    const deployUnit = useCallback((type: UnitType, x: number, y: number) => {
        const config = UNIT_TYPES[type];
        const newWalker: WalkingUnit = {
            id: `deployed-${Date.now()}-${Math.random()}`,
            type,
            startX: x,
            startY: y,
            endX: x, // Initially stationary until AI picks target
            endY: y,
            progress: 0,
            targetBuildingId: null,
            state: 'IDLE',
            hp: config.maxHp,
            maxHp: config.maxHp
        };
        setWalkingUnits(prev => [...prev, newWalker]);
    }, []);

    const clearWalkingUnits = useCallback(() => {
        setWalkingUnits([]);
    }, []);


    return {
        units,
        walkingUnits,
        trainingQueue,
        addToQueue,
        cancelTraining,
        removeUnit,
        getUnitsForBuilding,
        getTotalCapacity,
        getTotalUsedCapacity,
        deployUnit,
        clearWalkingUnits,
        setWalkingUnits,
    };
}

import { useState, useEffect, useRef } from 'react';
import type { BuildingData } from './useBuildingSystem';
import type { WalkingUnit } from './useUnitSystem';
import type { ProjectileData } from '../components/Projectile';

const CANNON_RANGE = 7;
const FIRE_RATE = 1500; // ms
const PROJECTILE_SPEED = 3; // tiles per second
const ATTACK_DAMAGE = 20;
const ATTACK_COOLDOWN = 1000; // ms
const CANNON_DAMAGE = 30;

export function useCombatSystem(
    buildings: BuildingData[],
    walkingUnits: WalkingUnit[],
    damageBuilding: (id: string, amount: number) => void,
    setWalkingUnits: React.Dispatch<React.SetStateAction<WalkingUnit[]>>,
    gameState: 'HOME' | 'ATTACK'
) {
    const [projectiles, setProjectiles] = useState<ProjectileData[]>([]);
    const lastFireTime = useRef<Record<string, number>>({});

    // Use refs to avoid stale closures in intervals
    const buildingsRef = useRef(buildings);
    const walkingUnitsRef = useRef(walkingUnits);
    const damageBuildingRef = useRef(damageBuilding);
    const gameStateRef = useRef(gameState);

    useEffect(() => { buildingsRef.current = buildings; }, [buildings]);
    useEffect(() => { walkingUnitsRef.current = walkingUnits; }, [walkingUnits]);
    useEffect(() => { damageBuildingRef.current = damageBuilding; }, [damageBuilding]);
    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

    // --- Unit AI Loop (Attack Logic) ---
    // Runs on a stable interval, reads from refs
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const currentBuildings = buildingsRef.current;

            if (currentBuildings.length === 0) return;

            setWalkingUnits(prev => {
                let changed = false;
                const updated = prev.map(unit => {
                    // Only process deployed units
                    if (!unit.id.startsWith('deployed-')) return unit;

                    // Check if current target still exists
                    const currentTarget = unit.targetBuildingId
                        ? currentBuildings.find(b => b.id === unit.targetBuildingId)
                        : null;

                    // Current position
                    const curX = unit.startX + (unit.endX - unit.startX) * unit.progress;
                    const curY = unit.startY + (unit.endY - unit.startY) * unit.progress;

                    // IDLE or target destroyed → find new target
                    if (unit.state === 'IDLE' || (!currentTarget && unit.state !== 'WALK')) {
                        let minDist = Infinity;
                        let nearestBuilding: BuildingData | null = null;

                        currentBuildings.forEach(b => {
                            const bx = b.x + b.width / 2;
                            const by = b.y + b.height / 2;
                            const d = Math.sqrt((curX - bx) ** 2 + (curY - by) ** 2);
                            if (d < minDist) {
                                minDist = d;
                                nearestBuilding = b;
                            }
                        });

                        if (nearestBuilding) {
                            const nb = nearestBuilding as BuildingData;
                            const centerX = nb.x + nb.width / 2;
                            const centerY = nb.y + nb.height / 2;

                            // Spread units around the building in a circle
                            // Use unit id hash for consistent angle per unit
                            const hash = unit.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
                            const angle = (hash % 8) * (Math.PI / 4); // 8 positions around
                            const spreadRadius = 1.2; // tiles away from center
                            const offsetX = Math.cos(angle) * spreadRadius;
                            const offsetY = Math.sin(angle) * spreadRadius;

                            changed = true;
                            return {
                                ...unit,
                                state: 'WALK' as const,
                                targetBuildingId: nb.id,
                                startX: curX,
                                startY: curY,
                                endX: centerX + offsetX,
                                endY: centerY + offsetY,
                                progress: 0
                            };
                        }
                        return unit;
                    }

                    // ATTACK state - deal damage
                    if (unit.state === 'ATTACK' && currentTarget) {
                        if (now - (unit.lastAttackTime || 0) > ATTACK_COOLDOWN) {
                            damageBuildingRef.current(currentTarget.id, ATTACK_DAMAGE);
                            changed = true;
                            return { ...unit, lastAttackTime: now };
                        }
                        return unit;
                    }

                    // ATTACK state but target gone → go IDLE to retarget
                    if (unit.state === 'ATTACK' && !currentTarget) {
                        changed = true;
                        return { ...unit, state: 'IDLE' as const, targetBuildingId: null };
                    }

                    // WALK state - check if target still exists (destroyed while walking)
                    if (unit.state === 'WALK' && !currentTarget && unit.targetBuildingId) {
                        changed = true;
                        return { ...unit, state: 'IDLE' as const, targetBuildingId: null };
                    }

                    return unit;
                });

                return changed ? updated : prev;
            });
        }, 150); // AI tick every 150ms

        return () => clearInterval(interval);
    }, [setWalkingUnits]);


    // --- Cannon Firing Loop (Defense) ---
    // Only fires during ATTACK mode, only targets deployed units
    useEffect(() => {
        const interval = setInterval(() => {
            // Only fire cannons during attack mode
            if (gameStateRef.current !== 'ATTACK') return;

            const now = Date.now();
            const currentBuildings = buildingsRef.current;
            const currentUnits = walkingUnitsRef.current;
            // Only target deployed attacker units
            const deployedUnits = currentUnits.filter(u => u.id.startsWith('deployed-'));
            const cannons = currentBuildings.filter(b => b.type === 'Cannon');
            const newProjectiles: ProjectileData[] = [];

            cannons.forEach(cannon => {
                if (now - (lastFireTime.current[cannon.id] || 0) < FIRE_RATE) return;

                const cx = cannon.x + cannon.width / 2;
                const cy = cannon.y + cannon.height / 2;

                const target = deployedUnits.find(unit => {
                    const ux = unit.startX + (unit.endX - unit.startX) * unit.progress;
                    const uy = unit.startY + (unit.endY - unit.startY) * unit.progress;
                    const dist = Math.sqrt((cx - ux) ** 2 + (cy - uy) ** 2);
                    return dist <= CANNON_RANGE;
                });

                if (target) {
                    lastFireTime.current[cannon.id] = now;
                    const ux = target.startX + (target.endX - target.startX) * target.progress;
                    const uy = target.startY + (target.endY - target.startY) * target.progress;

                    newProjectiles.push({
                        id: `proj-${Date.now()}-${Math.random()}`,
                        startX: cx,
                        startY: cy,
                        targetX: ux,
                        targetY: uy,
                        progress: 0,
                        targetUnitId: target.id
                    });
                }
            });

            if (newProjectiles.length > 0) {
                setProjectiles(prev => [...prev, ...newProjectiles]);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    // --- Projectile Animation Loop (includes damage on hit) ---
    useEffect(() => {
        if (projectiles.length === 0) return;

        const frameRate = 30;
        const interval = setInterval(() => {
            setProjectiles(prev => {
                const next: ProjectileData[] = [];
                const hitUnitIds: string[] = [];

                prev.forEach(p => {
                    const dx = p.targetX - p.startX;
                    const dy = p.targetY - p.startY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const speed = PROJECTILE_SPEED * 2;
                    const step = speed / frameRate;
                    const percentStep = step / (dist || 1);
                    const newProgress = p.progress + percentStep;

                    if (newProgress < 1) {
                        next.push({ ...p, progress: newProgress });
                    } else {
                        // HIT! Apply damage to target unit
                        if (p.targetUnitId) {
                            hitUnitIds.push(p.targetUnitId);
                        }
                    }
                });

                // Apply damage to hit units and remove dead ones
                if (hitUnitIds.length > 0) {
                    setWalkingUnits(prevUnits => {
                        return prevUnits.map(u => {
                            if (hitUnitIds.includes(u.id)) {
                                return { ...u, hp: u.hp - CANNON_DAMAGE };
                            }
                            return u;
                        }).filter(u => u.hp > 0); // Remove dead troops
                    });
                }

                return next;
            });
        }, 1000 / frameRate);

        return () => clearInterval(interval);
    }, [projectiles.length, setWalkingUnits]);

    return { projectiles };
}

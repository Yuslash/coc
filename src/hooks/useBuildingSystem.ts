
import { useState, useCallback, useEffect } from 'react';

import initialBuildings from '../db/initial_save.json';


// Define the type for the JSON data structure
type BuildingConfig = {
    width: number;
    height: number;
    color: string;
    maxCount: number;
    maxHp: number;
    texture?: {
        src: string;
        width: number;
        height: number;
        offsetX: number;
        offsetY: number;
    };
};

// Use the JSON data directly
export const BUILDINGS: Record<string, BuildingConfig> = {
    TownHall: {
        width: 2,
        height: 2,
        color: '#3498db',
        maxCount: 1,
        maxHp: 1000,
        texture: {
            src: '/town_hall.png',
            width: 200,
            height: 200,
            offsetX: -100,
            offsetY: -85 // Adjusted based on user feedback
        }
    },
    Barracks: {
        width: 2,
        height: 2,
        color: '#e67e22',
        maxCount: 1,
        maxHp: 500,
        texture: {
            src: '/grasslessbarracks.png',
            width: 200,
            height: 200,
            offsetX: -100,
            offsetY: -68.98 // Adjusted based on user feedback
        }
    },
    ArmyCamp: {
        width: 2, height: 2, color: '#9b59b6', maxCount: 4, maxHp: 400
        , texture: {
            src: '/armycamp.png',
            width: 200,
            height: 200,
            offsetX: -100,
            offsetY: -68.98 // Adjusted based on user feedback
        }
    },
    Cannon: {
        width: 2, height: 2, color: '#2c3e50', maxCount: 3, maxHp: 800,
        texture: {
            src: '/cannon.png',
            width: 155,
            height: 155,
            offsetX: -75,
            offsetY: -55 // Adjusted to sit better on the tile
        }
    },
};

export type BuildingType = keyof typeof BUILDINGS;

export interface BuildingData {
    id: string;
    type: BuildingType;
    x: number;
    y: number;
    width: number;
    height: number;
    hp: number;
    maxHp: number;
}

const GRID_SIZE = 20;

// Local Storage Key
const SAVE_KEY = 'clash-clone-save';

export function useBuildingSystem() {
    // Initialize with data from LocalStorage or JSON
    const [buildings, setBuildings] = useState<BuildingData[]>(() => {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Backfill missing HP stats for existing saves
                return parsed.map((b: any) => ({
                    ...b,
                    hp: b.hp ?? BUILDINGS[b.type as BuildingType]?.maxHp ?? 100, // Default to maxHp
                    maxHp: b.maxHp ?? BUILDINGS[b.type as BuildingType]?.maxHp ?? 100
                }));
            } catch (e) {
                console.error("Failed to parse save data", e);
            }
        }
        // Initial load also needs backfilling if JSON is old
        return (initialBuildings as any[]).map(b => ({
            ...b,
            hp: BUILDINGS[b.type as BuildingType]?.maxHp ?? 100,
            maxHp: BUILDINGS[b.type as BuildingType]?.maxHp ?? 100
        }));
    });

    // Save to LocalStorage whenever buildings change
    useEffect(() => {
        localStorage.setItem(SAVE_KEY, JSON.stringify(buildings));
    }, [buildings]);

    const checkCollision = useCallback((x: number, y: number, width: number, height: number, excludeId?: string) => {
        // Check grid bounds
        if (x < 0 || y < 0 || x + width > GRID_SIZE || y + height > GRID_SIZE) {
            return true;
        }

        // Check existing buildings
        for (const b of buildings) {
            if (excludeId && b.id === excludeId) continue;

            // Simple AABB collision
            if (
                x < b.x + b.width &&
                x + width > b.x &&
                y < b.y + b.height &&
                y + height > b.y
            ) {
                return true;
            }
        }
        return false;
    }, [buildings]);

    const placeBuilding = useCallback((type: BuildingType, x: number, y: number) => {
        const config = BUILDINGS[type];
        if (!config) return false;

        const { width, height, maxCount } = config;

        // Check Limit
        const currentCount = buildings.filter(b => b.type === type).length;
        if (currentCount >= maxCount) {
            console.warn(`Cannot place ${type} - Limit reached (${maxCount})`);
            return false;
        }

        if (checkCollision(x, y, width, height)) {
            console.warn("Cannot place building here - collision detected");
            return false; // Failed to place
        }

        const newBuilding: BuildingData = {
            id: `${type}-${Date.now()}`,
            type,
            x,
            y,
            width,
            height,
            hp: config.maxHp,
            maxHp: config.maxHp
        };

        setBuildings(prev => [...prev, newBuilding]);
        return true;
    }, [buildings, checkCollision]);

    const moveBuilding = useCallback((id: string, x: number, y: number) => {
        const building = buildings.find(b => b.id === id);
        if (!building) return false;

        if (checkCollision(x, y, building.width, building.height, id)) {
            console.warn("Cannot move building here - collision detected");
            return false;
        }

        setBuildings(prev => prev.map(b => b.id === id ? { ...b, x, y } : b));
        return true;
    }, [buildings, checkCollision]);

    const loadLevel = useCallback((newBuildings: BuildingData[]) => {
        setBuildings(newBuildings);
    }, []);

    const damageBuilding = useCallback((id: string, amount: number) => {
        setBuildings(prev => prev.map(b => {
            if (b.id !== id) return b;
            const newHp = Math.max(0, b.hp - amount);
            return { ...b, hp: newHp };
        }).filter(b => b.hp > 0)); // Remove if destroyed
    }, []);

    return { buildings, placeBuilding, checkCollision, moveBuilding, loadLevel, damageBuilding };
}

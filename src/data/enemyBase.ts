import type { BuildingData } from '../hooks/useBuildingSystem';
import { BUILDINGS } from '../hooks/useBuildingSystem';

export const TEST_ENEMY_BASE: BuildingData[] = [
    {
        id: 'enemy-townhall',
        type: 'TownHall',
        x: 10,
        y: 10,
        width: 2,
        height: 2,
        hp: BUILDINGS.TownHall.maxHp,
        maxHp: BUILDINGS.TownHall.maxHp
    },
    {
        id: 'enemy-barracks',
        type: 'Barracks',
        x: 8,
        y: 12,
        width: 2,
        height: 2,
        hp: BUILDINGS.Barracks.maxHp,
        maxHp: BUILDINGS.Barracks.maxHp
    },
    {
        id: 'enemy-camp',
        type: 'ArmyCamp',
        x: 12,
        y: 8,
        width: 2,
        height: 2,
        hp: BUILDINGS.ArmyCamp.maxHp,
        maxHp: BUILDINGS.ArmyCamp.maxHp
    },
    {
        id: 'enemy-cannon',
        type: 'Cannon',
        x: 14,
        y: 14,
        width: 2,
        height: 2,
        hp: BUILDINGS.Cannon.maxHp,
        maxHp: BUILDINGS.Cannon.maxHp
    }
];

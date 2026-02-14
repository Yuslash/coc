import React, { useState } from 'react';
import { BUILDINGS } from '../hooks/useBuildingSystem';
import type { BuildingType } from '../hooks/useBuildingSystem';
import { Store, X, Castle, Swords, Pickaxe, Tent, Shield, Hammer, Lock } from 'lucide-react';

interface BuildingMenuProps {
    onSelectBuilding: (type: BuildingType) => void;
    selectedType: BuildingType | null;
    existingBuildings: { type: BuildingType }[];
}

const BuildingIcons: Record<string, React.ElementType> = {
    TownHall: Castle,
    Barracks: Swords,
    GoldMine: Pickaxe,
    ArmyCamp: Tent,
    Wall: Shield
};

export const BuildingMenu: React.FC<BuildingMenuProps> = ({ onSelectBuilding, selectedType, existingBuildings }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!isExpanded) {
        return (
            <div
                className="fixed bottom-6 right-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 p-4 pr-6 rounded-full z-[5000] cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-3 border-4 border-amber-500/50 hover:scale-105 transition-all group animate-in slide-in-from-bottom-10 hover:-rotate-1 hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] backdrop-blur-sm"
                onClick={() => setIsExpanded(true)}
            >
                <div className="bg-amber-900/20 p-2 rounded-full">
                    <Hammer className="w-6 h-6 text-amber-100 group-hover:rotate-12 transition-transform" />
                </div>
                <span className="font-orbitron font-bold text-white text-lg tracking-widest text-shadow-sm">SHOP</span>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 bg-slate-900/80 p-6 rounded-[2rem] z-[5000] w-[600px] max-w-[calc(100vw-3rem)] border border-white/10 shadow-2xl animate-in slide-in-from-bottom-10 backdrop-blur-xl ring-1 ring-white/5">
            <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                <div>
                    <h3 className="m-0 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 font-orbitron font-bold text-2xl uppercase tracking-widest drop-shadow-sm flex items-center gap-3">
                        <Store className="w-6 h-6 text-amber-400" />
                        Construction
                    </h3>
                    <p className="text-slate-400 font-rajdhani text-sm mt-1">Select a building to place in your village</p>
                </div>
                <button
                    className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full p-2 transition-all border border-white/5 hover:rotate-90 duration-300"
                    onClick={() => setIsExpanded(false)}
                    aria-label="Close shop"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex flex-col items-center">
                <div className="flex gap-4 overflow-x-auto pb-4 w-full px-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {(Object.keys(BUILDINGS) as BuildingType[]).map((type) => {
                        const config = BUILDINGS[type];
                        const count = existingBuildings.filter(b => b.type === type).length;
                        const isMaxed = count >= config.maxCount;
                        const isSelected = selectedType === type;
                        const Icon = BuildingIcons[type] || Hammer;

                        return (
                            <div
                                key={type}
                                className={`
                                    relative flex flex-col items-center justify-center min-w-[110px] h-[130px] rounded-2xl cursor-pointer transition-all border overflow-hidden group font-rajdhani
                                    ${isSelected
                                        ? 'bg-emerald-900/40 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105 z-10'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-xl'
                                    }
                                    ${isMaxed ? 'opacity-60 grayscale cursor-not-allowed hover:transform-none' : ''}
                                `}
                                onClick={() => !isMaxed && onSelectBuilding(type)}
                            >
                                {isMaxed && (
                                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                                        <Lock className="w-6 h-6 text-slate-400" />
                                    </div>
                                )}

                                <div className={`p-3.5 rounded-xl mb-3 ${isSelected ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30' : 'bg-slate-800/50 text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10'} transition-colors relative z-10`}>
                                    <Icon className="w-8 h-8 drop-shadow-md" />
                                </div>

                                <span className={`text-sm font-bold tracking-wide uppercase ${isSelected ? 'text-emerald-300' : 'text-slate-300 group-hover:text-emerald-200'}`}>{type}</span>

                                <div className={`absolute top-2 right-2 text-[0.65rem] font-bold px-2 py-0.5 rounded-md border ${isMaxed ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-black/40 text-slate-400 border-white/5'}`}>
                                    {count}/{config.maxCount}
                                </div>

                                {isSelected && <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none"></div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

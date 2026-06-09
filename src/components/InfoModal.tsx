import React, { useMemo } from 'react';
import type { BuildingData } from '../hooks/useBuildingSystem';
import { BUILDINGS } from '../hooks/useBuildingSystem';
import type { UnitData, UnitType } from '../hooks/useUnitSystem';
import { UNIT_TYPES, UNIT_AVATARS } from '../hooks/useUnitSystem';
import { X, Heart, Ruler, Castle, Swords, Pickaxe, Tent, Shield, Users, Hammer, ArrowUpCircle } from 'lucide-react';

interface InfoModalProps {
    building: BuildingData;
    onClose: () => void;
    units?: UnitData[];
    onRemoveUnit?: (id: string) => void;
}

const BuildingIcons: Record<string, React.ElementType> = {
    TownHall: Castle,
    Barracks: Swords,
    GoldMine: Pickaxe,
    ArmyCamp: Tent,
    Wall: Shield
};

export const InfoModal: React.FC<InfoModalProps> = ({ building, onClose, units = [], onRemoveUnit }) => {
    const config = BUILDINGS[building.type];
    const Icon = BuildingIcons[building.type] || Hammer;

    // Group units by type
    const groupedUnits = useMemo(() => {
        const groups: Partial<Record<UnitType, UnitData[]>> = {};
        units.forEach(unit => {
            if (!groups[unit.type]) {
                groups[unit.type] = [];
            }
            groups[unit.type]!.push(unit);
        });
        return groups;
    }, [units]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000] p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div
                className="bg-slate-900/80 backdrop-blur-xl w-[900px] max-w-[95vw] h-[500px] max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10 ring-1 ring-white/5 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Compact */}
                <div className="bg-white/5 px-6 py-4 flex justify-between items-center border-b border-white/10 shrink-0">
                    <h2 className="text-xl font-orbitron font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 m-0 flex items-center gap-3 drop-shadow-sm">
                        <Icon className="w-6 h-6 text-amber-400" />
                        {building.type}
                    </h2>
                    <button
                        className="text-slate-400 hover:text-white transition-all hover:bg-white/10 rounded-full p-2 hover:rotate-90 duration-300"
                        onClick={onClose}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Main Content - Split View */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel: Visuals & Actions */}
                    <div className="w-[350px] bg-black/20 border-r border-white/10 p-6 flex flex-col items-center justify-between shrink-0">
                        <div className="w-full flex-1 flex flex-col items-center justify-center">
                            <div className="w-full aspect-square max-w-[200px] bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-full flex items-center justify-center mb-6 text-slate-500 border border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] group relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent opacity-60"></div>
                                <div className={`relative z-10 p-8 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.3)] ring-1 ring-white/10 backdrop-blur-sm ${building.type === 'TownHall' ? 'bg-blue-600/80 text-blue-100' : building.type === 'Barracks' ? 'bg-orange-600/80 text-orange-100' : 'bg-slate-700/80 text-slate-300'}`}>
                                    <Icon className="w-20 h-20 drop-shadow-md" />
                                </div>
                            </div>
                            <span className="font-rajdhani font-bold text-slate-400 bg-black/40 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm tracking-widest uppercase shadow-sm">
                                Level 1
                            </span>
                        </div>

                        <button
                            className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-orbitron font-bold py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 tracking-wide text-sm border-t border-white/20 mt-6"
                            onClick={() => alert("Upgrade coming soon!")}
                        >
                            <ArrowUpCircle className="w-5 h-5" />
                            UPGRADE
                        </button>
                    </div>

                    {/* Right Panel: Stats & Details */}
                    <div className="flex-1 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8 font-rajdhani">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                                <div className="bg-emerald-500/20 p-3 rounded-lg border border-emerald-500/20">
                                    <Heart className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold m-0 tracking-wider">Health</p>
                                    <p className="text-xl font-bold text-emerald-100 m-0 leading-none">1,000</p>
                                </div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                                <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/20">
                                    <Ruler className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold m-0 tracking-wider">Size</p>
                                    <p className="text-xl font-bold text-blue-100 m-0 leading-none">{config.width}x{config.height}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h3 className="text-xs font-orbitron font-bold text-slate-500 uppercase mb-3 tracking-wider flex items-center gap-2">
                                <Hammer className="w-3 h-3" />
                                Details
                            </h3>
                            <div className="font-rajdhani font-medium text-slate-300 text-base leading-relaxed bg-black/20 p-5 rounded-xl border border-white/5 italic relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <Icon className="w-24 h-24 rotate-12" />
                                </div>
                                <p className="m-0 relative z-10">
                                    {building.type === 'TownHall'
                                        ? "The heart of your village. Upgrade it to unlock new buildings and defenses."
                                        : building.type === 'Barracks'
                                            ? "Trains your troops to fight for your village."
                                            : "A standard building for your village infrastructure."}
                                </p>
                            </div>
                        </div>

                        {/* Troop List for Army Camp */}
                        {building.type === 'ArmyCamp' && units.length > 0 && (
                            <div>
                                <h3 className="text-xs font-orbitron font-bold text-slate-500 uppercase mb-3 flex items-center gap-2 tracking-wider">
                                    <Users className="w-4 h-4" />
                                    Stationed Troops ({units.length})
                                </h3>

                                {/* Grid Layout for Troops */}
                                <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                                    {(Object.keys(groupedUnits) as UnitType[]).map(type => {
                                        const group = groupedUnits[type]!;
                                        const count = group.length;
                                        if (count === 0) return null;
                                        const unitConfig = UNIT_TYPES[type];

                                        return (
                                            <div
                                                key={type}
                                                className="font-rajdhani flex justify-between items-center bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all group relative overflow-hidden"
                                            >
                                                <div className="flex items-center gap-3 relative z-10">
                                                    <div
                                                        className="w-10 h-10 rounded-lg shadow-sm flex items-center justify-center text-[10px] ring-1 ring-white/10 relative overflow-hidden"
                                                    >
                                                        <img
                                                            src={UNIT_AVATARS[type]}
                                                            alt={type}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-slate-900 shadow-sm z-20">
                                                            x{count}
                                                        </span>
                                                    </div>
                                                    <span className="text-lg font-bold text-slate-200">{type}</span>
                                                </div>

                                                {onRemoveUnit && (
                                                    <button
                                                        className="w-8 h-8 flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100 active:scale-95"
                                                        onClick={() => onRemoveUnit(group[0].id)}
                                                        title="Dismiss One"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {/* Subtle gradient background based on unit color */}
                                                <div
                                                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                                                    style={{ background: `linear-gradient(to right, transparent, ${unitConfig.color})` }}
                                                ></div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

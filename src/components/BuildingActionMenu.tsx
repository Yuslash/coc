import React from 'react';
import type { BuildingType } from '../hooks/useBuildingSystem';
import { ArrowLeftRight, Info, Swords, X } from 'lucide-react';

interface BuildingActionMenuProps {
    selectedBuildingId: string | null;
    selectedBuildingType: BuildingType | null;
    onMove: () => void;
    onInfo: () => void;
    onClose: () => void;
    onTrain?: () => void;
}

export const BuildingActionMenu: React.FC<BuildingActionMenuProps> = ({ selectedBuildingId, selectedBuildingType, onMove, onInfo, onClose, onTrain }) => {
    if (!selectedBuildingId) return null;

    return (
        <div className="absolute bottom-[15vh] left-1/2 -translate-x-1/2 bg-slate-900/80 p-5 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center min-w-[280px] z-[6000] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8 duration-300 ring-1 ring-white/5">
            <h3 className="m-0 mb-5 text-sm font-orbitron font-bold text-amber-400 uppercase tracking-widest drop-shadow-sm flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-pulse"></span>
                {selectedBuildingType} Selected
            </h3>

            <div className="flex gap-4 w-full justify-center">
                <button
                    onClick={onMove}
                    className="flex-1 min-w-[80px] bg-gradient-to-b from-amber-500/20 to-amber-600/20 hover:from-amber-500 hover:to-amber-600 text-white font-rajdhani font-bold py-4 px-2 rounded-2xl border border-amber-500/30 hover:border-amber-400/50 shadow-lg shadow-amber-900/10 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:-translate-y-1 transition-all group flex flex-col items-center justify-center gap-2"
                >
                    <ArrowLeftRight className="w-6 h-6 text-amber-400 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                    <span className="text-[10px] tracking-widest text-amber-200 group-hover:text-amber-50 uppercase">Move</span>
                </button>

                <button
                    onClick={onInfo}
                    className="flex-1 min-w-[80px] bg-gradient-to-b from-purple-500/20 to-purple-600/20 hover:from-purple-500 hover:to-purple-600 text-white font-rajdhani font-bold py-4 px-2 rounded-2xl border border-purple-500/30 hover:border-purple-400/50 shadow-lg shadow-purple-900/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:-translate-y-1 transition-all group flex flex-col items-center justify-center gap-2"
                >
                    <Info className="w-6 h-6 text-purple-400 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                    <span className="text-[10px] tracking-widest text-purple-200 group-hover:text-purple-50 uppercase">Info</span>
                </button>

                {selectedBuildingType === 'Barracks' && (
                    <button
                        onClick={onTrain}
                        className="flex-1 min-w-[80px] bg-gradient-to-b from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500 hover:to-emerald-600 text-white font-rajdhani font-bold py-4 px-2 rounded-2xl border border-emerald-500/30 hover:border-emerald-400/50 shadow-lg shadow-emerald-900/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all group flex flex-col items-center justify-center gap-2"
                    >
                        <Swords className="w-6 h-6 text-emerald-400 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                        <span className="text-[10px] tracking-widest text-emerald-200 group-hover:text-emerald-50 uppercase">Train</span>
                    </button>
                )}
            </div>

            <button
                onClick={onClose}
                className="absolute -top-3 -right-3 bg-red-500/80 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 border-slate-900 shadow-lg cursor-pointer transition-all hover:scale-110 z-10 hover:rotate-90 duration-300 backdrop-blur-sm"
                aria-label="Close menu"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

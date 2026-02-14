import React from 'react';
import { UNIT_TYPES } from '../hooks/useUnitSystem';
import type { UnitType, QueuedUnit } from '../hooks/useUnitSystem';
import { X, Clock, Users, Zap, Hourglass } from 'lucide-react';

interface TrainingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTrain: (type: UnitType) => void;
    onCancel: (id: string) => void;
    queue: QueuedUnit[];
    totalCapacity: number;
    usedCapacity: number;
}

export const TrainingModal: React.FC<TrainingModalProps> = ({
    isOpen,
    onClose,
    onTrain,
    onCancel,
    queue,
    totalCapacity,
    usedCapacity
}) => {
    if (!isOpen) return null;

    // Calculate total remaining time
    const totalTimeRemaining = queue.reduce((sum, item) => sum + item.remainingTime, 0);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000] p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div
                className="bg-slate-900/80 backdrop-blur-xl w-[1000px] max-w-[95vw] h-[600px] max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10 ring-1 ring-white/5 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-white/5 px-6 py-4 flex justify-between items-center border-b border-white/10 shrink-0">
                    <h2 className="text-xl font-orbitron font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 m-0 drop-shadow-sm flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
                        Train Troops
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
                    {/* Left Panel: Unit Selection */}
                    <div className="flex-1 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 flex flex-col">

                        {/* Capacity Bar */}
                        <div className="mb-8 bg-black/20 p-5 rounded-2xl border border-white/5 shrink-0">
                            <div className="text-sm font-rajdhani font-bold text-slate-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                                <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Camp Capacity</span>
                                <span className="text-white text-lg">{usedCapacity} <span className="text-slate-500">/</span> {totalCapacity}</span>
                            </div>
                            <div className="w-full h-3 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className={`h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)] ${usedCapacity >= totalCapacity ? 'from-red-500 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''}`}
                                    style={{ width: `${Math.min(100, (usedCapacity / totalCapacity) * 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Unit Grid */}
                        <h3 className="text-xs font-orbitron font-bold text-slate-500 uppercase mb-4 tracking-wider">Available Units</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {(Object.keys(UNIT_TYPES) as UnitType[]).map((type) => {
                                const config = UNIT_TYPES[type];
                                const canAfford = usedCapacity + config.size <= totalCapacity;

                                return (
                                    <div
                                        key={type}
                                        className={`
                                            relative group overflow-hidden
                                            bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-4 transition-all cursor-pointer font-rajdhani
                                            ${!canAfford ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-white/10 hover:border-blue-400/50 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]'}
                                        `}
                                        onClick={() => canAfford && onTrain(type)}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>

                                        <div
                                            className="w-16 h-16 rounded-xl border border-white/20 shadow-lg flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300"
                                            style={{ backgroundColor: config.color, boxShadow: `0 0 15px ${config.color}60` }}
                                        >
                                            {/* Placeholder for unit icon */}
                                        </div>

                                        <div className="text-center relative z-10 w-full">
                                            <div className="font-bold text-lg text-slate-100 uppercase tracking-wide group-hover:text-blue-300 transition-colors">{type}</div>
                                            <div className="flex justify-center gap-2 mt-2">
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-black/40 rounded px-2 py-1 border border-white/5">
                                                    <Users className="w-3 h-3" /> {config.size}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-black/40 rounded px-2 py-1 border border-white/5">
                                                    <Clock className="w-3 h-3" /> {config.trainingTime}s
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Panel: Queue */}
                    <div className="w-[350px] bg-black/20 border-l border-white/10 flex flex-col shrink-0">
                        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="font-orbitron font-bold text-xs text-slate-300 uppercase m-0 flex items-center gap-2">
                                <Hourglass className="w-4 h-4 text-amber-400" />
                                Queue ({queue.length})
                            </h3>
                            {totalTimeRemaining > 0 && (
                                <span className="text-xs font-rajdhani font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 animate-pulse">
                                    {totalTimeRemaining}s
                                </span>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-700 space-y-2">
                            {queue.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                                    <Hourglass className="w-12 h-12 mb-3" />
                                    <p className="text-sm font-rajdhani italic">Training queue is empty...</p>
                                </div>
                            )}

                            {React.useMemo(() => {
                                const groups: { type: UnitType; count: number; totalTime: number; id: string; lastId: string; isTraining: boolean; remainingTime?: number }[] = [];
                                if (queue.length === 0) return groups;

                                let currentGroup: { type: UnitType; count: number; totalTime: number; id: string; lastId: string; isTraining: boolean; remainingTime?: number } = {
                                    type: queue[0].type,
                                    count: 1,
                                    totalTime: queue[0].totalTime,
                                    id: queue[0].id,
                                    lastId: queue[0].id,
                                    isTraining: true,
                                    remainingTime: queue[0].remainingTime
                                };

                                for (let i = 1; i < queue.length; i++) {
                                    const item = queue[i];
                                    if (item.type === currentGroup.type) {
                                        currentGroup.count++;
                                        currentGroup.lastId = item.id; // Update lastId to the most recently added
                                    } else {
                                        groups.push(currentGroup);
                                        currentGroup = {
                                            type: item.type,
                                            count: 1,
                                            totalTime: item.totalTime,
                                            id: item.id,
                                            lastId: item.id,
                                            isTraining: false
                                        };
                                    }
                                }
                                groups.push(currentGroup);
                                return groups;
                            }, [queue]).map((group, index) => (
                                <div
                                    key={group.id}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-xl relative overflow-hidden transition-all duration-300 border group
                                        ${group.isTraining ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}
                                    `}
                                >
                                    <div className="font-orbitron font-bold text-slate-500 text-xs w-5 text-center shrink-0 opacity-50">
                                        {group.count > 1 ? `${group.count}x` : (index + 1)}
                                    </div>

                                    <div
                                        className="w-10 h-10 rounded-lg shrink-0 z-10 border border-white/10 shadow-sm"
                                        style={{ backgroundColor: UNIT_TYPES[group.type].color }}
                                    ></div>

                                    <div className="flex-1 flex flex-col justify-center z-10 font-rajdhani min-w-0">
                                        <span className="font-bold text-slate-200 truncate">{group.type}</span>
                                        <span className={`text-xs font-bold ${group.isTraining ? 'text-amber-400' : 'text-slate-500'}`}>
                                            {group.isTraining ? 'Training...' : 'Queued'}
                                        </span>
                                    </div>

                                    <div className="shrink-0 z-10 flex items-center gap-3">
                                        <div className="font-rajdhani font-bold text-sm text-slate-400 w-12 text-right">
                                            {group.isTraining ? `${group.remainingTime}s` : `${group.totalTime * group.count}s`}
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCancel(group.lastId);
                                            }}
                                            className="w-6 h-6 rounded-full bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10 hover:border-red-400 z-20"
                                            title="Cancel Training"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {/* Progress Bar Background for Active Item */}
                                    {group.isTraining && group.remainingTime !== undefined && (
                                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black/20">
                                            <div
                                                className="h-full bg-amber-500 shadow-[0_0_5px_#f59e0b] transition-all duration-1000 ease-linear"
                                                style={{
                                                    width: `${((group.totalTime - group.remainingTime) / group.totalTime) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

import React, { useEffect, useState } from 'react';
import { Star, Home, Trophy, Coins } from 'lucide-react';

interface VictoryModalProps {
    isOpen: boolean;
    onReturnHome: () => void;
    baseDestroyed: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ isOpen, onReturnHome }) => {
    const [showStars, setShowStars] = useState([false, false, false]);

    useEffect(() => {
        if (isOpen) {
            // Sequence the star animations
            const timers = [
                setTimeout(() => setShowStars(prev => [true, prev[1], prev[2]]), 500),
                setTimeout(() => setShowStars(prev => [prev[0], true, prev[2]]), 1000),
                setTimeout(() => setShowStars(prev => [prev[0], prev[1], true]), 1500),
            ];
            return () => timers.forEach(t => clearTimeout(t));
        } else {
            setShowStars([false, false, false]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>

                <div
                    className="relative bg-slate-900 border border-amber-500/30 p-1 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.3)] w-[450px] overflow-hidden animate-in zoom-in-95 duration-500"
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url('${import.meta.env.BASE_URL}pattern.png')` }}></div>

                    {/* Content Container */}
                    <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-[20px] p-8 flex flex-col items-center">

                        {/* Title */}
                        <div className="mb-2">
                            <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-bounce" />
                        </div>

                        <h2 className="text-5xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 mb-2 uppercase tracking-widest drop-shadow-sm animate-in slide-in-from-bottom-4 duration-700">
                            Victory!
                        </h2>

                        <p className="text-slate-400 font-rajdhani text-lg mb-8 tracking-wide animate-in fade-in duration-1000 delay-300">
                            Enemy base destroyed
                        </p>

                        {/* Stars Container */}
                        <div className="flex justify-center gap-4 mb-8">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="relative">
                                    {/* Placeholder/Empty Star */}
                                    <Star className="w-12 h-12 text-slate-700 strok-slate-600" />

                                    {/* Fill Star Animation */}
                                    <div
                                        className={`absolute inset-0 transition-all duration-500 ${showStars[i] ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 rotate-[-180deg]'}`}
                                    >
                                        <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                                        {showStars[i] && (
                                            <div className="absolute inset-0 animate-ping opacity-75">
                                                <Star className="w-12 h-12 text-yellow-200 fill-yellow-200" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Loot Stats (Dummy Data) */}
                        <div className="w-full bg-black/20 rounded-xl p-4 mb-8 border border-white/5 animate-in slide-in-from-bottom-8 duration-700 delay-500">
                            <h3 className="text-xs uppercase font-bold text-slate-500 mb-3 tracking-widest text-center">Loot Stolen</h3>
                            <div className="flex justify-center gap-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                                        <Coins className="w-4 h-4 text-yellow-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-yellow-100">Gold</div>
                                        <div className="text-xs text-yellow-400/80 font-mono">+1,500</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center border border-fuchsia-500/30">
                                        <div className="w-3 h-3 bg-fuchsia-400 rounded-sm rotate-45"></div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-fuchsia-100">Elixir</div>
                                        <div className="text-xs text-fuchsia-400/80 font-mono">+1,200</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={onReturnHome}
                            className="group relative w-full overflow-hidden bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl text-lg font-orbitron transition-all shadow-[0_4px_0_#064e3b] active:shadow-none active:translate-y-[4px] flex items-center justify-center gap-3 animate-in slide-in-from-bottom-12 duration-700 delay-700"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                            <Home className="w-5 h-5" />
                            RETURN HOME
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

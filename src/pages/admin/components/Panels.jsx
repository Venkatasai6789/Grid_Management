import React, { useState } from 'react';

export const ControlPanel = ({ onNext, onAuto, onReset, isAutoRunning, canAdvance }) => {
    return (
        <div className="bg-[#0f1115] border border-white/5 rounded-xl p-5 h-full flex flex-col justify-center">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full border border-white/50"></span>
                Simulation Control
            </h3>

            <div className="flex items-center gap-3">
                <button
                    onClick={onNext}
                    disabled={!canAdvance}
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                    <span className="material-symbols-outlined text-lg">skip_next</span>
                    Next Hour
                </button>

                <button
                    onClick={onAuto}
                    className={`px-6 py-3 border border-white/10 rounded font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${isAutoRunning ? 'bg-red-500/10 text-red-500 border-red-500/50 animate-pulse' : 'hover:bg-white/5 text-gray-300'}`}>
                    <span className="material-symbols-outlined text-lg">{isAutoRunning ? 'pause' : 'refresh'}</span>
                    {isAutoRunning ? 'Stop' : 'Auto Run'}
                </button>

                <button
                    onClick={onReset}
                    className="px-4 py-3 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">restart_alt</span>
                    Reset
                </button>
            </div>
        </div>
    );
};

export const OverridePanel = ({ currentReward, currentPenalty, onOverride, canOverride }) => {
    const [reward, setReward] = useState(currentReward);
    const [penalty, setPenalty] = useState(currentPenalty);

    const handleSubmit = () => {
        onOverride(Number(reward), Number(penalty));
    };

    return (
        <div className="bg-[#0f1115] border border-white/5 rounded-xl p-5 h-full flex flex-col justify-center relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">tune</span>
                    Manual Override
                </h3>
                <span className="text-[9px] font-mono border border-red-900/50 text-red-800 bg-red-900/10 px-2 py-0.5 rounded">LVL 4 ACCESS REQ.</span>
            </div>

            <div className="flex items-end gap-4">
                <div className="flex-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Override Price</label>
                    <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">₹</span>
                        <input
                            type="number"
                            value={reward}
                            onChange={(e) => setReward(e.target.value)}
                            className="w-full bg-[#050607] border border-white/10 rounded px-3 py-2.5 pl-7 text-white font-mono text-lg focus:outline-none focus:border-red-500/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Threshold</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={penalty}
                            onChange={(e) => setPenalty(e.target.value)}
                            className="w-full bg-[#050607] border border-white/10 rounded px-3 py-2.5 text-white font-mono text-lg focus:outline-none focus:border-red-500/50 transition-colors"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!canOverride}
                    className="h-[46px] w-[46px] bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded flex items-center justify-center text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all active:scale-95">
                    <span className="material-symbols-outlined">send</span>
                </button>
            </div>
        </div>
    );
};

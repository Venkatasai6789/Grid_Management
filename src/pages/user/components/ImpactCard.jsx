import React from 'react';

const ImpactCard = ({ kwhSaved, co2Saved }) => {
    return (
        <div className="bg-[#1e1e1e] rounded-3xl p-6 relative overflow-hidden border border-white/5 h-full flex flex-col justify-between group">
            <div className="flex justify-between items-start z-10">
                <div className="w-12 h-12 rounded-2xl bg-google-green/20 flex items-center justify-center text-google-green">
                    <span className="material-symbols-outlined">eco</span>
                </div>
                <span className="text-xs font-bold text-google-green">-0.5 kW</span>
            </div>

            <div className="relative z-10 mt-4">
                <div className="text-sm font-bold text-slate-400">Impact Saved</div>
                <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black text-white tracking-tight">
                        {(typeof kwhSaved === 'number' ? kwhSaved : parseFloat(kwhSaved || 0)).toFixed(1)}
                    </span>
                    <span className="text-sm font-bold text-slate-500">kW</span>
                </div>
            </div>

            <div className="relative z-10 mt-6 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span className="material-symbols-outlined text-sm">forest</span>
                <span>
                    {(typeof co2Saved === 'number' ? co2Saved : parseFloat(co2Saved || 0)).toFixed(2)} Tons CO2 Avoided
                </span>
            </div>

            {/* Decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-google-green/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-google-green/20 transition-all"></div>
        </div>
    );
};

export default ImpactCard;

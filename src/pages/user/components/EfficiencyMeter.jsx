import React from 'react';

const EfficiencyMeter = ({ currentLoad, baseLoad }) => {
    // Calculate efficiency relative to "regional average" (mocked as baseLoad * 1.2)
    const regionalAvg = baseLoad * 1.2;
    const isEfficient = currentLoad < regionalAvg;
    const percentDiff = Math.abs(Math.round(((regionalAvg - currentLoad) / regionalAvg) * 100));

    return (
        <div className="bg-[#1e1e1e] rounded-3xl p-6 border border-white/5 h-full">
            <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-google-yellow text-sm">bar_chart</span>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Efficiency Meter</h3>
            </div>

            <div className="space-y-6">
                {/* Current Load Bar */}
                <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                        <span>Current Load</span>
                        <span className="text-white">{currentLoad.toFixed(0)} kW</span>
                    </div>
                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                        <div className="h-full bg-google-blue rounded-full" style={{ width: '70%' }}></div>
                    </div>
                </div>

                {/* Base Load Bar */}
                <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                        <span>Base Load</span>
                        <span className="text-white">{baseLoad.toFixed(0)} kW</span>
                    </div>
                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                        <div className="h-full bg-slate-600 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-xs font-mono text-slate-400 leading-relaxed">
                    Your efficiency is <span className={isEfficient ? 'text-google-green' : 'text-google-red'}>{percentDiff}% {isEfficient ? 'higher' : 'lower'}</span> than the regional average today.
                </p>
            </div>
        </div>
    );
};

export default EfficiencyMeter;

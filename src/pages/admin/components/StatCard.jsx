import React from 'react';
import { RefreshCcw, Zap, Wallet, AlertTriangle, CheckCircle } from 'lucide-react';

export const StatCard = ({ title, value, subtext, icon: Icon, trend, trendValue, color }) => {
    const getIconColor = () => {
        switch (color) {
            case 'green': return 'text-emerald-400';
            case 'yellow': return 'text-yellow-400';
            case 'blue': return 'text-blue-400';
            case 'red': return 'text-red-500';
            default: return 'text-white';
        }
    };

    const getBorderColor = () => {
        switch (color) {
            case 'green': return 'border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.1)]';
            case 'yellow': return 'border-yellow-500/30 shadow-[0_0_15px_rgba(250,204,21,0.1)]';
            case 'blue': return 'border-blue-500/30 shadow-[0_0_15px_rgba(96,165,250,0.1)]';
            case 'red': return 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
            default: return 'border-white/10';
        }
    };

    const getProgressColor = () => {
        switch (color) {
            case 'green': return 'bg-emerald-500';
            case 'yellow': return 'bg-yellow-500';
            case 'blue': return 'bg-blue-500';
            case 'red': return 'bg-red-500';
            default: return 'bg-white';
        }
    };

    return (
        <div className={`bg-[#0f1115] border ${getBorderColor()} rounded-xl p-5 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{title}</h3>
                </div>
                {Icon && <Icon className={`w-5 h-5 ${getIconColor()}`} />}
            </div>

            <div className="flex items-end gap-2 mt-1">
                <div className="text-3xl font-black text-white tracking-tight">{value}</div>
                {trend && (
                    <div className={`text-xs font-bold mb-1.5 ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trendValue}
                    </div>
                )}
            </div>

            {subtext && <div className={`text-[10px] font-bold uppercase mt-1 ${color === 'red' ? 'text-red-500' : 'text-gray-500'}`}>{subtext}</div>}

            {/* Progress Bar Decoration */}
            <div className="absolute bottom-4 left-5 right-5 h-1 bg-gray-800 rounded-full overflow-hidden mt-4">
                <div className={`h-full ${getProgressColor()} w-3/4 shadow-[0_0_10px_currentColor]`}></div>
            </div>
        </div>
    );
};

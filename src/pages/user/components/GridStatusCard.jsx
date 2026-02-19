import React from 'react';
import { formatHour } from '../../../engine/SimulationEngine';

const GridStatusCard = ({ currentHour, isPeak, currentLoad, hoursUntilPeak }) => {
    // Calculate capacity percentage (assuming 200kW max for visual scaling)
    const capacityPercent = Math.min(Math.round((currentLoad / 200) * 100), 100);

    // Determine status color
    const statusColor = isPeak ? 'text-google-red' : 'text-google-green';
    const barColor = isPeak
        ? 'bg-gradient-to-r from-google-red to-orange-500'
        : 'bg-gradient-to-r from-google-green to-emerald-400';

    return (
        <div className="bg-[#1e1e1e] rounded-3xl p-6 relative overflow-hidden border border-white/5 h-full flex flex-col justify-between">
            {/* Top Row: Alert & Time */}
            <div className="flex justify-between items-start">
                <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${isPeak ? 'bg-google-red/20 text-google-red animate-pulse' : 'bg-white/5 text-slate-400'}`}>
                    {isPeak ? '• Peak Hour Alert' : '• Grid Stable'}
                </div>
                <div className="text-xs font-mono text-slate-500">
                    LIVE SYSTEM CLOCK: {formatHour(currentHour)}:00
                </div>
            </div>

            {/* Middle: Load Value */}
            <div className="mt-6">
                <div className="text-sm font-bold text-slate-400 mb-1">Current Grid Load</div>
                <div className="flex items-baseline gap-2">
                    {(currentLoad || 0).toFixed(1)}
                    <span className="text-xl font-bold text-slate-500">kW</span>
                </div>
            </div>

            {/* Bottom: Capacity Bar */}
            <div className="mt-8">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                    <span>Capacity Usage</span>
                    <span className={statusColor}>{capacityPercent}% {isPeak ? '(Critical)' : '(Normal)'}</span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                        style={{ width: `${capacityPercent}%` }}
                    ></div>
                </div>
                <div className="mt-2 text-[10px] text-slate-600 font-medium italic">
                    {isPeak
                        ? 'Grid demand is high. Reduce usage to prevent strain.'
                        : hoursUntilPeak
                            ? `Grid demand expected to rise in ${hoursUntilPeak} hours.`
                            : 'Grid demand is expected to remain stable.'}
                </div>
            </div>

            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        </div>
    );
};

export default GridStatusCard;

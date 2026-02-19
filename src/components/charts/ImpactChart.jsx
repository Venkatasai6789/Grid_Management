import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUserDashboard } from '../../hooks/useUserDashboard';
import { GRID_DATA } from '../../engine/SimulationEngine';

const ImpactChart = () => {
    const { currentHour } = useUserDashboard();

    // Prepare data for the chart (24 hours)
    const data = GRID_DATA.map(h => ({
        hour: h.label,
        baseLoad: h.base_load_kw,
        peakThreshold: h.peak_threshold_kw,
        isPeak: h.isPeak,
        // Visual indicator for current hour
        isCurrent: h.hour === currentHour
    }));

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface-card/95 backdrop-blur-md text-white text-xs p-3 rounded-xl shadow-xl border border-white/10">
                    <p className="font-bold mb-2 text-slate-300">{label}</p>
                    <p className="text-google-green flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-google-green"></span>
                        Base Load: <span className="font-bold text-white ml-auto">{payload[0].value} kW</span>
                    </p>
                    <p className="text-google-red flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-google-red"></span>
                        Peak Limit: <span className="font-bold text-white ml-auto">{payload[1]?.value} kW</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34A853" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#34A853" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EA4335" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#EA4335" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.1} />
                <XAxis
                    dataKey="hour"
                    interval={3}
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Peak Threshold Line */}
                <Area
                    type="monotone"
                    dataKey="peakThreshold"
                    stroke="#EA4335"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="url(#colorPeak)"
                    name="Peak Threshold"
                />

                {/* Base Load Area */}
                <Area
                    type="monotone"
                    dataKey="baseLoad"
                    stroke="#34A853"
                    strokeWidth={3}
                    fill="url(#colorLoad)"
                    name="Grid Load"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#34A853' }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default ImpactChart;

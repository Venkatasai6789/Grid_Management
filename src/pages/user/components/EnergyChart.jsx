import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const EnergyChart = ({ data }) => {
    // Mock data for weekly view if real history is sparse
    const displayData = data && data.length > 5 ? data : MOCK_WEEKLY_DATA;

    return (
        <div className="bg-[#1e1e1e] rounded-3xl p-6 border border-white/5 h-full relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-sm font-bold text-white mb-1">Historical Energy Impact</h3>
                    <p className="text-xs text-slate-500">Sustainability performance over the last 7 days</p>
                </div>
                <div className="flex bg-black/40 rounded-lg p-0.5">
                    <button className="px-3 py-1 bg-google-blue rounded-md text-[10px] font-bold text-white uppercase">Weekly</button>
                    <button className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase hover:text-white transition-colors">Monthly</button>
                </div>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4285f4" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#4285f4" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            dy={10}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px', color: '#fff' }}
                            labelStyle={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#4285f4"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                        {/* Decorative dots for nodes */}
                        {/* Note: Recharts Customization would be needed for exact circle nodes at every point, 
                            but default activeDot is close enough for MVP */}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const MOCK_WEEKLY_DATA = [
    { day: 'MON', value: 30 },
    { day: 'TUE', value: 45 },
    { day: 'WED', value: 35 },
    { day: 'THU', value: 60 },
    { day: 'FRI', value: 40 },
    { day: 'SAT', value: 25 },
    { day: 'SUN', value: 70 },
];

export default EnergyChart;

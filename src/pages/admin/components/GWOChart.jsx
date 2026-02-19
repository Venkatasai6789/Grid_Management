import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';

export const GWOChart = ({ data, alpha, beta, delta }) => {
    return (
        <div className="bg-[#0f1115] border border-white/5 rounded-xl p-5 h-full flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-6 z-10">
                <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">GWO Optimizer: Reward vs Penalty</h2>
                    <p className="text-xs text-gray-500 font-medium">Grey Wolf Optimizer - Active Heuristics Phase 4</p>
                </div>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-2 text-blue-400">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Reward
                    </div>
                    <div className="flex items-center gap-2 text-red-500">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Penalty
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 w-full min-h-[250px] z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorReward" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPenalty" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis
                            dataKey="hour"
                            stroke="#444"
                            tick={{ fill: '#666', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#444"
                            tick={{ fill: '#666', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1d24', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ color: '#888', marginBottom: '5px', fontSize: '10px' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="reward"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#1a1d24', strokeWidth: 2 }}
                            animationDuration={1500}
                        />
                        <Line
                            type="monotone"
                            dataKey="penalty"
                            stroke="#ef4444"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: '#ef4444', stroke: '#1a1d24', strokeWidth: 2 }}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Agent Indicators Overlay - Moved up to avoid X-Axis overlap */}
            <div className="absolute bottom-10 left-5 flex gap-4 z-20 pointer-events-none">
                <AgentBadge role="ALPHA" status="ACTIVE" color="blue" position={alpha} />
                <AgentBadge role="BETA" status="SEARCHING" color="yellow" position={beta} />
                <AgentBadge role="DELTA" status="SYNCED" color="green" position={delta} />
            </div>

            {/* Background Grid Decoration */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
        </div>
    );
};

const AgentBadge = ({ role, status, color, position }) => {
    const colors = {
        blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', dot: 'bg-blue-500' },
        yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-500', dot: 'bg-yellow-500' },
        green: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', dot: 'bg-emerald-500' },
    };
    const c = colors[color];

    return (
        <div className={`flex flex-col px-2 py-1.5 rounded border ${c.border} ${c.bg} backdrop-blur-sm pointer-events-auto`}>
            <div className="flex items-center gap-1.5 mb-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`}></div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{role}</span>
            </div>
            <div className={`text-[10px] font-black uppercase tracking-wider ${c.text}`}>
                {status}
            </div>
            {position && (
                <div className="text-[8px] font-mono opacity-50 mt-0.5">
                    R{position.x} / P{position.y}
                </div>
            )}
        </div>
    );
};

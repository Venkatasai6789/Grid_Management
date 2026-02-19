import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { useUserDashboard } from '../hooks/useUserDashboard';
import { calculateUsageBreakdown, generateWeeklyUsage } from '../engine/ApplianceEngine';

const AnalyticsPage = () => {
    const { appliances, totalKwhSaved, dailyConsumption } = useUserDashboard();
    const [period, setPeriod] = useState('Week');

    // ============================================================
    // Dynamic Data Derivation
    // ============================================================

    // 1. Consumption Breakdown (Live)
    const pieData = useMemo(() => calculateUsageBreakdown(appliances), [appliances]);

    // 2. Weekly Usage (Synthetic Past + Real Current)
    const usageData = useMemo(() => {
        const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // Mon=0, Sun=6
        const synthetic = generateWeeklyUsage(todayIndex);

        // Override today's usage with REAL cumulative consumption from simulation
        return synthetic.map((d, index) => ({
            ...d,
            usage: index === todayIndex ? Math.max(d.usage * 0.1, dailyConsumption) : d.usage // show at least a blip
        }));
    }, [dailyConsumption]);

    // 3. Stats
    const totalUsageThisWeek = useMemo(() => Math.round(usageData.reduce((acc, curr) => acc + curr.usage, 0)), [usageData]);
    const savingsPercentage = 12 + Math.min(Math.round(totalKwhSaved / 5), 15); // Dynamic based on savings

    // 4. Carbon Footprint
    const co2Emitted = Math.round(totalUsageThisWeek * 0.4); // 0.4 kg/kWh
    const co2Offset = Math.round(totalKwhSaved * 0.5); // 0.5 kg/kWh saved (cleaner)

    return (
        <div className="space-y-6 pb-20 md:pb-0 animate-fade-in">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Consumption</h2>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {['Day', 'Week', 'Month'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Total Usage</h3>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{totalUsageThisWeek} kWh this week</p>
                        </div>
                        <div className="text-right">
                            <p className="text-emerald-500 font-black text-lg">-{savingsPercentage}%</p>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">vs last week</p>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={usageData}>
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                                    dy={10}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: 'white' }}
                                    itemStyle={{ color: 'white' }}
                                    formatter={(value) => [`${value.toFixed(1)} kWh`, 'Usage']}
                                />
                                <Bar dataKey="usage" radius={[4, 4, 4, 4]} barSize={40}>
                                    {usageData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1) ? '#ec5b13' : '#e2e8f0'} className="dark:fill-slate-700" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Breakdown & Comparison */}
                <div className="space-y-6">
                    {/* Consumption Breakdown */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Live Breakdown</h3>
                        <div className="flex items-center gap-6">
                            <div className="relative w-32 h-32 flex-shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-xs font-black text-slate-900 dark:text-white">HVAC</span>
                                    <span className="text-[10px] font-bold text-slate-400">{pieData.find(d => d.name === 'HVAC')?.value || 0}%</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-3">
                                {pieData.map((entry) => (
                                    <div key={entry.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }}></span>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{entry.name}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">{entry.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Community Comparison */}
                    <div className="bg-emerald-500 p-6 rounded-[2.5rem] text-white relative overflow-hidden group transition-all hover:shadow-lg hover:shadow-emerald-500/20">
                        <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-gradient-to-bl from-white/20 to-transparent rounded-full blur-3xl group-hover:rotate-45 transition-transform duration-700"></div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-2xl">trophy</span>
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Energy Saver!</h3>
                            <p className="text-emerald-50 text-xs font-bold leading-relaxed mb-4">
                                You used <span className="text-white">{savingsPercentage}% LESS</span> energy than similar homes in your area this week.
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-emerald-600/50 p-2 rounded-lg self-start inline-flex">
                                <span className="material-symbols-outlined text-sm">forest</span>
                                <span>{Math.max(12, Math.floor(totalKwhSaved / 2))} Trees Saved</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Carbon Footprint Strip */}
            <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-primary to-primary-dark"></div>
                <div className="bg-gradient-to-r from-primary/10 to-transparent absolute inset-0 pointer-events-none"></div>

                <div className="relative z-10">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Carbon Footprint</h3>
                    <p className="text-slate-400 text-xs font-bold mt-1">Your impact on the environment</p>
                </div>

                <div className="flex items-center gap-8 relative z-10 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    <div className="flex items-center gap-3 min-w-max">
                        <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">co2</span>
                        </div>
                        <div>
                            <p className="text-xl font-black text-white">{co2Emitted} kg</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">CO2 Emitted</p>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-slate-700 hidden md:block"></div>
                    <div className="flex items-center gap-3 min-w-max">
                        <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-emerald-500">
                            <span className="material-symbols-outlined">recycling</span>
                        </div>
                        <div>
                            <p className="text-xl font-black text-white">{co2Offset} kg</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">CO2 Offset</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, YAxis, CartesianGrid } from 'recharts';
import { useUserDashboard } from '../hooks/useUserDashboard';
import { calculateUsageBreakdown, generateHistoricalUsage } from '../engine/ApplianceEngine';
import { Calendar, Zap, Leaf, TrendingDown, Info, Activity, X, Monitor, Smartphone, Wind, Droplet, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BreakdownModal = ({ isOpen, onClose, appliances }) => {
    if (!isOpen) return null;

    // Group appliances by category
    const grouped = appliances.reduce((acc, app) => {
        const cat = app.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(app);
        return acc;
    }, {});

    const categories = Object.keys(grouped).sort();

    // Helper for icons
    const getIcon = (type) => {
        switch (type) {
            case 'AC': return <Wind className="w-4 h-4 text-blue-300" />;
            case 'Washer': return <Droplet className="w-4 h-4 text-blue-400" />;
            case 'EV': return <Zap className="w-4 h-4 text-green-400" />;
            case 'TV': return <Monitor className="w-4 h-4 text-purple-400" />;
            case 'Kitchen': return <Coffee className="w-4 h-4 text-orange-400" />;
            default: return <Smartphone className="w-4 h-4 text-gray-300" />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-panel-heavy w-full max-w-lg rounded-3xl p-6 relative overflow-hidden shadow-2xl border border-white/10 max-h-[80vh] flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                Live Energy Breakdown
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar pr-2 space-y-6">
                            {categories.map(cat => {
                                const apps = grouped[cat];
                                const catTotal = apps.reduce((sum, a) => sum + (a.status === 'on' ? a.load_kw : 0), 0);

                                return (
                                    <div key={cat} className="space-y-3">
                                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-white/5 pb-1">
                                            <span>{cat}</span>
                                            <span>{catTotal.toFixed(2)} kW</span>
                                        </div>
                                        {apps.map(app => (
                                            <div key={app.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${app.status === 'on' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-gray-800 text-gray-500'}`}>
                                                        {getIcon(app.type)}
                                                    </div>
                                                    <div>
                                                        <div className={`text-sm font-medium ${app.status === 'on' ? 'text-white' : 'text-gray-500'}`}>
                                                            {app.name}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400">
                                                            {app.status === 'on' ? 'Running' : 'Off'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`text-sm font-mono font-bold ${app.status === 'on' ? 'text-green-400' : 'text-gray-600'}`}>
                                                    {app.status === 'on' ? app.load_kw.toFixed(2) : '0.00'} kW
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 text-center">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                                Total Active Load: <span className="text-white font-bold">{appliances.reduce((s, a) => s + (a.status === 'on' ? a.load_kw : 0), 0).toFixed(2)} kW</span>
                            </p>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};


const AnalyticsPage = () => {
    const { appliances, totalKwhSaved, dailyConsumption, currentHour } = useUserDashboard();
    const [period, setPeriod] = useState('Day');
    const [showBreakdown, setShowBreakdown] = useState(false);

    // ============================================================
    // Dynamic Data Derivation
    // ============================================================

    // 1. Consumption Breakdown (Live)
    // Memoize to prevent unnecessary recalculations
    const pieData = useMemo(() => calculateUsageBreakdown(appliances), [appliances]);

    // 2. Historical Usage (Generated based on actual appliances)
    // We pass currentHour and dailyConsumption to make "now" accurate
    const usageData = useMemo(() => {
        // Calculate instantaneous load ONLY for the "Day" view's current hour projection
        // For other views, dailyConsumption is enough.
        const currentLoad = (appliances || []).reduce((sum, app) =>
            sum + (app.status === 'on' ? app.load_kw : 0), 0
        );

        return generateHistoricalUsage(
            appliances,
            period,
            currentLoad,
            currentHour,
            dailyConsumption
        );
    }, [appliances, period, dailyConsumption, currentHour]);

    // 3. Stats
    const totalUsageInView = useMemo(() =>
        Math.round(usageData.reduce((acc, curr) => acc + (curr.value || 0), 0) * 10) / 10,
        [usageData]);

    const savingsPercentage = 12 + Math.min(Math.round(totalKwhSaved / 5), 15); // Dynamic derived

    // 4. Carbon Footprint
    const co2Emitted = Math.round(totalUsageInView * 0.4); // 0.4 kg/kWh approx
    const co2Offset = Math.round(totalKwhSaved * 0.5); // 0.5 kg/kWh saved (cleaner source)

    // Custom Tooltip for Bar Chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-white text-lg font-bold">
                        {payload[0].value} <span className="text-sm font-normal text-gray-400">kWh</span>
                    </p>
                    {payload[0].payload.isFuture && (
                        <p className="text-[10px] text-indigo-400 mt-1 italic">Projected</p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 pb-20 md:pb-0 animate-fade-in relative">

            <BreakdownModal
                isOpen={showBreakdown}
                onClose={() => setShowBreakdown(false)}
                appliances={appliances}
            />

            {/* Header / Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        Usage Analytics
                        <span className="bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text text-[10px] border border-orange-500/30 px-2 py-0.5 rounded-full">
                            LIVE
                        </span>
                    </h2>
                    <p className="text-gray-400 text-xs font-medium mt-1 ml-1">
                        Monitoring {(appliances || []).length} active devices in real-time
                    </p>
                </div>

                <div className="flex bg-black/40 border border-white/5 p-1.5 rounded-2xl backdrop-blur-sm">
                    {['Day', 'Week', 'Month'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-6 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all relative overflow-hidden group ${period === p
                                ? 'bg-white text-black shadow-lg shadow-white/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="relative z-10">{p}</span>
                            {period === p && <motion.div layoutId="activeTab" className="absolute inset-0 bg-white" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* MAIN CHART (Span 2) */}
                <div className="md:col-span-2 glass-panel-heavy p-8 rounded-[2.5rem] relative overflow-hidden group">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-indigo-400" />
                                <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Total Consumption</h3>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-white">{totalUsageInView}</span>
                                <span className="text-lg font-medium text-gray-500">kWh</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-1 text-emerald-400">
                                <TrendingDown className="w-4 h-4" />
                                <span className="text-lg font-bold">-{savingsPercentage}%</span>
                            </div>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">vs average benchmark</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={usageData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                                    </linearGradient>
                                    <linearGradient id="barGradientFuture" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#334155" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#1e293b" stopOpacity={0.4} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                                    dy={10}
                                    interval={period === 'Month' ? 2 : 0} // Skip labels on Month view
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                                <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={period === 'Month' ? 8 : 24}>
                                    {usageData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.isFuture ? "url(#barGradientFuture)" : "url(#barGradient)"}
                                            fillOpacity={entry.isFuture ? 0.3 : 1}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* SIDE: LIVE BREAKDOWN */}
                <div className="glass-panel p-6 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3 text-yellow-400" />
                                Live Breakdown
                            </h3>
                            <button
                                onClick={() => setShowBreakdown(true)}
                                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                DETAILS
                            </button>
                        </div>

                        <div className="h-48 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={4}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Label */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-sm font-bold text-gray-500 uppercase">Top</span>
                                <span className="text-xl font-black text-white">
                                    {pieData.length > 0 ? pieData[0].name : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mt-4">
                        {pieData.slice(0, 3).map((entry) => (
                            <div key={entry.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: entry.fill }}></div>
                                    <span className="text-xs font-bold text-gray-300">{entry.name}</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-white">{entry.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CARBON FOOTPRINT (Span 2) */}
                <div className="md:col-span-2 bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/20 p-8 rounded-[2.5rem] relative overflow-hidden flex items-center justify-between">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

                    <div className="relative z-10 flex items-center gap-8">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <Leaf className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Eco Impact</h3>
                            <p className="text-emerald-400/80 text-sm font-medium mt-1">
                                You've offset <span className="text-white font-bold">{co2Offset} kg</span> of CO2 this {period.toLowerCase()}.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 hidden md:flex items-center gap-12 text-right">
                        <div>
                            <div className="text-3xl font-black text-white">{co2Emitted}</div>
                            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">kg Emitted</div>
                        </div>
                        <div className="w-px h-12 bg-white/10"></div>
                        <div>
                            <div className="text-3xl font-black text-white">{12 + Math.floor(co2Offset / 10)}</div>
                            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Trees Saved</div>
                        </div>
                    </div>
                </div>

                {/* INSIGHTS */}
                <div className="bg-[#1e1f20] border border-white/5 p-6 rounded-[2.5rem] flex flex-col justify-center relative group hover:border-indigo-500/30 transition-colors">
                    <div className="absolute top-4 right-4">
                        <Info className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Smart Insight</h3>
                    <p className="text-gray-300 text-sm font-medium leading-relaxed">
                        Your usage peaks at <span className="text-white font-bold">19:00</span>. Scheduling your <span className="text-indigo-400">EV Charger</span> to 22:00 could save you <span className="text-green-400 font-bold">~15%</span> on your bill.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AnalyticsPage;

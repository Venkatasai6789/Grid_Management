import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { useUserDashboard } from '../hooks/useUserDashboard';
import { generateHistoricalUsage } from '../engine/ApplianceEngine';
import { Zap, Power, Thermometer, Activity, RefreshCw, Smartphone, Wind, Droplet, Monitor, Coffee, BatteryCharging, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DevicesPage = () => {
    const { appliances, toggleAppliance } = useUserDashboard();
    const [selectedId, setSelectedId] = useState(appliances.length > 0 ? appliances[0].id : null);
    const [isScanning, setIsScanning] = useState(false);

    // Get the currently selected appliance object
    const activeAppliance = appliances.find(a => a.id === selectedId) || appliances[0];

    // Helper for icons based on type
    const getIcon = (type) => {
        switch (type) {
            case 'AC': return <Wind className="w-6 h-6" />;
            case 'Washer': return <Droplet className="w-6 h-6" />;
            case 'EV': return <BatteryCharging className="w-6 h-6" />;
            case 'TV': return <Monitor className="w-6 h-6" />;
            case 'Kitchen': return <Coffee className="w-6 h-6" />;
            case 'Lighting': return <Zap className="w-6 h-6" />;
            default: return <Smartphone className="w-6 h-6" />;
        }
    };

    // Generate Chart Data for the SELECTED device
    // We use 'Week' view to show 7-day history for this specific device
    const chartData = useMemo(() => {
        if (!activeAppliance) return [];
        // Pass single-element array to generator to get just this device's curve
        return generateHistoricalUsage([activeAppliance], 'Week', activeAppliance.load_kw);
    }, [activeAppliance]);

    // Derived Stats
    const isOnline = activeAppliance?.status === 'on';
    const currentPower = isOnline ? activeAppliance.load_kw : 0;

    // Simulate some metadata if missing
    const mode = activeAppliance?.category === 'cooling' ? 'Cooling' : (activeAppliance?.category === 'transport' ? 'Charging' : 'Auto');
    const temperature = activeAppliance?.category === 'cooling' ? '22°C' : (activeAppliance?.category === 'heating' ? '24°C' : 'N/A');
    const health = 'Optimal'; // In future, simulate degradation

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] animate-fade-in pb-20 lg:pb-0">

            {/* SIDEBAR: My Ecosystem */}
            <div className="w-full lg:w-80 flex flex-col gap-4">

                {/* Header Card */}
                <div className="glass-panel-heavy p-6 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/30 transition-colors"></div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1 relative z-10">My Ecosystem</h3>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest relative z-10">
                        {appliances.filter(a => a.status === 'on').length} Devices Online
                    </p>

                    <button
                        onClick={() => {
                            setIsScanning(true);
                            setTimeout(() => setIsScanning(false), 2000);
                        }}
                        className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-indigo-300 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : 'group-hover/btn:rotate-180 transition-transform duration-500'}`} />
                        {isScanning ? 'Scanning...' : 'Add Device'}
                    </button>
                </div>

                {/* Device List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {appliances.map((device) => (
                        <button
                            key={device.id}
                            onClick={() => setSelectedId(device.id)}
                            className={`w-full p-4 rounded-3xl text-left transition-all border group relative overflow-hidden ${selectedId === device.id
                                    ? 'bg-white text-black shadow-xl scale-[1.02]'
                                    : 'bg-black/20 border-white/5 hover:bg-white/5 text-gray-400 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${selectedId === device.id ? 'bg-black text-white' : 'bg-white/10 text-gray-400'
                                    }`}>
                                    {getIcon(device.type)}
                                </div>
                                <div className={`w-2 h-2 rounded-full ${device.status === 'on' ? 'bg-emerald-500' : 'bg-gray-600'}`}></div>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm truncate">{device.name}</h4>
                                <p className={`text-[10px] font-bold uppercase tracking-wide mt-1 ${selectedId === device.id ? 'text-gray-500' : 'text-gray-600'
                                    }`}>
                                    {device.status === 'on' ? `${device.load_kw.toFixed(2)} kW` : 'Offline'}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN CONTENT: Active Device Details */}
            {activeAppliance && (
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 lg:pr-4">

                    {/* Header Stats */}
                    <div className="glass-panel p-8 rounded-[3rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 relative z-10 gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none">
                                        {activeAppliance.name}
                                    </h2>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isOnline
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            : 'bg-gray-500/10 border-gray-500/20 text-gray-400'
                                        }`}>
                                        {isOnline ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                                <p className="text-gray-400 font-bold flex items-center gap-2 text-sm">
                                    <Activity className="w-4 h-4" />
                                    {activeAppliance.category.charAt(0).toUpperCase() + activeAppliance.category.slice(1)} • {activeAppliance.location || 'Home'}
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleAppliance(activeAppliance.id)}
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isOnline
                                            ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-400'
                                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                        }`}
                                >
                                    <Power className="w-8 h-8" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                            {[
                                { label: 'Power Draw', value: `${currentPower.toFixed(2)} kW`, icon: Zap },
                                { label: 'Current Mode', value: mode, icon: Activity },
                                { label: 'Temperature', value: temperature, icon: Thermometer },
                                { label: 'Device Health', value: health, icon: Leaf },
                            ].map((stat, i) => (
                                <div key={i} className="p-5 bg-black/20 rounded-[2rem] border border-white/5 backdrop-blur-md">
                                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                                        <stat.icon className="w-3 h-3" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                                    </div>
                                    <p className="text-xl font-black text-white">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Usage Chart */}
                        <div className="lg:col-span-2 glass-panel p-8 rounded-[3rem]">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">7-Day History</h3>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                        Avg: {Math.round(chartData.reduce((a, b) => a + b.value, 0) / 7 * 10) / 10} kWh/day
                                    </p>
                                </div>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <defs>
                                            <linearGradient id="deviceGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                        <XAxis
                                            dataKey="label"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                                            dy={10}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '1rem', border: '1px solid #ffffff10', color: 'white' }}
                                            itemStyle={{ color: '#818cf8' }}
                                            formatter={(value) => [`${value.toFixed(2)} kWh`, 'Usage']}
                                        />
                                        <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={32} fill="url(#deviceGradient)">
                                            {/* Highlight today (last item usually) approx logic */}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Grid Impact Card */}
                        <div className="flex flex-col gap-6">
                            <div className={`p-8 rounded-[3rem] text-white flex flex-col justify-between relative overflow-hidden h-full ${currentPower > 2
                                    ? 'bg-gradient-to-br from-orange-600 to-red-900 border border-orange-500/30'
                                    : 'bg-gradient-to-br from-emerald-900 to-black border border-emerald-500/20'
                                }`}>
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                <div className="relative z-10">
                                    <Leaf className={`w-10 h-10 mb-4 ${currentPower > 2 ? 'text-white' : 'text-emerald-400'}`} />
                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Grid Impact</p>
                                    <h3 className="text-2xl font-black uppercase tracking-tight leading-tight">
                                        {currentPower > 2 ? 'High Demand' : 'Eco Friendly'}
                                    </h3>
                                    <p className="text-sm font-medium mt-2 text-white/80">
                                        {currentPower > 2
                                            ? 'This device is consuming significant power. Consider scheduling for off-peak.'
                                            : 'This device is operating efficiently with minimal impact on the grid.'}
                                    </p>
                                </div>

                                <div className={`mt-6 self-start px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${currentPower > 2 ? 'bg-black/20 text-white' : 'bg-emerald-500/20 text-emerald-300'
                                    }`}>
                                    {currentPower > 2 ? '-5 Pts / hr' : '+12 Pts / hr'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DevicesPage;

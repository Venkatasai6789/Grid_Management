import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DevicesPage = () => {
    const [selectedId, setSelectedId] = useState('ac');
    const [isScanning, setIsScanning] = useState(false);

    const devices = {
        ac: { name: 'Living Room AC', power: '1.2 kW', temp: '22°C', mode: 'Cooling', health: 'Healthy', usage: [40, 45, 30, 55, 40, 20, 10], location: 'Floor 1', schedule: 'Eco-Timer active', icon: 'ac_unit' },
        ev: { name: 'Tesla Model 3', power: '7.4 kW', charge: '82%', mode: 'Scheduled', health: 'Optimal', usage: [10, 5, 80, 85, 70, 10, 5], location: 'Garage', schedule: 'Charges at 2 AM', icon: 'ev_station' },
        lights: { name: 'Smart Lighting', power: '0.1 kW', count: '12 active', mode: 'Auto', health: 'Good', usage: [15, 12, 14, 18, 12, 10, 11], location: 'Entire Home', schedule: 'Sunset trigger', icon: 'lightbulb' },
        washer: { name: 'LG ThinQ Washer', power: '0.0 kW', cycle: 'Idle', mode: 'Smart Link', health: 'Service Soon', usage: [0, 60, 0, 45, 0, 30, 0], location: 'Laundry Room', schedule: 'Manual start', icon: 'local_laundry_service' }
    };

    const active = devices[selectedId];

    const chartData = active.usage.map((val, i) => ({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        usage: val
    }));

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
            {/* Device List Sidebar */}
            <div className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto pr-2 pb-20">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[2rem] text-white shadow-lg sticky top-0 z-10">
                    <h3 className="text-lg font-black uppercase tracking-tight mb-1">My Ecosystem</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{Object.keys(devices).length} Devices Online</p>
                    <button
                        onClick={() => setIsScanning(!isScanning)}
                        className="mt-6 w-full py-3 bg-primary/20 border border-primary/50 rounded-xl text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/30 transition-colors flex items-center justify-center gap-2"
                    >
                        <span className={`material-symbols-outlined text-lg ${isScanning ? 'animate-spin' : ''}`}>sync</span>
                        {isScanning ? 'Scanning...' : 'Add Device'}
                    </button>
                </div>

                {Object.entries(devices).map(([id, device]) => (
                    <button
                        key={id}
                        onClick={() => setSelectedId(id)}
                        className={`p-4 rounded-[2rem] text-left transition-all border group relative overflow-hidden ${selectedId === id ? 'bg-white dark:bg-slate-800 border-primary dark:border-primary shadow-md' : 'bg-white dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedId === id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                <span className="material-symbols-outlined">{device.icon}</span>
                            </div>
                            {selectedId === id && <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>}
                        </div>
                        <h4 className={`font-bold ${selectedId === id ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{device.name}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">{device.location}</p>
                    </button>
                ))}
            </div>

            {/* Device Details Area */}
            <div className="flex-1 overflow-y-auto pb-20 space-y-6">
                {/* Header Stats */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{active.name}</h2>
                                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">Online</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">schedule</span>
                                {active.schedule}
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-3">
                            <button className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">
                                <span className="material-symbols-outlined">power_settings_new</span>
                            </button>
                            <button className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">
                                <span className="material-symbols-outlined">settings</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Power Draw</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{active.power}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Mode</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white truncate">{active.mode}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Temperature</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{active.temp || active.charge || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Device Health</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white truncate">{active.health}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Usage Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">7-Day Usage</h3>
                            <select className="bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold rounded-lg px-3 py-1 focus:ring-primary text-slate-600 dark:text-slate-300 outline-none">
                                <option>Last Week</option>
                                <option>Last Month</option>
                            </select>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
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
                                    />
                                    <Bar dataKey="usage" radius={[4, 4, 4, 4]} barSize={40}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 3 ? '#ec5b13' : '#e2e8f0'} className="dark:fill-slate-700" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Secondary Metrics */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-slate-900 dark:bg-slate-800 p-6 rounded-[2rem] text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="relative z-10">
                                <span className="material-symbols-outlined text-3xl mb-3 text-emerald-400">eco</span>
                                <div>
                                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Grid Load Impact</p>
                                    <p className="text-lg font-black uppercase tracking-tight">Minimal Impact</p>
                                </div>
                            </div>
                            <span className="text-emerald-400 text-[10px] font-black bg-emerald-400/10 px-3 py-1 rounded-full uppercase tracking-widest self-start mt-4">+12 Pts / hr</span>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Cost Estimate</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">₹ 14.20</p>
                            </div>
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DevicesPage;

import React, { useState, useMemo } from 'react';
import { useUserDashboard } from '../hooks/useUserDashboard';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, TrendingUp, TrendingDown, CreditCard,
    Gift, AlertCircle, ArrowUpRight, ArrowDownLeft,
    Zap, Clock, Award
} from 'lucide-react';

const WalletPage = () => {
    const { points, penalty, totalKwhSaved, transactions } = useUserDashboard();
    const [showRedeem, setShowRedeem] = useState(false);
    const [activeTab, setActiveTab] = useState('All');

    const balance = points - penalty;

    // Filter Transactions
    const filteredTx = useMemo(() => {
        return transactions.filter((t) => {
            if (activeTab === 'All') return true;
            if (activeTab === 'Credits') return t.type === 'REWARD';
            if (activeTab === 'Debits') return t.type === 'PENALTY';
            return true;
        }).sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
    }, [transactions, activeTab]);

    // Generate Chart Data (Balance Trend over time)
    const chartData = useMemo(() => {
        let runningBalance = 0;
        // Process oldest to newest for the chart
        const data = [...transactions].sort((a, b) => b.timestamp - a.timestamp).reverse().map(t => {
            runningBalance += t.amount;
            return {
                id: t.id,
                time: t.timestamp.split(',')[1]?.trim() || t.timestamp, // Extract time part if possible
                balance: runningBalance,
                amount: t.amount
            };
        });

        // If no data, provide a baseline
        if (data.length === 0) return [{ time: 'Start', balance: 0 }];
        return data;
    }, [transactions]);

    return (
        <div className="space-y-6 pb-20 lg:pb-0 animate-fade-in relative z-0">

            {/* Redeem Modal Overlay */}
            <AnimatePresence>
                {showRedeem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                        onClick={() => setShowRedeem(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#1a1b1e] w-full max-w-md rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>

                            <div className="p-8 relative z-10">
                                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400">
                                    <Gift className="w-8 h-8" />
                                </div>
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Redeem Points</h3>
                                    <p className="text-gray-400 font-medium">Available Balance: <span className="text-white font-bold">₹{points}</span></p>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { title: 'Bill Credit', sub: '500 Pts = ₹50', icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                                        { title: 'Amazon Gift Card', sub: '1000 Pts = ₹100', icon: Gift, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                                        { title: 'Donate to Charity', sub: 'Help green initiatives', icon: Award, color: 'text-pink-400', bg: 'bg-pink-500/10' }
                                    ].map((item, i) => (
                                        <button key={i} className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 hover:border-white/20 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center ${item.color}`}>
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-white mb-0.5">{item.title}</p>
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.sub}</p>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowRedeem(false)}
                                    className="w-full mt-6 py-4 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Main Balance Card */}
                <div className="lg:col-span-2 relative overflow-hidden rounded-[3rem] p-8 md:p-10 text-white shadow-2xl">
                    {/* Background Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-[#1e1b4b] to-black z-0"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none z-0"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none z-0"></div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Wallet className="w-4 h-4 text-indigo-300" />
                                    <p className="text-indigo-200 text-xs font-black uppercase tracking-widest">Net Balance</p>
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                                    ₹{balance}
                                </h1>
                            </div>
                            <div className="hidden md:block">
                                <button
                                    onClick={() => setShowRedeem(true)}
                                    className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-2 transition-all font-bold text-sm group"
                                >
                                    <Gift className="w-4 h-4 text-indigo-300 group-hover:scale-110 transition-transform" />
                                    Redeem
                                </button>
                            </div>
                        </div>

                        {/* Balance Chart (Mini) */}
                        <div className="flex-1 min-h-[150px] w-full mb-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '1rem', border: '1px solid #ffffff10', color: 'white' }}
                                        itemStyle={{ color: '#818cf8' }}
                                        formatter={(value) => [`₹${value}`, 'Balance']}
                                        labelStyle={{ display: 'none' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="#818cf8"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#balanceGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/5">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Earned</p>
                                <p className="text-lg font-black text-emerald-400 flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" /> ₹{points}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Penalties</p>
                                <p className="text-lg font-black text-red-400 flex items-center gap-1">
                                    <ArrowDownLeft className="w-3 h-3" /> ₹{penalty}
                                </p>
                            </div>
                            <div className="col-span-2 md:col-span-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Energy Efficiency contribution</p>
                                <p className="text-lg font-black text-white flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    {(totalKwhSaved || 0).toFixed(1)} kWh <span className="text-xs text-gray-500 font-bold self-center">SAVED</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Side Panel / Actions */}
                <div className="flex flex-col gap-6">
                    {/* Actions */}
                    <div className="glass-panel p-6 rounded-[2.5rem] flex flex-col justify-center gap-4">
                        <button
                            onClick={() => setShowRedeem(true)}
                            disabled={points <= 0}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${points > 0
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0'
                                : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                                }`}
                        >
                            <Gift className="w-5 h-5" />
                            Redeem Points
                        </button>
                        <button
                            onClick={() => setShowAddFunds(true)}
                            className="w-full py-4 bg-white/5 text-white border border-white/5 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3"
                        >
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            Add Credits
                        </button>
                    </div>

                    {/* Stats/Insight */}
                    <div className="bg-[#1a1b1e] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden flex-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10 h-full flex flex-col justify-center">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                                <TrendingUp className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Efficiency Score</h3>
                            <p className="text-gray-400 text-sm mb-6">You are in the top <span className="text-white font-bold">15%</span> of energy savers in your community.</p>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Recent Activity */}
            <div className="glass-panel p-8 rounded-[3rem]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        Recent Activity
                    </h3>
                    <div className="flex bg-black/20 p-1 rounded-xl">
                        {['All', 'Credits', 'Debits'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                                    ? 'bg-white/10 shadow-sm text-white'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    {filteredTx.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-lg font-bold text-gray-400">No transactions yet</p>
                            <p className="text-xs text-gray-600 uppercase tracking-widest mt-1">Participate in peak events to earn rewards!</p>
                        </div>
                    ) : (
                        filteredTx.slice(0, 10).map((tx, i) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'REWARD' ? 'bg-emerald-500/10 text-emerald-400' :
                                        tx.type === 'MARKETPLACE' ? 'bg-blue-500/10 text-blue-400' :
                                            'bg-red-500/10 text-red-400'
                                        }`}>
                                        {tx.type === 'REWARD' && <ArrowDownLeft className="w-5 h-5" />}
                                        {tx.type === 'MARKETPLACE' && <TrendingUp className="w-5 h-5" />}
                                        {tx.type === 'PENALTY' && <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm mb-1">{tx.description}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{tx.timestamp}</p>
                                    </div>
                                </div>
                                <div className={`text-right font-black text-lg ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                    {tx.amount >= 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalletPage;

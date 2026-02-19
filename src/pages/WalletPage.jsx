import React, { useState } from 'react';
import { useUserDashboard } from '../hooks/useUserDashboard';

const WalletPage = () => {
    const { points, penalty, totalKwhSaved, transactions } = useUserDashboard();
    const [showRedeem, setShowRedeem] = useState(false);
    const [activeTab, setActiveTab] = useState('All');

    const balance = points - penalty;

    const filteredTx = transactions.filter((t) => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Credits') return t.type === 'REWARD';
        if (activeTab === 'Debits') return t.type === 'PENALTY';
        return true;
    });

    return (
        <div className="space-y-6 pb-20 md:pb-0 relative">
            {/* Redeem Modal */}
            {showRedeem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-zoom-in">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary animate-bounce">
                                <span className="material-symbols-outlined text-3xl">redeem</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Redeem Points</h3>
                            <p className="text-slate-500 text-xs font-bold mb-6">You have ₹{points} points available to redeem.</p>

                            <div className="space-y-3">
                                <button className="w-full py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-between px-4 hover:border-primary transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">receipt_long</span>
                                        <div className="text-left">
                                            <p className="text-sm font-black text-slate-900 dark:text-white">Bill Credit</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">500 Pts = ₹50</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                                </button>
                                <button className="w-full py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-between px-4 hover:border-primary transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">card_giftcard</span>
                                        <div className="text-left">
                                            <p className="text-sm font-black text-slate-900 dark:text-white">Amazon Gift Card</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">1000 Pts = ₹100</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                            <button onClick={() => setShowRedeem(false)} className="w-full py-3 text-slate-500 font-black uppercase tracking-widest text-xs hover:text-slate-800 dark:hover:text-white transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Wallet Balance Card */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[200px]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Net Balance</p>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tight">₹{balance}</h2>
                            </div>
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-end gap-6 mt-8">
                            <div>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Energy Saved</p>
                                <p className="text-xl font-bold">{totalKwhSaved.toFixed(1)} kWh</p>
                            </div>
                            <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
                            <div>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Points Earned</p>
                                <p className="text-xl font-bold text-emerald-400">₹{points}</p>
                            </div>
                            <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
                            <div>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Penalties</p>
                                <p className="text-xl font-bold text-red-400">₹{penalty}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-center gap-4">
                    <button
                        onClick={() => setShowRedeem(true)}
                        disabled={points <= 0}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${points > 0
                                ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <span className="material-symbols-outlined">redeem</span>
                        Redeem Points
                    </button>
                    <button className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">add_card</span>
                        Add Funds
                    </button>
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 min-h-[400px]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Activity</h3>
                    <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                        {['All', 'Credits', 'Debits'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredTx.length === 0 ? (
                    <div className="text-center py-16">
                        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4 block">receipt_long</span>
                        <p className="text-sm font-bold text-slate-400">No transactions yet.</p>
                        <p className="text-xs text-slate-400 mt-1">Participate in peak hour events to earn rewards!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Transaction</th>
                                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hour</th>
                                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-4">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTx.slice().reverse().map(tx => (
                                    <tr key={tx.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-none">
                                        <td className="py-4 pl-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'PENALTY' ? 'bg-red-50 dark:bg-red-900/10 text-red-500' : tx.type === 'MARKETPLACE' ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-500' : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500'}`}>
                                                    <span className="material-symbols-outlined text-lg">
                                                        {tx.type === 'REWARD' ? 'arrow_downward' : tx.type === 'MARKETPLACE' ? 'storefront' : 'arrow_upward'}
                                                    </span>
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white text-sm">{tx.description}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-xs font-bold text-slate-500 dark:text-slate-400">{tx.timestamp}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${tx.type === 'REWARD' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                                                    tx.type === 'MARKETPLACE' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                                                        'bg-red-50 dark:bg-red-900/20 text-red-500'
                                                }`}>{tx.type}</span>
                                        </td>
                                        <td className={`py-4 text-right pr-4 font-black text-sm ${tx.amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {tx.amount >= 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WalletPage;

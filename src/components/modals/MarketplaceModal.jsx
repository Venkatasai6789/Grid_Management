import React, { useState } from 'react';

const MarketplaceModal = ({ onClose, onPurchase, currentPoints }) => {
    const [purchaseAmount, setPurchaseAmount] = useState(50);
    const costPerCredit = 10; // ₹10 per credit
    const totalCost = purchaseAmount * costPerCredit;

    // Simulate processing
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handlePurchase = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            setTimeout(() => {
                onPurchase(purchaseAmount, totalCost);
            }, 1500);
        }, 2000);
    };

    if (isSuccess) {
        return (
            <div className="text-center p-8 animate-fade-in">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-4xl text-emerald-600 animate-bounce">check_circle</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Purchase Successful!</h3>
                <p className="text-slate-500 mb-6">You have acquired {purchaseAmount} Green Credits.</p>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Redirecting...</div>
            </div>
        );
    }

    return (
        <div className="p-1 animate-fade-in">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <span className="material-symbols-outlined text-9xl">energy_savings_leaf</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight relative z-10">Green Energy Marketplace</h3>
                <p className="text-blue-100 text-sm font-medium relative z-10 mt-1">Offset your peak usage with renewable credits.</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Select Credit Amount</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[20, 50, 100].map(amount => (
                            <button
                                key={amount}
                                onClick={() => setPurchaseAmount(amount)}
                                className={`py-3 rounded-xl border-2 font-bold transition-all ${purchaseAmount === amount
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-200'
                                    }`}
                            >
                                <div className="text-lg">{amount}</div>
                                <div className="text-[10px] uppercase text-slate-400">Credits</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Cost per Credit</span>
                        <span className="font-bold">₹{costPerCredit}</span>
                    </div>
                    <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-2" />
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Total Cost</span>
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">₹{totalCost}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePurchase}
                        disabled={isProcessing}
                        className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-wide hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isProcessing ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Purchase & Comply
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceModal;

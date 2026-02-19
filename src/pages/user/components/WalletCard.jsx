import React from 'react';
import { useNavigate } from 'react-router-dom';

const WalletCard = ({ points }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-[#1e1e1e] rounded-3xl p-6 relative overflow-hidden border border-white/5 h-full flex flex-col justify-between group">
            <div className="flex justify-between items-start z-10">
                <div className="w-12 h-12 rounded-2xl bg-google-blue/20 flex items-center justify-center text-google-blue">
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <span className="text-xs font-bold text-google-blue">+12% growth</span>
            </div>

            <div className="relative z-10 mt-4">
                <div className="text-sm font-bold text-slate-400">Wallet Rewards</div>
                <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black text-white tracking-tight">{points || 0}</span>
                    <span className="text-sm font-bold text-slate-500">pts</span>
                </div>
            </div>

            <button
                onClick={() => navigate('/wallet')}
                className="relative z-10 mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-wider text-slate-300 transition-colors border border-white/5"
            >
                Redeem Points
            </button>

            {/* Decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-google-blue/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-google-blue/20 transition-all"></div>
        </div>
    );
};

export default WalletCard;

import React from 'react';
import { NavLink } from 'react-router-dom';

const MobileNav = () => {
    const navLinkClass = ({ isActive }) =>
        `flex flex-col items-center justify-center w-full h-full py-2 transition-colors ${isActive
            ? 'text-primary'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
        }`;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 h-16 flex justify-around items-center z-50 md:hidden pb-safe">
            <NavLink to="/" className={navLinkClass}>
                <span className="material-symbols-outlined text-2xl">grid_view</span>
                <span className="text-[10px] font-bold mt-1">Home</span>
            </NavLink>
            <NavLink to="/history" className={navLinkClass}>
                <span className="material-symbols-outlined text-2xl">monitoring</span>
                <span className="text-[10px] font-bold mt-1">History</span>
            </NavLink>
            {/* Center Action Button */}
            <div className="relative -top-5">
                <button className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 border-4 border-slate-50 dark:border-slate-950">
                    <span className="material-symbols-outlined text-2xl font-bold">bolt</span>
                </button>
            </div>
            <NavLink to="/devices" className={navLinkClass}>
                <span className="material-symbols-outlined text-2xl">devices</span>
                <span className="text-[10px] font-bold mt-1">Devices</span>
            </NavLink>
            <NavLink to="/wallet" className={navLinkClass}>
                <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                <span className="text-[10px] font-bold mt-1">Wallet</span>
            </NavLink>
        </nav>
    );
};

export default MobileNav;

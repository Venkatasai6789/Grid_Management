import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSimulation } from '../context/SimulationContext';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import PeakHourAlert from './PeakHourAlert';
import { formatHour } from '../engine/SimulationEngine';

const Layout = () => {
    const location = useLocation();
    const { email } = useAuth();
    const sim = useSimulation();

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/': return 'Dashboard';
            case '/history': return 'Usage Analytics';
            case '/devices': return 'Smart Devices';
            case '/wallet': return 'My Wallet';
            default: return 'Grid Manager';
        }
    };

    return (
        <div className="flex min-h-screen bg-surface-dark text-foreground font-sans transition-colors duration-300">
            <PeakHourAlert />
            <Sidebar />

            <main className="flex-1 md:ml-[72px] min-h-screen relative flex flex-col pb-20 md:pb-0">
                {/* Mobile Header */}
                <header className="sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between md:hidden border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-lg font-bold">bolt</span>
                        </div>
                        <h1 className="text-lg font-black tracking-tight uppercase">{getPageTitle()}</h1>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4" alt="Profile" />
                    </div>
                </header>

                <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full animate-fade-in">
                    {/* Desktop Header */}
                    <header className="hidden md:flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight uppercase">{getPageTitle()}</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mt-1">Welcome back, {email?.split('@')[0] || 'User'}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                                <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-transparent focus:border-primary/20 rounded-xl text-sm font-bold w-64 shadow-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all" />
                            </div>

                            <button className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 hover:text-primary shadow-sm hover:shadow transition-all relative">
                                <span className="material-symbols-outlined">notifications</span>
                                {sim.isPeak && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>}
                            </button>

                            {/* Grid Status — dynamic */}
                            <div className={`px-4 py-2 rounded-full flex items-center gap-3 shadow-sm border ${sim.isPeak
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50'
                                : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50'
                                }`}>
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sim.isPeak ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${sim.isPeak ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                </span>
                                <span className={`font-black text-xs tracking-wider uppercase ${sim.isPeak ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'
                                    }`}>
                                    {sim.isPeak ? `⚡ Peak ${formatHour(sim.currentHour)}` : 'Grid Stable'}
                                </span>
                            </div>
                        </div>
                    </header>

                    <Outlet />
                </div>
            </main>

            <MobileNav />
        </div>
    );
};

export default Layout;

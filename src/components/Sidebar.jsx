import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const [showSettings, setShowSettings] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [language, setLanguage] = useState('English');
    const settingsRef = useRef(null);
    const [theme, setTheme] = useState(localStorage.theme || 'light');
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target) && !event.target.closest('#settings-btn')) {
                setShowSettings(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.theme = newTheme;
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const navLinkClass = ({ isActive }) =>
        `group relative flex items-center justify-center w-12 h-12 mx-auto rounded-xl transition-all duration-200 ${isActive
            ? 'bg-primary/20 text-primary shadow-sm shadow-primary/10'
            : 'text-slate-400 hover:text-primary hover:bg-surface-highlight'
        }`;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="fixed left-0 top-0 h-full w-[72px] bg-surface-card border-r border-white/5 flex flex-col py-6 z-50 hidden md:flex">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-lg shadow-primary/20 border border-primary/20">
                    <span className="material-symbols-outlined font-bold text-xl">bolt</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-4">
                <NavLink to="/" className={navLinkClass}>
                    <span className="material-symbols-outlined text-2xl font-bold">grid_view</span>
                    <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Dashboard</span>
                </NavLink>
                <NavLink to="/history" className={navLinkClass}>
                    <span className="material-symbols-outlined text-2xl font-bold">monitoring</span>
                    <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">History</span>
                </NavLink>
                <NavLink to="/devices" className={navLinkClass}>
                    <span className="material-symbols-outlined text-2xl font-bold">devices</span>
                    <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Appliances</span>
                </NavLink>
                <NavLink to="/wallet" className={navLinkClass}>
                    <span className="material-symbols-outlined text-2xl font-bold">account_balance_wallet</span>
                    <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Wallet</span>
                </NavLink>
                <button className="group relative flex items-center justify-center w-12 h-12 mx-auto rounded-xl transition-all duration-200 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined text-2xl font-bold">support_agent</span>
                    <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Help Center</span>
                </button>
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto flex flex-col gap-4 relative">
                <button
                    id="settings-btn"
                    onClick={() => setShowSettings(!showSettings)}
                    className={`flex items-center justify-center w-12 h-12 mx-auto rounded-xl transition-colors ${showSettings ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-primary hover:bg-surface-highlight'}`}
                >
                    <span className="material-symbols-outlined text-2xl">settings</span>
                </button>

                {showSettings && (
                    <div ref={settingsRef} className="absolute bottom-16 left-16 w-72 bg-surface-card/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden z-[100] animate-fade-in origin-bottom-left">
                        <div className="p-5 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center">
                                    <span className="material-symbols-outlined text-foreground/70">tune</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground">Settings</h4>
                                    <p className="text-xs text-foreground/50">Preferences</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-foreground/80">
                                    <span className="material-symbols-outlined text-xl">dark_mode</span>
                                    <span className="text-sm font-bold">Dark Mode</span>
                                </div>
                                <button onClick={toggleTheme} className={`w-10 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-surface-highlight border border-white/10' : 'bg-slate-200'}`}>
                                    <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-4' : ''}`}></span>
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-foreground/80">
                                    <span className="material-symbols-outlined text-xl">notifications</span>
                                    <span className="text-sm font-bold">Notifications</span>
                                </div>
                                <button className="w-10 h-6 bg-google-green rounded-full relative transition-colors">
                                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform translate-x-4"></span>
                                </button>
                            </div>

                            <div className="relative">
                                <button onClick={() => setShowLangMenu(!showLangMenu)} className="w-full flex items-center justify-between p-3 bg-surface-highlight rounded-xl text-xs font-bold text-foreground/80 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">language</span>
                                        <span>{language}</span>
                                    </div>
                                    <span className="material-symbols-outlined text-lg">expand_more</span>
                                </button>
                                {showLangMenu && (
                                    <div className="absolute bottom-full left-0 w-full mb-2 bg-surface-highlight border border-white/10 rounded-xl shadow-xl z-[110] overflow-hidden">
                                        {['English', 'Spanish', 'Hindi', 'German'].map(lang => (
                                            <button key={lang} onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                                                className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-white/5 transition-colors ${language === lang ? 'text-primary bg-primary/10' : 'text-foreground/70'}`}>
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/5">
                            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2 py-2 text-google-red hover:text-red-400 hover:bg-google-red/10 rounded-xl transition-colors">
                                <span className="material-symbols-outlined text-xl">logout</span>
                                <span className="text-sm font-bold">Sign Out</span>
                            </button>
                        </div>
                    </div>
                )}

                <div className="w-10 h-10 mx-auto rounded-full bg-surface-highlight overflow-hidden border-2 border-surface-card ring-2 ring-surface-highlight cursor-pointer hover:ring-primary/50 transition-all">
                    <img alt="User profile" className="w-full h-full object-cover" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=1E1F20" />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

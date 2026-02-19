import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('user');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const result = login(email, password);
        if (result.success) {
            navigate(result.role === 'admin' ? '/admin' : '/');
        } else {
            setError(result.error);
        }
    };

    // Quick-fill for demo
    const fillUser = () => { setEmail('user@grid.com'); setPassword('password123'); };
    const fillAdmin = () => { setEmail('admin@grid.com'); setPassword('admin123'); };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden font-public-sans">
            {/* Background Gradient Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 md:p-12 relative z-10 animate-fade-in">
                {/* Logo & Title */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-primary/20">
                        <span className="material-symbols-outlined text-4xl font-bold">bolt</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Bento Energy</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">
                        {isLogin ? 'Welcome back to the grid' : 'Create your smart account'}
                    </p>
                </div>

                {/* Toggle Switch */}
                <div className="flex p-1.5 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-6 border border-slate-100 dark:border-slate-700">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${isLogin ? 'bg-white dark:bg-slate-700 text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >Sign In</button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${!isLogin ? 'bg-white dark:bg-slate-700 text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >Sign Up</button>
                </div>

                {/* Quick Access (demo only) */}
                {isLogin && (
                    <div className="flex gap-2 mb-6">
                        <button type="button" onClick={fillUser} className="flex-1 py-2 px-3 bg-primary/5 border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary/10 transition-all">
                            <span className="material-symbols-outlined text-sm mr-1 align-middle">home</span>
                            User Demo
                        </button>
                        <button type="button" onClick={fillAdmin} className="flex-1 py-2 px-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all">
                            <span className="material-symbols-outlined text-sm mr-1 align-middle">admin_panel_settings</span>
                            Admin Demo
                        </button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
                        <span className="material-symbols-outlined text-lg">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-primary transition-colors">mail</span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="user@grid.com or admin@grid.com"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-primary transition-colors">lock</span>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="space-y-2 animate-fade-in">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Access Role</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setRole('user')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${role === 'user' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                                    <span className="material-symbols-outlined">home</span>
                                    <span className="text-[10px] font-black uppercase tracking-wider">Homeowner</span>
                                </button>
                                <button type="button" onClick={() => setRole('admin')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${role === 'admin' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                                    <span className="material-symbols-outlined">admin_panel_settings</span>
                                    <span className="text-[10px] font-black uppercase tracking-wider">Grid Admin</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-4 mt-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                        {isLogin ? 'Access Dashboard' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs font-bold text-slate-400">
                        Protected by <span className="text-slate-600 dark:text-slate-300">BentoGrid Secure™</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

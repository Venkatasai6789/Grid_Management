import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserDashboard } from '../hooks/useUserDashboard';
import {
    Clock,
    Zap,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Smartphone,
    Monitor,
    Coffee,
    Wind,
    Droplet,
    ArrowRight
} from 'lucide-react';
import {
    getUnnecessaryOnAppliances
} from '../engine/ApplianceEngine';

export default function PeakHourAlert() {
    const {
        modalActive,
        currentHour,
        currentReward,
        currentPenalty,
        reductionTarget,
        appliances,
        makeDecision,
        turnOffAppliances,
        clearModal
    } = useUserDashboard();

    // 1. Identify candidates (Unnecessary + ON)
    const candidates = useMemo(() => {
        // Filter for devices that are 'on' and type 'unnecessary'
        // Using 'load_kw' as confirmd from data source
        return appliances.filter(app => app.status === 'on' && app.type === 'unnecessary');
    }, [appliances]);

    // 2. Selection State (IDs of devices selected to turn OFF)
    const [selectedIds, setSelectedIds] = useState([]);

    // Initialize selection when modal opens or candidates change
    // Auto-select enough devices to meet proper target if possible?
    // For now, let's just default to empty like the user asked for "selecting" themselves
    // OR pre-select all to be helpful. 
    // Let's pre-select nothing so the user sees the "Selecting" action clearly as requested.
    useEffect(() => {
        if (modalActive) {
            setSelectedIds([]);
        }
    }, [modalActive]);

    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (modalActive) {
            setTimeLeft(59);
        }
    }, [modalActive]);

    useEffect(() => {
        if (!modalActive || timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [modalActive, timeLeft]);

    // 3. Calculations based on SELECTION
    // Total KW of devices currently ON (Base for reduction)
    const currentReducibleLoadKw = candidates.reduce((sum, app) => sum + (app.load_kw || 0), 0).toFixed(2);

    // KW saved by the selected devices
    const selectedKw = useMemo(() => {
        return candidates
            .filter(app => selectedIds.includes(app.id))
            .reduce((sum, app) => sum + (app.load_kw || 0), 0);
    }, [candidates, selectedIds]);

    // Target (fixed from context)
    const targetKw = reductionTarget || 0;

    // Points earned if executed
    const estimatedPoints = Math.round(selectedKw * currentReward);

    // Compliance Ratio
    const complianceRatio = targetKw > 0 ? Math.min(1, selectedKw / targetKw) : 1;

    // Handlers
    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleComply = () => {
        if (selectedIds.length === 0) return;

        // 1. Actually turn them off
        turnOffAppliances(selectedIds, currentHour);

        // 2. Submit decision
        // makeDecision(choice, kwhSaved, pointsEarned, penaltyAmount)
        makeDecision('comply', selectedKw, estimatedPoints, 0);

        // 3. Close
        clearModal();
    };

    const handleSkip = () => {
        makeDecision('ignore', 0, 0, currentPenalty);
        clearModal();
    };

    if (!modalActive) return null;

    const getIcon = (type) => {
        switch (type) {
            case 'AC': return <Wind className="w-5 h-5 text-blue-300" />;
            case 'Washer': return <Droplet className="w-5 h-5 text-blue-400" />;
            case 'EV': return <Zap className="w-5 h-5 text-green-400" />;
            default: return <Smartphone className="w-5 h-5 text-gray-300" />;
        }
    };

    return (
        <AnimatePresence>
            {modalActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="glass-panel-heavy w-full max-w-md rounded-3xl p-6 relative overflow-hidden shadow-2xl border border-white/10"
                    >
                        {/* Header Section */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold tracking-wider text-white flex items-center gap-2">
                                    PEAK HOUR ALERT
                                </h2>
                                <div className="flex items-center gap-2 mt-1 text-red-500 font-medium text-sm">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                    {currentHour}:00 {currentHour < 12 ? 'AM' : 'PM'} — Grid under stress
                                </div>
                            </div>

                            {/* Timer Widget */}
                            <div className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 flex flex-col items-center">
                                <span className="text-[10px] text-red-400 uppercase tracking-widest font-semibold">Time Left</span>
                                <div className="text-2xl font-mono text-white font-bold tracking-widest">
                                    00:{timeLeft.toString().padStart(2, '0')}
                                </div>
                            </div>
                        </div>

                        {/* Reward vs Penalty Cards */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* Reward Card */}
                            <div className="bg-[#1e1f20] border border-green-500/30 rounded-2xl p-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">Reward</div>
                                <div className="text-3xl font-bold text-white mb-1">
                                    ₹{currentReward}<span className="text-sm font-normal text-gray-400">/kWh</span>
                                </div>
                                <div className="text-[10px] text-green-400/80 font-medium">+Pt2 Bonus Active</div>
                            </div>

                            {/* Penalty Card */}
                            <div className="bg-[#1e1f20] border border-red-500/30 rounded-2xl p-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                </div>
                                <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Penalty</div>
                                <div className="text-3xl font-bold text-white mb-1">
                                    ₹{currentPenalty}<span className="text-sm font-normal text-gray-400"> flat</span>
                                </div>
                                <div className="text-[10px] text-red-400/80 font-medium">Avoid extra charges</div>
                            </div>
                        </div>

                        {/* Reduce Load Section */}
                        <div className="bg-[#131314]/80 rounded-2xl p-5 border border-white/5 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 text-xs font-bold border border-orange-500/30">1</div>
                                <span className="text-sm font-semibold text-gray-200 tracking-wide uppercase">Reduce My Load</span>
                            </div>

                            {/* Status Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs font-mono font-medium mb-2">
                                    <span className="text-gray-400">STATUS</span>
                                    <div>
                                        <span className={selectedKw >= targetKw ? "text-green-400" : "text-amber-400"}>
                                            {selectedKw.toFixed(2)} kW
                                        </span>
                                        <span className="text-gray-600 mx-1">/</span>
                                        <span className="text-gray-400">{targetKw} kW Target</span>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden flex">
                                    <div
                                        className={`h-full transition-all duration-500 ${selectedKw >= targetKw ? "bg-green-500" : "bg-gradient-to-r from-red-500 to-orange-500"}`}
                                        style={{ width: `${Math.min(100, (selectedKw / (targetKw || 1)) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Device List (Candidates Only) */}
                            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                                {candidates.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500 text-xs">
                                        No reducible appliances running.
                                    </div>
                                ) : (
                                    candidates.map((app) => {
                                        const isSelected = selectedIds.includes(app.id);
                                        return (
                                            <div
                                                key={app.id}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isSelected
                                                    ? 'bg-orange-500/10 border-orange-500/50'
                                                    : 'bg-black/20 border-white/5 hover:border-white/10'
                                                    }`}
                                                onClick={() => toggleSelection(app.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${isSelected
                                                            ? 'bg-orange-500 border-orange-500 text-black'
                                                            : 'bg-transparent border-gray-600'
                                                            }`}
                                                    >
                                                        {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                                                    </div>

                                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 text-gray-300">
                                                        {getIcon(app.type)}
                                                    </div>

                                                    <div>
                                                        <div className="text-sm font-medium text-white">{app.name}</div>
                                                        <div className="text-[10px] text-gray-400">
                                                            {app.load_kw} kW • Running
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-xs font-mono font-medium text-gray-300">
                                                    {(app.load_kw || 0).toFixed(2)} kW
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleComply}
                                disabled={selectedIds.length === 0}
                                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 group transition-all relative overflow-hidden ${selectedIds.length === 0
                                    ? 'bg-gray-800 border border-gray-700 cursor-not-allowed opacity-50'
                                    : 'bg-gradient-to-r from-[#3c2a21] to-[#3a2818] border border-[#5d4037] hover:border-[#8d6e63]'
                                    }`}
                            >
                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 transition-colors ${selectedIds.length > 0 ? 'bg-orange-500/5 group-hover:bg-orange-500/10' : ''}`}></div>

                                <span className={`text-sm font-bold tracking-wide z-10 ${selectedIds.length === 0 ? 'text-gray-500' : 'text-gray-200'}`}>
                                    {selectedIds.length === 0 ? 'SELECT APPLIANCES' : 'PARTIAL COMPLIANCE'}
                                </span>
                                {estimatedPoints > 0 && (
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-white z-10">
                                        +{estimatedPoints} PTS
                                    </span>
                                )}
                                {selectedIds.length > 0 && (
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform z-10" />
                                )}
                            </button>

                            <div
                                onClick={handleSkip}
                                className="w-full text-center cursor-pointer group"
                            >
                                <div className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase group-hover:text-red-400 transition-colors">
                                    <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-[8px] group-hover:border-red-500">2</div>
                                    Skip & Pay Penalty
                                </div>
                                <div className="mt-2 text-[9px] text-gray-600 font-medium">
                                    Reducing load stabilizes the grid and earns carbon credits.
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { useUserDashboard } from '../../hooks/useUserDashboard';
import { preselectAppliances, calculateComplianceLevel, calculatePoints, calculateEarlyActionBonus, calculateKwhSaved, getUnnecessaryOnAppliances } from '../../engine/ApplianceEngine';
import { GRID_DATA, formatHour, REWARD_CONFIG } from '../../engine/SimulationEngine';
import CountdownTimer from '../shared/CountdownTimer';

import MarketplaceModal from './MarketplaceModal';

const PeakHourModal = () => {
    const {
        isPeak, modalShouldOpen, currentReward, currentPenalty,
        setUserDecidedThisPeak, prependToFeed,
    } = useUserDashboard();

    const {
        modalActive,
        clearModal,
        appendDecision,
        preselectedApplianceIds,
        setPreselectedApplianceIds,
        sessionId
    } = useSimulation();

    const {
        appliances,
        turnOffAppliances,
        points,
        makeDecision,
        currentHour
    } = useUserDashboard();

    // ============================================================
    // Strict Mode Safe Preselection
    // ============================================================
    const hasConsumedPreselection = useRef(false);

    // Initialize state from props or context ONCE
    const [selectedIds, setSelectedIds] = useState(() => {
        // Priority 1: Context preselection (from Banner)
        if (preselectedApplianceIds.length > 0) return preselectedApplianceIds;

        // Priority 2: Auto-calculate (Default behavior)
        const reductionTarget = GRID_DATA[currentHour]?.reductionNeeded || 0;
        return preselectAppliances(appliances, reductionTarget).selectedIds;
    });

    // Clear context after consumption (Ref guarded for Strict Mode)
    useEffect(() => {
        if (!hasConsumedPreselection.current && preselectedApplianceIds.length > 0) {
            hasConsumedPreselection.current = true;
            setPreselectedApplianceIds([]); // Clear so it doesn't persist
        }
    }, [preselectedApplianceIds, setPreselectedApplianceIds]);

    const [showConfirmPenalty, setShowConfirmPenalty] = useState(false);
    const [decisionMade, setDecisionMade] = useState(false);
    const [view, setView] = useState('alert'); // 'alert' | 'marketplace'

    // Pre-select appliances when modal opens
    const unnecessaryOn = useMemo(() => getUnnecessaryOnAppliances(appliances), [appliances]);
    const reductionTarget = GRID_DATA[currentHour]?.reductionNeeded || 0; // Moved here to be accessible
    const preselection = useMemo(() => preselectAppliances(appliances, reductionTarget), [appliances, reductionTarget]);

    // Calculate compliance from current selection
    const selectedKw = useMemo(() => calculateKwhSaved(appliances, selectedIds), [appliances, selectedIds]);
    const compliance = useMemo(() => calculateComplianceLevel(selectedKw, reductionTarget), [selectedKw, reductionTarget]);
    const pointsToEarn = useMemo(() => calculatePoints(selectedKw, currentReward, reductionTarget), [selectedKw, currentReward, reductionTarget]);

    // Early action: all unnecessary already off
    const earlyActionBonus = useMemo(() => calculateEarlyActionBonus(appliances), [appliances]);
    const allUnnecessaryOff = unnecessaryOn.length === 0;

    const toggleSelection = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // ============================================================
    // Decision handlers
    // ============================================================
    const makeChoice = useCallback((choice, kwhSaved, points, penaltyAmount) => {
        if (decisionMade) return;
        setDecisionMade(true);

        // Read penalty at DECISION TIME from context, not render time
        const actualPenalty = choice === 'ignore' ? currentPenalty : penaltyAmount;

        // Update user state
        makeDecision(choice, kwhSaved, points, actualPenalty);

        // Add to allDecisions in SimulationContext
        appendDecision({
            userId: 'real_user',
            userName: '⭐ You',
            hour: currentHour,
            choice,
            kwhSaved,
            pointsEarned: points,
            penaltyApplied: actualPenalty,
            timestamp: formatHour(currentHour),
            selectedAppliances: selectedIds, // Record specific devices
            sessionId: sessionId,            // Track session context
        });

        // Prepend to admin feed immediately
        prependToFeed({
            userId: 'real_user',
            userName: '⭐ You',
            hour: currentHour,
            choice,
            kwhSaved,
            pointsEarned: points,
            penaltyApplied: actualPenalty,
            timestamp: formatHour(currentHour),
            isReal: true,
        });

        // Clear modal
        clearModal();
        setTimeout(() => setDecisionMade(false), 500);
    }, [currentHour, currentPenalty, makeDecision, appendDecision, prependToFeed, clearModal, decisionMade]);

    const handleOption1 = () => {
        if (selectedIds.length === 0) return;
        turnOffAppliances(selectedIds);
        makeChoice('comply', selectedKw, pointsToEarn, 0);
    };

    const handleOption2 = () => {
        if (!showConfirmPenalty) {
            setShowConfirmPenalty(true);
            return;
        }
        makeChoice('ignore', 0, 0, currentPenalty);
        setShowConfirmPenalty(false);
    };

    const handleOption3 = () => {
        setView('marketplace');
    };

    const handleMarketplacePurchase = (credits, cost) => {
        makeChoice('marketplace', 0, credits /* points earned = credits purchased */, 0);
    };

    const handleEarlyAction = () => {
        makeChoice('early_bonus', 0, earlyActionBonus, 0);
    };

    const handleTimerExpire = useCallback(() => {
        if (!decisionMade) {
            makeChoice('ignore', 0, 0, currentPenalty);
        }
    }, [decisionMade, currentPenalty, makeChoice]);

    if (!modalShouldOpen || !isPeak) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay — cannot dismiss */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-amber-500 rounded-t-3xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-3xl animate-pulse">warning</span>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">Peak Hour Alert</h2>
                                <p className="text-white/80 text-sm font-bold">{formatHour(currentHour)} — Grid under stress</p>
                            </div>
                        </div>
                        <CountdownTimer seconds={60} onExpire={handleTimerExpire} />
                    </div>

                    {/* Reward/Penalty info */}
                    <div className="flex gap-3 mt-4">
                        <div className="flex-1 bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                            <p className="text-[10px] font-black uppercase tracking-wider text-white/70">Reward</p>
                            <p className="text-2xl font-black">₹{currentReward}<span className="text-sm text-white/60">/kWh</span></p>
                        </div>
                        <div className="flex-1 bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                            <p className="text-[10px] font-black uppercase tracking-wider text-white/70">Penalty</p>
                            <p className="text-2xl font-black">₹{currentPenalty}</p>
                        </div>
                    </div>
                </div>

                {view === 'marketplace' ? (
                    <MarketplaceModal
                        onClose={() => setView('alert')}
                        onPurchase={handleMarketplacePurchase}
                        currentPoints={points}
                    />
                ) : (
                    /* Body */
                    <div className="p-6 space-y-4">
                        {/* Early Action Bonus — all unnecessary already off */}
                        {allUnnecessaryOff ? (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 animate-fade-in">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-emerald-600 text-2xl">check_circle</span>
                                    <div>
                                        <p className="font-black text-emerald-800 dark:text-emerald-300">Great Work!</p>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400">You've already turned off all unnecessary appliances</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleEarlyAction}
                                    className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25"
                                >
                                    Claim Early Action Bonus: +{earlyActionBonus} pts
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Option 1: Reduce Load */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-black uppercase tracking-wider text-sm flex items-center gap-2">
                                            <span className="w-6 h-6 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-xs font-black">1</span>
                                            Reduce My Load
                                        </h3>
                                        <span className={`text-xs font-black uppercase px-2 py-1 rounded-lg ${compliance.level === 'full' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                            compliance.level === 'partial' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                compliance.level === 'minimal' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-slate-100 text-slate-500'
                                            }`}>{compliance.label}</span>
                                    </div>

                                    {/* Reduction target */}
                                    <div className="mb-3 flex justify-between text-xs font-bold text-slate-500">
                                        <span>Target: {reductionTarget} kW</span>
                                        <span>Selected: {selectedKw} kW</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-4">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${compliance.ratio >= 1 ? 'bg-emerald-500' : compliance.ratio >= 0.5 ? 'bg-amber-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${Math.min(compliance.ratio * 100, 100)}%` }}
                                        />
                                    </div>

                                    {/* Appliance checkboxes */}
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {unnecessaryOn.map((a) => (
                                            <label
                                                key={a.id}
                                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedIds.includes(a.id)
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(a.id)}
                                                    onChange={() => toggleSelection(a.id)}
                                                    className="w-4 h-4 accent-primary"
                                                />
                                                <span className="material-symbols-outlined text-lg text-slate-500">{a.icon}</span>
                                                <span className="font-bold text-sm flex-1">{a.name}</span>
                                                <span className="text-xs font-black text-primary">{a.load_kw} kW</span>
                                            </label>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleOption1}
                                        disabled={selectedIds.length === 0}
                                        className={`w-full mt-3 py-3 rounded-xl font-black uppercase tracking-wider transition-all ${selectedIds.length === 0
                                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                            : compliance.level === 'full'
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600'
                                                : 'bg-amber-500 text-white shadow-lg shadow-amber-500/25 hover:bg-amber-600'
                                            }`}
                                    >
                                        {selectedIds.length === 0
                                            ? 'Select at least one appliance'
                                            : compliance.level === 'full'
                                                ? `Reduce & Earn +${pointsToEarn} pts`
                                                : `Partial Compliance: +${pointsToEarn} pts`
                                        }
                                    </button>
                                </div>

                                {/* Option 2: Pay Penalty */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                                    <h3 className="font-black uppercase tracking-wider text-sm flex items-center gap-2 mb-2">
                                        <span className="w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center text-xs font-black">2</span>
                                        Skip & Pay Penalty
                                    </h3>
                                    <p className="text-xs text-slate-500 mb-3">Continue using appliances. A penalty of ₹{currentPenalty} will be applied.</p>

                                    {showConfirmPenalty ? (
                                        <div className="flex gap-2">
                                            <button onClick={handleOption2} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black uppercase tracking-wider text-sm hover:bg-red-600 transition-all">
                                                Confirm: −₹{currentPenalty}
                                            </button>
                                            <button onClick={() => setShowConfirmPenalty(false)} className="py-3 px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-sm hover:bg-slate-300 transition-all">
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={handleOption2} className="w-full py-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-xl font-black uppercase tracking-wider text-sm hover:bg-red-200 dark:hover:bg-red-900/30 transition-all">
                                            Pay Penalty: −₹{currentPenalty}
                                        </button>
                                    )}
                                </div>

                                {/* Option 3: Marketplace */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                                    <h3 className="font-black uppercase tracking-wider text-sm flex items-center gap-2 mb-2">
                                        <span className="w-6 h-6 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xs font-black">3</span>
                                        Buy Green Energy
                                    </h3>
                                    <p className="text-xs text-slate-500 mb-3">Purchase renewable energy credits. No penalty, no grid reduction.</p>
                                    <button onClick={handleOption3} className="w-full py-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded-xl font-black uppercase tracking-wider text-sm hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-all">
                                        Open Marketplace
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Timer expiry notice */}
                        <p className="text-center text-[10px] font-bold text-slate-400 mt-2">
                            ⏱ If no selection is made, Option 2 (penalty) is applied automatically.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PeakHourModal;

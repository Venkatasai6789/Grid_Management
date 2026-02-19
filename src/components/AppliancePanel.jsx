import React, { useMemo } from 'react';
import { useUserDashboard } from '../hooks/useUserDashboard';
import { getComplianceStreak } from '../engine/ApplianceEngine';

// ============================================================
// Internal Sub-components
// ============================================================

// ============================================================
// Internal Sub-components
// ============================================================

const ApplianceSkeleton = () => (
    <div className="animate-pulse space-y-4">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-surface-card rounded-xl w-full" />
        ))}
    </div>
);

const GWOSuggestionBanner = ({ suggestion, onApply, currentReward }) => (
    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h4 className="font-bold text-primary-light flex items-center gap-2 text-lg">
                    <span className="text-2xl">💡</span> GWO Suggests: Turn off {suggestion.applianceNames.join(' + ')}
                </h4>
                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-sm text-primary-light/80">
                    <span className="flex items-center gap-1">
                        <span className="font-semibold">Saves {suggestion.totalKw.toFixed(2)} kW</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="font-semibold">Earn ₹{suggestion.rewardValue}</span>
                    </span>
                    <span className="flex items-center gap-1 opacity-80">
                        Covers {suggestion.coveragePercent}% of grid reduction
                    </span>
                </div>
                <div className="mt-2 text-xs font-medium text-google-yellow flex items-center gap-1.5 bg-google-yellow/10 px-2.5 py-1 rounded-full w-fit border border-google-yellow/20">
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                    Obedience {(suggestion.obedienceRate * 100).toFixed(0)}% — GWO set reward ₹{currentReward}/kWh to incentivize action
                </div>
            </div>

            <button
                onClick={onApply}
                className="whitespace-nowrap bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-bold shadow-sm hover:shadow transition-all active:scale-95 flex items-center gap-2"
            >
                Apply Suggestion
                <span className="material-symbols-outlined text-sm">check_circle</span>
            </button>
        </div>
    </div>
);

const EarlyActionBonus = () => (
    <div className="bg-google-green/10 border border-google-green/20 rounded-xl p-4 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-google-green/20 flex items-center justify-center text-2xl">
            🏆
        </div>
        <div>
            <h4 className="font-bold text-google-green">All unnecessary appliances already off!</h4>
            <p className="text-sm text-google-green/80">
                You acted early! Bonus points claimed automatically.
            </p>
        </div>
    </div>
);

const EnergySavedTicker = ({ currentHour, autoOffHour, loadKw }) => {
    // Hidden on the decision hour (0-hour duration)
    if (autoOffHour === null || currentHour === autoOffHour) return null;

    const hoursSaved = Math.max(currentHour - autoOffHour, 0);
    const kwhSaved = (hoursSaved * loadKw).toFixed(2);

    return (
        <div className="text-xs text-google-green font-medium flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[10px]">savings</span>
            Saved so far: {kwhSaved} kWh
        </div>
    );
};

// ============================================================
// Main Component
// ============================================================

export default function AppliancePanel() {
    const {
        appliances,
        isPeak,
        userDecidedThisPeak,
        currentLoad, // Number
        totalLoadDisplay, // { current, baseline, delta }
        reducibleLoad,
        peakRewardValue,
        smartSuggestion,
        currentReward,
        co2Context,
        setPreselectedApplianceIds,
        forceOpenModal,
        modalActive,
        toggleAppliance,
        reductionContribution,
        allDecisions,
        sessionId,
        currentHour,
    } = useUserDashboard();

    // 1. Loading State
    if (!appliances || (Array.isArray(appliances) && appliances.length === 0)) {
        return <ApplianceSkeleton />;
    }

    // 2. View Logic
    const view = !isPeak ? 'NORMAL'
        : !userDecidedThisPeak ? 'PEAK_URGENCY'
            : 'POST_DECISION';

    // 3. Sorted Appliances (Memoized)
    const sortedAppliances = useMemo(() => {
        if (!isPeak) return appliances;

        // Skip sort if nothing actionable to prioritize (early return)
        if (!appliances.some(a => a.type === 'unnecessary' && a.status === 'on')) {
            return appliances;
        }

        return [...appliances].sort((a, b) => {
            // Unnecessary & ON -> To the top
            const aUrgent = a.type === 'unnecessary' && a.status === 'on';
            const bUrgent = b.type === 'unnecessary' && b.status === 'on';
            if (aUrgent && !bUrgent) return -1;
            if (!aUrgent && bUrgent) return 1;

            // Then by Priority (1 = Highest importance to grid = Turn off first)
            return a.priority - b.priority;
        });
    }, [appliances, isPeak]);

    // 4. Streak Map (Memoized to avoid 8x re-render cost)
    const streakMap = useMemo(() => {
        if (view !== 'POST_DECISION') return {};
        return Object.fromEntries(
            appliances.map(a => [a.id, getComplianceStreak(a.id, allDecisions, sessionId)])
        );
    }, [appliances, allDecisions, sessionId, view]);

    // 5. Handlers
    const handleApplySuggestion = () => {
        setPreselectedApplianceIds(smartSuggestion.selectedIds);
        forceOpenModal();
    };

    return (
        <div className="space-y-6">

            {/* --- GWO Banner (Peak + Not Decided + Modal Closed) --- */}
            {view === 'PEAK_URGENCY' && !modalActive && (
                smartSuggestion.selectedIds.length > 0 ? (
                    <GWOSuggestionBanner
                        suggestion={smartSuggestion}
                        onApply={handleApplySuggestion}
                        currentReward={currentReward}
                    />
                ) : (
                    <EarlyActionBonus />
                )
            )}

            {/* --- Appliance Grid/Table --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sortedAppliances.map((app) => {
                    const isUrgent = view === 'PEAK_URGENCY' && app.type === 'unnecessary' && app.status === 'on';
                    const isOn = app.status === 'on';
                    const isAutoOff = app.status === 'auto-off';
                    const isLocked = !app.controllable || isAutoOff;

                    return (
                        <div
                            key={app.id}
                            className={`
                                relative bg-surface-card rounded-2xl p-4 border transition-all duration-300 group
                                ${isUrgent
                                    ? 'border-google-red/50 shadow-[0_0_20px_rgba(234,67,53,0.3)] pulse-red-border'
                                    : isOn
                                        ? 'border-google-blue/30 shadow-[0_0_15px_rgba(66,133,244,0.15)]'
                                        : 'border-white/5 shadow-sm hover:border-white/10'
                                }
                                ${isAutoOff ? 'bg-primary/5' : ''}
                            `}
                        >
                            {/* Header: Icon + Name + Badge */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`text-3xl filter transition-all duration-300 ${isOn ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'opacity-70 grayscale'}`}>
                                        {app.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground text-sm leading-tight flex items-center gap-2">
                                            {app.name}
                                            {isOn && <span className="w-1.5 h-1.5 rounded-full bg-google-green animate-pulse"></span>}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md ${app.type === 'necessary'
                                                ? 'bg-surface-highlight text-foreground/60'
                                                : 'bg-google-yellow/10 text-google-yellow'
                                                }`}>
                                                {app.type}
                                            </span>
                                            {isAutoOff && (
                                                <span className="badge-auto-off text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 text-primary bg-primary/10">
                                                    <span className="material-symbols-outlined text-[10px]">check</span> Auto-Off
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-black transition-colors ${isOn ? 'text-white' : 'text-foreground/40'}`}>
                                        {app.load_kw} kW
                                    </div>
                                    <div className="text-[10px] text-foreground/50 font-medium">Load</div>
                                </div>
                            </div>

                            {/* Middle: Stats Row */}
                            <div className="flex items-center justify-between py-3 border-t border-white/5">
                                {view === 'PEAK_URGENCY' ? (
                                    <>
                                        <div className="text-xs text-foreground/60">
                                            If OFF: <span className="font-bold text-google-green">Save {app.peakSavingIfOff} kW</span>
                                        </div>
                                        <div className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                            Earn ₹{Math.round(app.peakSavingIfOff * currentReward)}
                                        </div>
                                    </>
                                ) : view === 'POST_DECISION' && isAutoOff ? (
                                    <>
                                        <div className="text-xs text-foreground/60">
                                            Earned <span className="font-bold text-google-yellow">+{Math.round(app.load_kw * currentReward * 1.5)} pts</span>
                                        </div>
                                        {streakMap[app.id] > 0 && (
                                            <div className="text-[10px] font-bold text-orange-500 flex items-center gap-1">
                                                🔥 {streakMap[app.id]} streak
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    // Normal View
                                    <>
                                        <div className="text-xs text-foreground/60">
                                            Baseline <span className="font-medium text-foreground/80">₹{app.monthly_baseline_cost}/mo</span>
                                        </div>
                                        {app.co2_per_hour > 0.5 && (
                                            <div className="text-[10px] text-foreground/50 flex items-center gap-1" title="High Carbon Intensity">
                                                <span className="material-symbols-outlined text-[12px]">cloud</span> High CO₂
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Footer: Action / Ticker */}
                            <div className="pt-1">
                                {isAutoOff ? (
                                    <div className="w-full bg-surface-highlight rounded-lg p-2 text-center border border-white/5">
                                        <div className="text-xs font-semibold text-primary mb-0.5">
                                            Optimization Active
                                        </div>
                                        <EnergySavedTicker
                                            currentHour={currentHour}
                                            autoOffHour={app.autoOffHour}
                                            loadKw={app.load_kw}
                                        />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => toggleAppliance(app.id)}
                                        disabled={isLocked}
                                        className={`
                                            w-full py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95
                                            ${isOn
                                                ? 'bg-surface-highlight hover:bg-white/10 text-foreground/60 border border-white/5'
                                                : 'bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-primary/25'
                                            }
                                            ${isLocked ? 'opacity-50 cursor-not-allowed active:scale-100' : ''}
                                        `}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${isOn ? 'bg-google-green' : 'bg-white/30'}`} />
                                        {isOn ? 'Turn Off' : 'Turn On'}
                                        {!app.controllable && <span className="material-symbols-outlined text-xs ml-auto">lock</span>}
                                    </button>
                                )}
                            </div>

                        </div>
                    );
                })}
            </div>

            {/* --- Live Load Bar & Summary Stats --- */}
            <div className="bg-surface-card rounded-2xl p-6 border border-white/5 shadow-sm space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                {/* 1. Live Load Bar */}
                <div className="space-y-3 relative z-10">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-foreground/60">
                        <span>Real-Time Load</span>
                        <span className={isPeak ? "text-primary" : ""}>
                            Your contribution: {reductionContribution}% of reduction need
                        </span>
                    </div>
                    <div className="h-6 bg-surface-highlight rounded-full overflow-hidden flex relative ring-2 ring-surface-card">
                        {/* Baseline Shadow */}
                        {totalLoadDisplay.delta > 0 && (
                            <div
                                className="absolute h-full bg-white/5 blur-[2px]"
                                style={{ width: `${(totalLoadDisplay.baseline / 10) * 100}%` }}
                            />
                        )}
                        {/* Current Load */}
                        <div
                            className="h-full bg-gradient-to-r from-google-blue to-cyan-400 load-bar-fill relative z-10 shadow-[0_0_15px_rgba(66,133,244,0.4)]"
                            style={{ width: `${(totalLoadDisplay.current / 10) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-foreground/80">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{totalLoadDisplay.current} kW</span>
                            {totalLoadDisplay.delta > 0 && (
                                <span className="text-google-green text-xs bg-google-green/10 px-1.5 py-0.5 rounded border border-google-green/20">
                                    ↓ {totalLoadDisplay.delta} kW reduced
                                </span>
                            )}
                        </div>
                        <span className="text-foreground/40 text-xs font-mono">
                            BASELINE: {totalLoadDisplay.baseline} kW
                        </span>
                    </div>
                </div>

                {/* 2. Summary Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5 relative z-10">
                    <div className="p-3 bg-surface-highlight/50 rounded-xl border border-white/5 backdrop-blur-sm">
                        <div className="text-[10px] text-foreground/50 uppercase font-bold tracking-wider mb-1">Total Active Load</div>
                        <div className="text-lg font-black text-white">{totalLoadDisplay.current} kW</div>
                    </div>
                    <div className="p-3 bg-surface-highlight/50 rounded-xl border border-white/5 backdrop-blur-sm">
                        <div className="text-[10px] text-foreground/50 uppercase font-bold tracking-wider mb-1">Reducible Now</div>
                        <div className="text-lg font-black text-white">{reducibleLoad.toFixed(2)} kW</div>
                    </div>
                    <div className={`p-3 rounded-xl transition-colors border ${view === 'PEAK_URGENCY' ? 'bg-google-green/10 border-google-green/30 pulse-green-border' : 'bg-surface-highlight/50 border-white/5'}`}>
                        <div className="text-[10px] text-google-green uppercase font-bold tracking-wider mb-1">Peak Reward</div>
                        <div className="text-lg font-black text-google-green">
                            ₹{peakRewardValue}
                            <span className="text-[10px] font-normal text-foreground/50 ml-1">at ₹{currentReward}/kW</span>
                        </div>
                    </div>
                    <div className="p-3 bg-surface-highlight/50 rounded-xl border border-white/5 backdrop-blur-sm">
                        <div className="text-[10px] text-foreground/50 uppercase font-bold tracking-wider mb-1">CO₂ Impact</div>
                        <div className="text-lg font-black text-white leading-tight">
                            {co2Context.treesPerYear} <span className="text-xs font-normal text-foreground/60">trees/yr</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

import { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useGWO } from '../context/GWOContext';
import { useUser } from '../context/UserContext';
import { GRID_DATA } from '../engine/SimulationEngine';
import {
    getTotalLoad,
    getTotalLoadWithDelta,
    getReducibleLoad,
    getPeakRewardValue,
    getCO2WithContext,
    getReductionContribution,
    buildSmartSuggestion
} from '../engine/ApplianceEngine';

/**
 * useUserDashboard — Aggregates state for user-facing dashboard
 * No direct multi-context calls in dashboard component
 */
export function useUserDashboard() {
    const sim = useSimulation();
    const gwo = useGWO();
    const user = useUser();

    // Derived: hours until next peak
    const hoursUntilPeak = useMemo(() => {
        for (let i = 1; i <= 24; i++) {
            const h = (sim.currentHour + i) % 24;
            if (GRID_DATA[h].isPeak) return i;
        }
        return null;
    }, [sim.currentHour]);

    // Derived: show peak warning (1-2 hours before peak)
    const showPeakWarning = useMemo(() => {
        return hoursUntilPeak !== null && hoursUntilPeak <= 2 && !sim.isPeak;
    }, [hoursUntilPeak, sim.isPeak]);

    // Derived: current total appliance load (number)
    const currentLoad = useMemo(() => getTotalLoad(user.appliances), [user.appliances]);

    // NEW: User contribution stats
    const totalLoadDisplay = useMemo(() => getTotalLoadWithDelta(user.appliances), [user.appliances]);
    const reducibleLoad = useMemo(() => getReducibleLoad(user.appliances), [user.appliances]);
    const co2Context = useMemo(() => getCO2WithContext(user.appliances), [user.appliances]);

    const peakRewardValue = useMemo(() =>
        getPeakRewardValue(user.appliances, gwo.currentReward),
        [user.appliances, gwo.currentReward]);

    // Derived: reduction target for current hour
    const reductionTarget = useMemo(() => {
        return GRID_DATA[sim.currentHour]?.reductionNeeded || 0;
    }, [sim.currentHour]);

    const reductionContribution = useMemo(() =>
        // Using totalLoadDisplay.delta to calculate current contribution
        getReductionContribution(totalLoadDisplay.delta, reductionTarget),
        [totalLoadDisplay.delta, reductionTarget]
    );

    // Smart Suggestion object
    const smartSuggestion = useMemo(() =>
        buildSmartSuggestion(user.appliances, reductionTarget, gwo.currentReward, sim.obedienceRate),
        [user.appliances, reductionTarget, gwo.currentReward, sim.obedienceRate]);

    // Derived: user's transactions from allDecisions
    // Derived: user's transactions from allDecisions AND customTransactions
    const transactions = useMemo(() => {
        const simTransactions = sim.allDecisions
            .filter((d) => !d.isNPC)
            .map((d) => ({
                id: `${d.hour}-${d.timestamp}`,
                hour: d.hour,
                timestamp: d.timestamp,
                type: d.choice === 'comply' ? 'REWARD' : d.choice === 'marketplace' ? 'MARKETPLACE' : 'PENALTY',
                amount: d.choice === 'comply' ? d.pointsEarned : -(d.penaltyApplied || 0),
                kwhSaved: d.kwhSaved || 0,
                description: d.choice === 'comply'
                    ? `Reduced load during peak hour ${d.hour}:00`
                    : d.choice === 'marketplace'
                        ? `Energy marketplace trade — hour ${d.hour}:00`
                        : `Non-compliance penalty — peak hour ${d.hour}:00`,
                rawTime: new Date().setHours(d.hour, 0, 0, 0) // Approximation for sorting if needed, though we rely on list order mostly
            }));

        const manualTransactions = user.customTransactions.map(t => ({
            ...t,
            kwhSaved: 0,
            rawTime: Date.now() // Always newer
        }));

        // Merge and sort roughly by "recency" (assuming sim decisions happen in order, and manual happen 'now')
        // Ideally we'd have real timestamps on everything. For now, we prepend manual ones if they are "new".
        // A simple generic sort might be tricky without unified time. 
        // Let's just concat: Manual (newest) + Sim (newest to oldest or vice versa).
        // Actually `sim.allDecisions` grows. 

        return [...manualTransactions, ...simTransactions.reverse()];
    }, [sim.allDecisions, user.customTransactions]);

    // Derived: current grid load for this hour
    const currentGridLoad = useMemo(() => {
        const latest = sim.hourlyLoadHistory[sim.hourlyLoadHistory.length - 1];
        return latest || { actualLoad: GRID_DATA[sim.currentHour].base_load_kw, loadPercentage: 50, stressLevel: 'normal' };
    }, [sim.hourlyLoadHistory, sim.currentHour]);

    return {
        // Simulation state
        currentHour: sim.currentHour,
        isPeak: sim.isPeak,
        modalShouldOpen: sim.modalShouldOpen,
        modalActive: sim.modalActive,
        simulationComplete: sim.simulationComplete,
        hourlyLoadHistory: sim.hourlyLoadHistory,
        obedienceRate: sim.obedienceRate, // From SimCtx
        sessionId: sim.sessionId,
        preselectedApplianceIds: sim.preselectedApplianceIds,
        // Derived
        hoursUntilPeak,
        showPeakWarning,
        currentLoad, // Number
        totalLoadDisplay, // Object {current, baseline, delta}
        reducibleLoad,
        peakRewardValue,
        co2Context,
        currentGridLoad,
        reductionTarget,
        reductionContribution,
        smartSuggestion,
        transactions,
        // User state
        points: user.points,
        penalty: user.penalty,
        credits: user.credits,
        totalKwhSaved: user.totalKwhSaved,
        dailyConsumption: user.dailyConsumption,
        appliances: user.appliances,
        userDecidedThisPeak: user.userDecidedThisPeak,
        // User actions
        toggleAppliance: user.toggleAppliance,
        turnOffAppliances: user.turnOffAppliances,
        restoreAutoOff: user.restoreAutoOff,
        makeDecision: user.makeDecision,
        setUserDecidedThisPeak: user.setUserDecidedThisPeak,
        addCredits: user.addCredits,
        redeemPoints: user.redeemPoints,
        // GWO (for modal — read at decision time)
        currentReward: gwo.currentReward,
        currentPenalty: gwo.currentPenalty,
        // Sim actions (for modal)
        appendDecision: sim.appendDecision,
        clearModal: sim.clearModal,
        forceOpenModal: sim.forceOpenModal,
        setPreselectedApplianceIds: sim.setPreselectedApplianceIds,
        prependToFeed: gwo.prependToFeed,
        allDecisions: sim.allDecisions, // Exposed for streaks
    };
}

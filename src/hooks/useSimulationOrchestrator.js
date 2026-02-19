import { useCallback, useEffect, useRef } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useGWO } from '../context/GWOContext';
import { useUser } from '../context/UserContext';
import {
    generateSimulatedDecisions,
    calculateCurrentGridLoad,
    updatePersonaStats,
    GRID_DATA,
} from '../engine/SimulationEngine';
import { getTotalLoad } from '../engine/ApplianceEngine';

/**
 * useSimulationOrchestrator — Cross-context coordination
 * Consumed by: AdminDashboardPage, auto-run system
 * NOT consumed directly by user dashboard components
 */
export function useSimulationOrchestrator() {
    const sim = useSimulation();
    const gwo = useGWO();
    const user = useUser();

    // ============================================================
    // Ref pattern: stable auto-run interval (no drift on hour change)
    // ============================================================
    const modalActiveRef = useRef(sim.modalActive);
    useEffect(() => { modalActiveRef.current = sim.modalActive; }, [sim.modalActive]);

    const advanceHour = useCallback(() => {
        if (modalActiveRef.current) return;
        if (sim.simulationComplete) return;

        const nextHour = Math.min(sim.currentHour + 1, 23);
        if (nextHour === sim.currentHour) return;

        // 0. Track User Consumption for the passing hour
        // We use the *current* state of appliances to estimate load for the hour ending
        const currentUserLoad = getTotalLoad(user.appliances);
        user.updateConsumption(currentUserLoad);

        // 1. Generate NPC decisions
        const { decisions: npcDecisions, compliance } = generateSimulatedDecisions(
            nextHour,
            gwo.currentReward,
            gwo.currentPenalty,
            sim.simulatedPersonas
        );

        // 2. Calculate grid load with direct NPC input (fresh data, no stale state)
        const gridLoad = calculateCurrentGridLoad(
            nextHour,
            [...sim.allDecisions, ...npcDecisions]
        );

        // 3. Advance clock — handles modal trigger, peak transitions
        sim.advanceClock(nextHour, npcDecisions, gridLoad);

        // 4. Update NPC persona accumulated stats
        if (npcDecisions.length > 0) {
            const updatedPersonas = updatePersonaStats(
                sim.simulatedPersonas,
                npcDecisions,
                gwo.currentPenalty
            );
            sim.updatePersonas(updatedPersonas);
        }

        // 5. Trigger GWO if entering peak hour
        const wasJustPeak = GRID_DATA[sim.currentHour]?.isPeak || false;
        const isNextPeak = GRID_DATA[nextHour]?.isPeak || false;
        if (isNextPeak) {
            gwo.triggerGWO(compliance || sim.obedienceRate, gridLoad.gridStressNormalized, nextHour);
        }

        // 6. Stagger NPC decisions into feed
        if (npcDecisions.length > 0) {
            gwo.startNPCFeedDispatch(npcDecisions);
        }
    }, [sim, gwo]);

    // ============================================================
    // Stable auto-run interval via ref (no drift)
    // ============================================================
    const advanceHourRef = useRef(advanceHour);
    useEffect(() => { advanceHourRef.current = advanceHour; }, [advanceHour]);

    useEffect(() => {
        if (!sim.autoRun) return;
        const id = setInterval(() => {
            if (!modalActiveRef.current) {
                advanceHourRef.current();
            }
        }, 10000);
        return () => clearInterval(id);
    }, [sim.autoRun]); // Only recreates when autoRun toggles

    // ============================================================
    // Reset all state across all contexts
    // ============================================================
    const resetAll = useCallback(() => {
        sim.resetSimulation();
        gwo.resetGWO();
        user.resetUser();
    }, [sim, gwo, user]);

    return {
        advanceHour,
        resetAll,
        canAdvanceHour: !sim.simulationComplete && !sim.modalActive,
        isAutoRunning: sim.autoRun,
        toggleAutoRun: () => sim.setAutoRun(!sim.autoRun),
        jumpToPrePeak: () => sim.jumpToHour(17),
        jumpToMorningPeak: () => sim.jumpToHour(6),
    };
}

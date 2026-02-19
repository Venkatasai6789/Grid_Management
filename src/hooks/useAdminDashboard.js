import { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useGWO } from '../context/GWOContext';
import { useUser } from '../context/UserContext';
import { aggregateComplianceByHour, GRID_DATA, formatHour } from '../engine/SimulationEngine';

/**
 * useAdminDashboard — Aggregates state for admin control room
 */
export function useAdminDashboard() {
    const sim = useSimulation();
    const gwo = useGWO();
    const user = useUser();

    // Derived: compliance breakdown per hour for chart
    const complianceByHour = useMemo(
        () => aggregateComplianceByHour(sim.allDecisions),
        [sim.allDecisions]
    );

    // Derived: leaderboard (NPC personas + real user, sorted by points)
    const leaderboard = useMemo(() => {
        const npcEntries = sim.simulatedPersonas.map((p) => ({
            id: p.id,
            name: p.name,
            points: p.accumulatedPoints,
            penalty: p.accumulatedPenalty,
            compliance: p.totalDecisions > 0 ? (p.complianceCount / p.totalDecisions * 100).toFixed(0) : '—',
            isReal: false,
        }));

        const realEntry = {
            id: 'real_user',
            name: '⭐ You',
            points: user.points,
            penalty: user.penalty,
            compliance: '—',
            isReal: true,
        };

        return [realEntry, ...npcEntries].sort((a, b) => b.points - a.points);
    }, [sim.simulatedPersonas, user.points, user.penalty]);

    // Derived: grid stress color for status
    const gridStressColor = useMemo(() => {
        const latest = sim.hourlyLoadHistory[sim.hourlyLoadHistory.length - 1];
        if (!latest) return '#22c55e'; // green
        if (latest.stressLevel === 'critical') return '#ef4444'; // red
        if (latest.stressLevel === 'warning') return '#f59e0b'; // amber
        return '#22c55e'; // green
    }, [sim.hourlyLoadHistory]);

    // Derived: total grid stats
    const gridStats = useMemo(() => {
        const totalComplied = sim.allDecisions.filter((d) => d.choice === 'comply').length;
        const totalIgnored = sim.allDecisions.filter((d) => d.choice === 'ignore').length;
        const totalMarketplace = sim.allDecisions.filter((d) => d.choice === 'marketplace').length;
        const total = sim.allDecisions.length;
        const kwhSaved = sim.allDecisions
            .filter((d) => d.choice === 'comply')
            .reduce((sum, d) => sum + (d.kwhSaved || 0), 0);

        return {
            totalDecisions: total,
            totalComplied,
            totalIgnored,
            totalMarketplace,
            overallCompliance: total > 0 ? ((totalComplied / total) * 100).toFixed(1) : '0.0',
            totalKwhSaved: Math.round(kwhSaved * 10) / 10,
        };
    }, [sim.allDecisions]);

    // Derived: can admin override rates?
    const canOverrideRates = !sim.modalActive;

    return {
        // Simulation
        currentHour: sim.currentHour,
        isPeak: sim.isPeak,
        autoRun: sim.autoRun,
        simulationComplete: sim.simulationComplete,
        modalActive: sim.modalActive,
        obedienceRate: sim.obedienceRate,
        hourlyLoadHistory: sim.hourlyLoadHistory,
        simulatedPersonas: sim.simulatedPersonas,
        // GWO
        currentReward: gwo.currentReward,
        currentPenalty: gwo.currentPenalty,
        fitnessScore: gwo.fitnessScore,
        wolfPositions: gwo.wolfPositions,
        hourlyHistory: gwo.hourlyHistory,
        gwoLog: gwo.gwoLog,
        gwoStatus: gwo.gwoStatus,
        lastAction: gwo.lastAction,
        decisionFeed: gwo.decisionFeed,
        // Derived
        complianceByHour,
        leaderboard,
        gridStressColor,
        gridStats,
        canOverrideRates,
        // Actions
        overrideRates: (reward, penalty) => gwo.overrideRates(reward, penalty, sim.modalActive),
    };
}

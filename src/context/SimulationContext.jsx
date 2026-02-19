import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { INITIAL_SIMULATION_STATE } from '../data/initialState';
import { GRID_DATA, buildSyntheticHistory, generateSyntheticDecisionsForHistory } from '../engine/SimulationEngine';
import { useUser } from './UserContext';
import { useGWO } from './GWOContext';

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
    // INITIAL_SIMULATION_STATE now includes sessionId and preselectedApplianceIds
    // We override sessionId on mount to ensure freshness if needed, but Date.now() in file is static.
    // Better to init state function or overwrite in reset.
    const [state, setState] = useState(() => ({
        ...INITIAL_SIMULATION_STATE,
        sessionId: Date.now(), // Dynamic init
    }));

    // ============================================================
    // Read userDecidedThisPeak and restoreAutoOff via ref
    // ============================================================
    const { userDecidedThisPeak, setUserDecidedThisPeak, restoreAutoOff } = useUser();

    const userDecidedThisPeakRef = useRef(userDecidedThisPeak);
    useEffect(() => {
        userDecidedThisPeakRef.current = userDecidedThisPeak;
    }, [userDecidedThisPeak]);

    const restoreAutoOffRef = useRef(restoreAutoOff);
    useEffect(() => {
        restoreAutoOffRef.current = restoreAutoOff;
    }, [restoreAutoOff]);

    // ============================================================
    // GWO context setters for jumpToHour
    // ============================================================
    const { setHourlyHistory, setCurrentReward, setCurrentPenalty, setWolfPositions } = useGWO();

    // ============================================================
    // advanceClock — called by orchestrator, NOT directly by components
    // ============================================================
    const advanceClock = useCallback((nextHour, npcDecisions, gridLoad) => {
        setState((prev) => {
            if (prev.simulationComplete) return prev;

            const wasJustPeak = GRID_DATA[prev.currentHour]?.isPeak || false;
            const isNextPeak = GRID_DATA[nextHour]?.isPeak || false;
            const alreadyDecided = userDecidedThisPeakRef.current;

            // Modal trigger: only on ENTERING peak, not during ongoing peak
            const shouldOpenModal = !wasJustPeak && isNextPeak && !alreadyDecided;

            // Reset userDecidedThisPeak and restore appliances when EXITING peak
            if (wasJustPeak && !isNextPeak) {
                setUserDecidedThisPeak(false);
                restoreAutoOffRef.current(); // Restore auto-off appliances
            }

            // Calculate obedience from NPC decisions
            const complied = npcDecisions.filter((d) => d.choice === 'comply').length;
            const total = npcDecisions.length;
            const obedience = total > 0 ? complied / total : prev.obedienceRate;

            return {
                ...prev,
                currentHour: nextHour,
                isPeak: isNextPeak,
                modalShouldOpen: shouldOpenModal,
                modalActive: shouldOpenModal ? true : prev.modalActive,
                simulationComplete: nextHour >= 23,
                obedienceRate: obedience,
                allDecisions: [...prev.allDecisions, ...npcDecisions],
                hourlyLoadHistory: [
                    ...prev.hourlyLoadHistory,
                    {
                        hour: nextHour,
                        actualLoad: gridLoad.actualLoad,
                        baseLoad: gridLoad.baseLoad,
                        stressLevel: gridLoad.stressLevel,
                        loadPercentage: gridLoad.loadPercentage,
                    },
                ],
            };
        });
    }, [setUserDecidedThisPeak]);

    // ============================================================
    // Force open modal (from Smart Suggestion Banner)
    // Functional update guards against double-open/stale state
    // ============================================================
    const forceOpenModal = useCallback(() => {
        setState((prev) => {
            if (prev.modalActive) return prev; // Already open
            return { ...prev, modalShouldOpen: true, modalActive: true };
        });
    }, []);

    // ============================================================
    // Set preselected appliances (from Smart Suggestion Banner)
    // ============================================================
    const setPreselectedApplianceIds = useCallback((ids) => {
        setState((prev) => ({ ...prev, preselectedApplianceIds: ids }));
    }, []);

    // ============================================================
    // Append a single real-user decision to allDecisions
    // ============================================================
    const appendDecision = useCallback((decision) => {
        setState((prev) => ({
            ...prev,
            allDecisions: [...prev.allDecisions, { ...decision, isNPC: false }],
        }));
    }, []);

    // ============================================================
    // Update NPC persona accumulated stats
    // ============================================================
    const updatePersonas = useCallback((updatedPersonas) => {
        setState((prev) => ({ ...prev, simulatedPersonas: updatedPersonas }));
    }, []);

    // ============================================================
    // Clear modal flags — called by PeakHourModal on decision
    // ============================================================
    const clearModal = useCallback(() => {
        setState((prev) => ({
            ...prev,
            modalShouldOpen: false,
            modalActive: false,
        }));
    }, []);

    // ============================================================
    // jumpToHour — fast-forward with synthetic GWO backstory
    // ============================================================
    const jumpToHour = useCallback((targetHour) => {
        if (targetHour < 0 || targetHour > 23) return;

        const syntheticHistory = buildSyntheticHistory(targetHour, 10, 10);
        setHourlyHistory(syntheticHistory);

        // If jumping past morning peak, set intermediate GWO values
        if (targetHour > 9) {
            setCurrentReward(15);
            setCurrentPenalty(20);
            // Set synthetic wolf positions to show "optimization" happened
            setWolfPositions({
                alpha: { x: 15, y: 20 },
                beta: { x: 18, y: 25 },
                delta: { x: 12, y: 30 },
            });
        }

        // Generate synthetic decisions for past peak hours to populate charts
        const syntheticDecisions = generateSyntheticDecisionsForHistory(targetHour, state.simulatedPersonas);

        setState((prev) => ({
            ...prev,
            currentHour: targetHour,
            isPeak: GRID_DATA[targetHour]?.isPeak || false,
            modalShouldOpen: false,
            modalActive: false,
            simulationComplete: targetHour >= 23,
            obedienceRate: targetHour > 9 ? 0.40 : 0,
            allDecisions: syntheticDecisions, // Replace with synthetic history
            hourlyLoadHistory: Array.from({ length: targetHour }, (_, h) => ({
                hour: h,
                actualLoad: GRID_DATA[h].base_load_kw,
                baseLoad: GRID_DATA[h].base_load_kw,
                stressLevel: 'normal',
                loadPercentage: Math.round((GRID_DATA[h].base_load_kw / (185 * 1.2)) * 100),
            })),
        }));

        setUserDecidedThisPeak(false);
        restoreAutoOffRef.current(); // Restore if jumping out of peak
    }, [state.simulatedPersonas, setHourlyHistory, setCurrentReward, setCurrentPenalty, setWolfPositions, setUserDecidedThisPeak]);

    // ============================================================
    // Toggle auto-run
    // ============================================================
    const setAutoRun = useCallback((value) => {
        setState((prev) => ({ ...prev, autoRun: value }));
    }, []);

    // ============================================================
    // Reset
    // ============================================================
    const resetSimulation = useCallback(() => {
        setState({
            ...INITIAL_SIMULATION_STATE,
            sessionId: Date.now(), // Regenerate session ID
        });
        setUserDecidedThisPeak(false);
        restoreAutoOffRef.current(); // Ensure clean slate
    }, [setUserDecidedThisPeak]);

    const value = {
        ...state,
        advanceClock,
        appendDecision,
        updatePersonas,
        clearModal,
        forceOpenModal,
        setPreselectedApplianceIds,
        jumpToHour,
        setAutoRun,
        resetSimulation,
    };

    return (
        <SimulationContext.Provider value={value}>
            {children}
        </SimulationContext.Provider>
    );
}

export function useSimulation() {
    const ctx = useContext(SimulationContext);
    if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
    return ctx;
}

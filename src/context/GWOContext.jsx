import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { INITIAL_GWO_STATE } from '../data/initialState';
import { runGWO } from '../engine/GWOAlgorithm';

const GWOContext = createContext(null);

export function GWOProvider({ children }) {
    const [state, setState] = useState(INITIAL_GWO_STATE);

    // ============================================================
    // Ref-based NPC feed dispatch — no useEffect, no timer duplication
    // ============================================================
    const isDispatchingRef = useRef(false);
    const dispatchTimersRef = useRef([]);

    const startNPCFeedDispatch = useCallback((decisions) => {
        if (isDispatchingRef.current || !decisions || decisions.length === 0) return;
        isDispatchingRef.current = true;

        // Clear any lingering timers
        dispatchTimersRef.current.forEach(clearTimeout);
        dispatchTimersRef.current = [];

        decisions.forEach((d, i) => {
            const timerId = setTimeout(() => {
                setState((prev) => ({
                    ...prev,
                    decisionFeed: [
                        {
                            userId: d.userId,
                            userName: d.userName,
                            hour: d.hour,
                            choice: d.choice,
                            kwhSaved: d.kwhSaved,
                            pointsEarned: d.pointsEarned,
                            penaltyApplied: d.penaltyApplied,
                            timestamp: d.timestamp,
                            isNPC: true,
                        },
                        ...prev.decisionFeed,
                    ].slice(0, 50), // Cap at 50 entries
                }));

                if (i === decisions.length - 1) {
                    isDispatchingRef.current = false;
                }
            }, i * 800);
            dispatchTimersRef.current.push(timerId);
        });
    }, []);

    // ============================================================
    // Prepend real user decision to feed (⭐ marker)
    // ============================================================
    const prependToFeed = useCallback((decision) => {
        setState((prev) => ({
            ...prev,
            decisionFeed: [
                { ...decision, isNPC: false },
                ...prev.decisionFeed,
            ].slice(0, 50),
        }));
    }, []);

    // ============================================================
    // Trigger GWO with 1.5s computing animation + error recovery
    // ============================================================
    const triggerGWO = useCallback((obedienceRate, gridStress, hour) => {
        setState((prev) => ({ ...prev, gwoStatus: 'computing' }));

        setTimeout(() => {
            try {
                const result = runGWO(obedienceRate, gridStress);

                setState((prev) => {
                    const newHistory = [...prev.hourlyHistory];
                    if (hour >= 0 && hour < 24) {
                        newHistory[hour] = {
                            ...newHistory[hour],
                            reward: result.optimalReward,
                            penalty: result.optimalPenalty,
                            obedience: obedienceRate,
                            gridStress,
                            fitnessScore: parseFloat(result.fitnessScore),
                            recorded: true,
                        };
                    }

                    // Detect boundary conditions
                    const gwoMessages = [];
                    if (result.optimalPenalty >= 95) {
                        gwoMessages.push({
                            hour,
                            message: '⚠ GWO: Penalty near maximum (₹100). Increasing reward to attract compliance.',
                            action: 'BOUNDARY_REACHED',
                        });
                    }
                    if (result.optimalReward >= 45) {
                        gwoMessages.push({
                            hour,
                            message: '⚠ GWO: Reward near maximum (₹50). System at maximum incentive capacity.',
                            action: 'BOUNDARY_REACHED',
                        });
                    }

                    const action = obedienceRate > 0.7
                        ? `GWO: High compliance (${(obedienceRate * 100).toFixed(0)}%) — maintaining reward ₹${result.optimalReward}/kWh, penalty ₹${result.optimalPenalty}`
                        : `GWO: Low compliance (${(obedienceRate * 100).toFixed(0)}%) — adjusting to reward ₹${result.optimalReward}/kWh, penalty ₹${result.optimalPenalty}`;

                    return {
                        ...prev,
                        currentReward: result.optimalReward,
                        currentPenalty: result.optimalPenalty,
                        fitnessScore: parseFloat(result.fitnessScore),
                        wolfPositions: result.wolfPositions,
                        hourlyHistory: newHistory,
                        gwoLog: [
                            ...prev.gwoLog,
                            { hour, message: action, action: obedienceRate > 0.7 ? 'STABLE' : 'ADJUSTED' },
                            ...gwoMessages,
                        ],
                        lastAction: action,
                        gwoStatus: 'complete',
                    };
                });

                // Auto-reset status after 3s
                setTimeout(() => {
                    setState((prev) => prev.gwoStatus === 'complete' ? { ...prev, gwoStatus: 'idle' } : prev);
                }, 3000);
            } catch (error) {
                console.error('GWO Error:', error);
                setState((prev) => ({
                    ...prev,
                    gwoStatus: 'error',
                    gwoLog: [
                        ...prev.gwoLog,
                        { hour, message: `❌ GWO error: Using previous rates (₹${prev.currentReward}/₹${prev.currentPenalty})`, action: 'ERROR' },
                    ],
                    lastAction: 'GWO error — using previous rates',
                }));

                // Auto-recover after 3s
                setTimeout(() => {
                    setState((prev) => prev.gwoStatus === 'error' ? { ...prev, gwoStatus: 'idle' } : prev);
                }, 3000);
            }
        }, 1500);
    }, []);

    // ============================================================
    // Manual rate overrides (admin) — locked when modalActive
    // ============================================================
    const overrideRates = useCallback((reward, penalty, modalActive) => {
        if (modalActive) return false; // Deny override
        setState((prev) => ({
            ...prev,
            currentReward: Math.max(1, Math.min(50, reward)),
            currentPenalty: Math.max(5, Math.min(100, penalty)),
            gwoLog: [
                ...prev.gwoLog,
                {
                    hour: null,
                    message: `👤 Admin override: reward ₹${reward}/kWh, penalty ₹${penalty}`,
                    action: 'MANUAL_OVERRIDE',
                },
            ],
            lastAction: `Manual override: reward ₹${reward}, penalty ₹${penalty}`,
        }));
        return true;
    }, []);

    // ============================================================
    // Setters for jumpToHour (called from SimulationContext)
    // ============================================================
    const setHourlyHistory = useCallback((history) => {
        setState((prev) => ({ ...prev, hourlyHistory: history }));
    }, []);

    const setCurrentReward = useCallback((reward) => {
        setState((prev) => ({ ...prev, currentReward: reward }));
    }, []);

    const setCurrentPenalty = useCallback((penalty) => {
        setState((prev) => ({ ...prev, currentPenalty: penalty }));
    }, []);

    const setWolfPositions = useCallback((positions) => {
        setState((prev) => ({ ...prev, wolfPositions: positions }));
    }, []);

    // ============================================================
    // Reset
    // ============================================================
    const resetGWO = useCallback(() => {
        // Clear dispatch timers
        dispatchTimersRef.current.forEach(clearTimeout);
        dispatchTimersRef.current = [];
        isDispatchingRef.current = false;
        setState(INITIAL_GWO_STATE);
    }, []);

    const value = {
        ...state,
        triggerGWO,
        startNPCFeedDispatch,
        prependToFeed,
        overrideRates,
        setHourlyHistory,
        setCurrentReward,
        setCurrentPenalty,
        setWolfPositions,
        resetGWO,
    };

    return (
        <GWOContext.Provider value={value}>
            {children}
        </GWOContext.Provider>
    );
}

export function useGWO() {
    const ctx = useContext(GWOContext);
    if (!ctx) throw new Error('useGWO must be used within GWOProvider');
    return ctx;
}

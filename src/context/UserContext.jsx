import React, { createContext, useContext, useState, useCallback } from 'react';
import { INITIAL_USER_STATE } from '../data/initialState';
import { REWARD_CONFIG, DECISION_OUTCOMES } from '../engine/SimulationEngine';

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [state, setState] = useState({
        ...INITIAL_USER_STATE,
        dailyConsumption: 0, // Cumulative kWh for the "current" day
    });

    // ============================================================
    // Make decision — updates points, penalty, totalKwhSaved
    // Decision entry goes to SimulationContext.allDecisions separately
    // ============================================================
    const makeDecision = useCallback((choice, kwhSaved, pointsEarned, penaltyAmount) => {
        const outcomes = DECISION_OUTCOMES[choice];
        if (!outcomes) return;

        setState((prev) => ({
            ...prev,
            points: prev.points + (outcomes.pointsEarned ? pointsEarned : 0),
            penalty: prev.penalty + (outcomes.penaltyApplied ? penaltyAmount : 0),
            totalKwhSaved: prev.totalKwhSaved + (outcomes.gridReduction ? kwhSaved : 0),
            userDecidedThisPeak: true,
        }));
    }, []);

    // ============================================================
    // Toggle appliance (non-peak only — enforced in component)
    // ============================================================
    // ============================================================
    // Toggle appliance (non-peak only — enforced in component)
    // Block if status is 'auto-off' (system controlled) or non-controllable
    // ============================================================
    const toggleAppliance = useCallback((applianceId) => {
        setState((prev) => ({
            ...prev,
            appliances: prev.appliances.map((a) => {
                if (a.id !== applianceId) return a;
                // Block if system turned it off or if it's strictly non-controllable (Fridge)
                if (a.status === 'auto-off' || !a.controllable) return a;
                return { ...a, status: a.status === 'on' ? 'off' : 'on' };
            }),
        }));
    }, []);

    // ============================================================
    // Turn off selected appliances during peak compliance
    // ============================================================
    // ============================================================
    // Turn off selected appliances during peak compliance
    // Sets status to 'auto-off' and records the hour for ticker
    // ============================================================
    const turnOffAppliances = useCallback((applianceIds, currentHour) => {
        setState((prev) => ({
            ...prev,
            appliances: prev.appliances.map((a) =>
                applianceIds.includes(a.id)
                    ? { ...a, status: 'auto-off', autoOffHour: currentHour }
                    : a
            ),
        }));
    }, []);

    // ============================================================
    // Restore 'auto-off' appliances to 'on' when peak ends
    // ============================================================
    const restoreAutoOff = useCallback(() => {
        setState((prev) => ({
            ...prev,
            appliances: prev.appliances.map((a) =>
                a.status === 'auto-off'
                    ? { ...a, status: 'on', autoOffHour: null }
                    : a
            ),
        }));
    }, []);

    // ============================================================
    // Update daily consumption — called by SimulationContext hourly
    // ============================================================
    const updateConsumption = useCallback((kwhAdded) => {
        setState((prev) => ({
            ...prev,
            dailyConsumption: prev.dailyConsumption + kwhAdded
        }));
    }, []);

    // ============================================================
    // userDecidedThisPeak — owned here, read by SimCtx via ref
    // ============================================================
    const setUserDecidedThisPeak = useCallback((value) => {
        setState((prev) => ({ ...prev, userDecidedThisPeak: value }));
    }, []);

    // ============================================================
    // Reset
    // ============================================================
    const resetUser = useCallback(() => {
        setState(INITIAL_USER_STATE);
    }, []);

    const value = {
        ...state,
        makeDecision,
        toggleAppliance,
        turnOffAppliances,
        restoreAutoOff,
        setUserDecidedThisPeak,
        updateConsumption,
        resetUser,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within UserProvider');
    return ctx;
}

// PURE JS — NO REACT IMPORTS. DO NOT ADD useContext/useState HERE.
// ============================================================
// SimulationEngine.js — Core simulation data and calculations
// ============================================================

// ============================================================
// Constants — Single source of truth for reward/penalty config
// ============================================================
export const REWARD_CONFIG = {
    BASE_REWARD_PER_KWH: 10,    // ₹ per kWh reduced
    EARLY_ACTION_BONUS: 15,     // Flat bonus for proactive action before peak
    MIN_PARTIAL_REWARD: 1,      // Minimum points for any compliance attempt
    BASE_PENALTY: 10,           // ₹ starting penalty (overridden by GWO)
};

// ============================================================
// Decision outcomes — defines effects of each user choice
// ============================================================
export const DECISION_OUTCOMES = {
    comply: { gridReduction: true, pointsEarned: true, penaltyApplied: false },
    ignore: { gridReduction: false, pointsEarned: false, penaltyApplied: true },
    marketplace: { gridReduction: false, pointsEarned: false, penaltyApplied: false },
    early_bonus: { gridReduction: true, pointsEarned: true, penaltyApplied: false },
};

// ============================================================
// 24-hour grid data with realistic daily load curve
// ============================================================
export const GRID_DATA = Array.from({ length: 24 }, (_, h) => {
    const isPeak = (h >= 7 && h <= 9) || (h >= 18 && h <= 21);

    // Base load follows a realistic daily curve (kW for a neighborhood)
    const baseLoads = [
        120, 110, 105, 100, 102, 115, // 0–5 AM: night valley
        140, 190, 200, 175, 160, 155, // 6–11 AM: morning peak
        165, 170, 168, 165, 170, 195, // 12–17 PM: afternoon
        220, 230, 225, 210, 185, 150, // 18–23 PM: evening peak
    ];

    const base = baseLoads[h];
    const threshold = 185; // Above this = peak stress

    return {
        hour: h,
        label: `${h.toString().padStart(2, '0')}:00`,
        base_load_kw: base,
        peak_threshold_kw: threshold,
        isPeak,
        // Reduction target per user assuming 11 users (10 sim + 1 real)
        reductionNeeded: isPeak ? Math.max(0, Math.round((base - threshold) / 11 * 10) / 10) : 0,
    };
});

// Total active users (simulated + real)
export const TOTAL_USERS = 11;

// ============================================================
// User Personas — Behavioral segmentation for predictable demo arc
// ============================================================
export const USER_PERSONAS = [
    // Always comply — 3 users (the "good citizens")
    { id: 'u1', name: 'Priya S.', behavior: 'always_comply', variance: 0.05, accumulatedPoints: 0, accumulatedPenalty: 0, complianceCount: 0, totalDecisions: 0 },
    { id: 'u2', name: 'Rajan K.', behavior: 'always_comply', variance: 0.05, accumulatedPoints: 0, accumulatedPenalty: 0, complianceCount: 0, totalDecisions: 0 },
    { id: 'u3', name: 'Meena R.', behavior: 'always_comply', variance: 0.10, accumulatedPoints: 0, accumulatedPenalty: 0, complianceCount: 0, totalDecisions: 0 },

    // Reward-sensitive — 3 users (swayable by incentives)
    { id: 'u4', name: 'Arjun T.', behavior: 'reward_sensitive', variance: 0.20, accumulatedPoints: 0, accumulatedPenalty: 0, complianceCount: 0, totalDecisions: 0 },
    { id: 'u5', name: 'Sneha P.', behavior: 'reward_sensitive', variance: 0.25, accumulatedPoints: 0, accumulatedPenalty: 0, complianceCount: 0, totalDecisions: 0 },
    { id: 'u6', name: 'Dev M.', behavior: 'reward_sensitive', variance: 0.20, accumulatedPoints: 0, accumulatedPenalty: 0, complianceCount: 0, totalDecisions: 0 },

    // Penalty-sensitive — 2 users (swayable by penalties)
    { id: 'u7', name: 'Kiran B.', behavior: 'penalty_sensitive', variance: 0.30, accumulatedPoints: 0, accumulatedPenalty: 0, complianceCount: 0, totalDecisions: 0 },
    { id: 'u8', name: 'Vijay N.', behavior: 'penalty_sensitive', variance: 0.30, accumulatedPoints: 0, accumulatedPenalty: 0, complianceCount: 0, totalDecisions: 0 },

    // Always ignore — 2 users (the problem users GWO must address)
    { id: 'u9', name: 'Anita L.', behavior: 'always_ignore', variance: 0.05, accumulatedPoints: 0, accumulatedPenalty: 0, complianceCount: 0, totalDecisions: 0 },
    { id: 'u10', name: 'Rohit C.', behavior: 'always_ignore', variance: 0.05, accumulatedPoints: 0, accumulatedPenalty: 0, complianceCount: 0, totalDecisions: 0 },
];

// ============================================================
// Simulated user decision logic
// ============================================================
export function getSimulatedDecision(user, currentReward, currentPenalty) {
    switch (user.behavior) {
        case 'always_comply':
            return Math.random() > user.variance ? 'comply' : 'ignore';

        case 'reward_sensitive': {
            const rewardThreshold = 15;
            const chance = currentReward > rewardThreshold ? 0.85 : 0.15;
            return Math.random() < chance ? 'comply' : 'ignore';
        }

        case 'penalty_sensitive': {
            const penaltyThreshold = 30;
            const chance = currentPenalty > penaltyThreshold ? 0.80 : 0.10;
            return Math.random() < chance ? 'comply' : 'ignore';
        }

        case 'always_ignore':
            return Math.random() > user.variance ? 'ignore' : 'comply';

        default:
            return 'ignore';
    }
}

// ============================================================
// Grid load calculation — derives actual load dynamically
// ============================================================
export function calculateCurrentGridLoad(hour, allDecisions = []) {
    if (hour < 0 || hour > 23) {
        return { actualLoad: 0, baseLoad: 0, peakThreshold: 185, loadPercentage: 0, stressLevel: 'normal', gridStressNormalized: 0 };
    }
    const gridHour = GRID_DATA[hour];
    const baseLoad = gridHour.base_load_kw;
    const peakThreshold = gridHour.peak_threshold_kw;

    const totalReduced = allDecisions
        .filter((d) => d.hour === hour && d.choice === 'comply')
        .reduce((sum, d) => sum + (d.kwhSaved || d.kwh_saved || 0), 0);

    const actualLoad = Math.max(baseLoad - totalReduced, peakThreshold * 0.7);
    const capacity = peakThreshold * 1.2;
    const loadPercentage = Math.min(Math.round((actualLoad / capacity) * 100), 100);

    return {
        actualLoad: Math.round(actualLoad),
        baseLoad,
        peakThreshold,
        loadPercentage,
        stressLevel: loadPercentage > 90 ? 'critical' : loadPercentage > 75 ? 'warning' : 'normal',
        gridStressNormalized: Math.min(loadPercentage / 100, 1),
    };
}

// ============================================================
// Generate simulated decisions for all NPC users for a given hour
// ============================================================
export function generateSimulatedDecisions(hour, currentReward, currentPenalty, personas) {
    if (hour < 0 || hour > 23) return { decisions: [], compliance: 0, complied: 0, ignored: 0 };
    const gridHour = GRID_DATA[hour];
    if (!gridHour.isPeak) return { decisions: [], compliance: 0, complied: 0, ignored: 0 };

    const avgKwhPerUser = gridHour.reductionNeeded || 1.5;

    const decisions = personas.map((user) => {
        const choice = getSimulatedDecision(user, currentReward, currentPenalty);
        const kwhSaved = choice === 'comply' ? avgKwhPerUser + (Math.random() - 0.5) * 0.5 : 0;

        return {
            userId: user.id,
            userName: user.name,
            hour,
            choice,
            kwhSaved: Math.round(kwhSaved * 10) / 10,
            timestamp: gridHour.label,
            pointsEarned: choice === 'comply' ? Math.round(kwhSaved * currentReward) : 0,
            penaltyApplied: choice === 'ignore' ? currentPenalty : 0,
            isNPC: true,
        };
    });

    const complied = decisions.filter((d) => d.choice === 'comply').length;
    const total = decisions.length;

    return {
        decisions,
        compliance: total > 0 ? complied / total : 0,
        complied,
        ignored: total - complied,
    };
}

// ============================================================
// Update persona accumulated stats after NPC decisions
// ============================================================
export function updatePersonaStats(personas, npcDecisions, currentPenalty) {
    return personas.map((p) => {
        const decision = npcDecisions.find((d) => d.userId === p.id);
        if (!decision) return p;
        return {
            ...p,
            accumulatedPoints: p.accumulatedPoints + (decision.choice === 'comply' ? decision.pointsEarned : 0),
            accumulatedPenalty: p.accumulatedPenalty + (decision.choice === 'ignore' ? currentPenalty : 0),
            complianceCount: p.complianceCount + (decision.choice === 'comply' ? 1 : 0),
            totalDecisions: p.totalDecisions + 1,
        };
    });
}

// ============================================================
// Build synthetic GWO history for jumpToHour (backstory for demo)
// ============================================================
export function buildSyntheticHistory(targetHour, baseReward, basePenalty) {
    const history = GRID_DATA.map((g) => ({
        hour: g.hour,
        label: g.label,
        reward: baseReward,
        penalty: basePenalty,
        obedience: null,
        gridStress: null,
        fitnessScore: null,
        recorded: false,
    }));

    // If jumping past morning peak (7-9), fill in a story
    if (targetHour > 9) {
        history[7] = { ...history[7], reward: 10, penalty: 25, obedience: 0.30, gridStress: 0.85, fitnessScore: 0.55, recorded: true };
        history[8] = { ...history[8], reward: 12, penalty: 35, obedience: 0.45, gridStress: 0.72, fitnessScore: 0.68, recorded: true };
        history[9] = { ...history[9], reward: 15, penalty: 35, obedience: 0.60, gridStress: 0.60, fitnessScore: 0.78, recorded: true };
    }

    // Fill non-peak hours before targetHour as "passed" with baseline
    for (let h = 0; h < targetHour; h++) {
        if (!history[h].recorded) {
            history[h] = { ...history[h], recorded: true };
        }
    }

    return history;
}

// ============================================================
// Generate synthetic decisions for past peak hours (for jumpToHour)
// ============================================================
export function generateSyntheticDecisionsForHistory(targetHour, personas) {
    let syntheticDecisions = [];

    // Only generate for hours that have passed
    for (let h = 0; h < targetHour; h++) {
        const gridHour = GRID_DATA[h];
        if (!gridHour.isPeak) continue;

        // Use a fixed "historical" reward/penalty for consistency
        const historicalReward = h < 12 ? 15 : 25;
        const historicalPenalty = h < 12 ? 20 : 45;

        const { decisions } = generateSimulatedDecisions(h, historicalReward, historicalPenalty, personas);
        syntheticDecisions = [...syntheticDecisions, ...decisions];
    }

    return syntheticDecisions;
}

// ============================================================
// Aggregate compliance data by hour for ComplianceBarChart
// ============================================================
export function aggregateComplianceByHour(allDecisions) {
    return Array.from({ length: 24 }, (_, hour) => {
        const hourDecisions = allDecisions.filter((d) => d.hour === hour);
        const total = hourDecisions.length;
        const complyCount = hourDecisions.filter((d) => d.choice === 'comply').length;
        const ignoreCount = hourDecisions.filter((d) => d.choice === 'ignore').length;
        const marketplaceCount = hourDecisions.filter((d) => d.choice === 'marketplace').length;

        return {
            hour,
            label: GRID_DATA[hour].label,
            isPeak: GRID_DATA[hour].isPeak,
            complyCount,
            ignoreCount,
            marketplaceCount,
            total,
            complianceRate: total > 0 ? complyCount / total : null,
        };
    });
}

// ============================================================
// Default appliance definitions for the demo user
// ============================================================
export const DEFAULT_APPLIANCES = [
    {
        id: 'ac',
        name: 'Air Conditioner',
        icon: '❄️',
        load_kw: 1.5,
        type: 'necessary',
        category: 'cooling',
        status: 'on',
        controllable: true,
        priority: 3,
        avg_daily_hours: 8,
        monthly_baseline_cost: 324,
        co2_per_hour: 0.69,
        peakSavingIfOff: 1.5,
        autoOffHour: null
    },
    {
        id: 'ev',
        name: 'EV Charger',
        icon: '🚗',
        load_kw: 2.0,
        type: 'unnecessary',
        category: 'transport',
        status: 'on',
        controllable: true,
        priority: 1,
        avg_daily_hours: 4,
        monthly_baseline_cost: 480,
        co2_per_hour: 0.92,
        peakSavingIfOff: 2.0,
        autoOffHour: null
    },
    {
        id: 'washer',
        name: 'Washing Machine',
        icon: '🧺',
        load_kw: 0.8,
        type: 'unnecessary',
        category: 'cleaning',
        status: 'off',
        controllable: true,
        priority: 2,
        avg_daily_hours: 1,
        monthly_baseline_cost: 48,
        co2_per_hour: 0.37,
        peakSavingIfOff: 0.8,
        autoOffHour: null
    },
    {
        id: 'fridge',
        name: 'Refrigerator',
        icon: '🧊',
        load_kw: 0.2,
        type: 'necessary',
        category: 'kitchen',
        status: 'on',
        controllable: false,
        priority: 99,
        avg_daily_hours: 24,
        monthly_baseline_cost: 288,
        co2_per_hour: 0.09,
        peakSavingIfOff: 0,
        autoOffHour: null
    },
    {
        id: 'lights',
        name: 'LED Lights (All)',
        icon: '💡',
        load_kw: 0.1,
        type: 'necessary',
        category: 'lighting',
        status: 'on',
        controllable: true,
        priority: 4,
        avg_daily_hours: 6,
        monthly_baseline_cost: 36,
        co2_per_hour: 0.05,
        peakSavingIfOff: 0.1,
        autoOffHour: null
    },
    {
        id: 'water_heater',
        name: 'Water Heater',
        icon: '🚿',
        load_kw: 2.0,
        type: 'unnecessary',
        category: 'heating',
        status: 'on',
        controllable: true,
        priority: 1,
        avg_daily_hours: 2,
        monthly_baseline_cost: 240,
        co2_per_hour: 0.92,
        peakSavingIfOff: 2.0,
        autoOffHour: null
    },
    {
        id: 'tv',
        name: 'Smart TV',
        icon: '📺',
        load_kw: 0.15,
        type: 'unnecessary',
        category: 'entertainment',
        status: 'on',
        controllable: true,
        priority: 3,
        avg_daily_hours: 5,
        monthly_baseline_cost: 45,
        co2_per_hour: 0.07,
        peakSavingIfOff: 0.15,
        autoOffHour: null
    },
    {
        id: 'microwave',
        name: 'Microwave',
        icon: '🍿',
        load_kw: 1.2,
        type: 'unnecessary',
        category: 'kitchen',
        status: 'off',
        controllable: true,
        priority: 2,
        avg_daily_hours: 0.5,
        monthly_baseline_cost: 36,
        co2_per_hour: 0.55,
        peakSavingIfOff: 1.2,
        autoOffHour: null
    }
];

// ============================================================
// Format hour for display
// ============================================================
export function formatHour(hour) {
    const h = ((hour % 24) + 24) % 24; // Handle negative/overflow
    if (h === 0) return '12:00 AM';
    if (h < 12) return `${h}:00 AM`;
    if (h === 12) return '12:00 PM';
    return `${h - 12}:00 PM`;
}

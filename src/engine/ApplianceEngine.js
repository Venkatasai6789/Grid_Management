
// Helper to calculate total load from current appliance states
// Returns singular number for grid calculation compatibility
export function getTotalLoad(appliances) {
    if (!appliances) return 0;
    return appliances
        .filter(a => a.status === 'on' || a.status === 'auto-off') // Treat auto-off as load for baseline, but wait - this function is used for grid load.
        // STOP. The existing logic expects getTotalLoad to return the ACTUAL CURRENT consumption.
        // Auto-off means it is NOT consuming.
        // So this function must return only 'on' devices.
        // Re-reading plan: "Keep existing getTotalLoad() unchanged (returns number)".
        // Existing implementation: return appliances.reduce((total, app) => (app.status === 'on' ? total + app.load_kw : total), 0);
        .reduce((total, app) => (app.status === 'on' ? total + app.load_kw : total), 0);
}


// NEW: Returns { current, baseline, delta } for UI display
export function getTotalLoadWithDelta(appliances) {
    if (!appliances) return { current: 0, baseline: 0, delta: 0 };

    // current: genuinely ON devices only
    const current = appliances
        .filter(a => a.status === 'on')
        .reduce((s, a) => s + a.load_kw, 0);

    // baseline: ON + auto-off (what load was before peak action)
    // Excludes manually-off (user's own choice, not system)
    const baseline = appliances
        .filter(a => a.status === 'on' || a.status === 'auto-off')
        .reduce((s, a) => s + a.load_kw, 0);

    return {
        current: Math.round(current * 100) / 100,
        baseline: Math.round(baseline * 100) / 100,
        delta: Math.round((current - baseline) * 100) / 100,
    };
}

export function getReducibleLoad(appliances) {
    if (!appliances) return 0;
    return appliances
        .filter(a => a.type === 'unnecessary' && a.status === 'on')
        .reduce((s, a) => s + a.load_kw, 0);
}

export function getPeakRewardValue(appliances, rewardRate) {
    return Math.round(getReducibleLoad(appliances) * rewardRate);
}

export function getReductionContribution(userKwhReduced, totalReductionNeeded) {
    if (totalReductionNeeded <= 0) return 0;
    return Math.min(Math.round((userKwhReduced / totalReductionNeeded) * 100), 100);
}

export function getCO2WithContext(appliances) {
    if (!appliances) return { totalPerHour: 0, saveablePerHour: 0, treesPerYear: 0 };

    const totalPerHour = appliances
        .filter(a => a.status === 'on')
        .reduce((s, a) => s + a.co2_per_hour || 0, 0);

    const saveablePerHour = appliances
        .filter(a => a.type === 'unnecessary' && a.status === 'on')
        .reduce((s, a) => s + a.co2_per_hour || 0, 0);

    return {
        totalPerHour: parseFloat(totalPerHour.toFixed(2)),
        saveablePerHour: parseFloat(saveablePerHour.toFixed(2)),
        treesPerYear: parseFloat((saveablePerHour * 8760 / 21.77).toFixed(1)),
    };
}

export function getComplianceStreak(applianceId, allDecisions, sessionId) {
    if (!allDecisions) return 0;

    const realPeakDecisions = allDecisions
        .filter(d => !d.isNPC && d.sessionId === sessionId)
        .sort((a, b) => b.hour - a.hour);

    let streak = 0;
    for (const d of realPeakDecisions) {
        const apps = d.selectedAppliances ?? [];
        if (d.choice === 'comply' && apps.includes(applianceId)) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}


export function getUnnecessaryOnAppliances(appliances) {
    return appliances.filter(app => app.type === 'unnecessary' && app.status === 'on');
}

// Pre-select appliances to meet reduction target
// Simple greedy strategy: turn off biggest loads first until target met
export function preselectAppliances(appliances, reductionTarget) {
    // 1. Filter for unnecessary & ON appliances
    const candidates = getUnnecessaryOnAppliances(appliances);

    // 2. Sort by impact (highest load_kw first) - later we can add priority
    // Using simple load_kw sort for now, v5 plan adds priority sort in UI but logic here can remain greedy on load
    // Actually, let's respect priority here too as per plan implication
    candidates.sort((a, b) => {
        // Higher load first? Or Priority first?
        // Plan says: "unnecessary-ON first, sorted by priority (1=top)"
        // Let's implement priority sort
        if (a.priority !== b.priority) return a.priority - b.priority; // Lower priority number = first
        return b.load_kw - a.load_kw; // Then largest load
    });

    let selectedIds = [];
    let totalSelectedKw = 0;

    for (const app of candidates) {
        if (totalSelectedKw < reductionTarget) {
            selectedIds.push(app.id);
            totalSelectedKw += app.load_kw;
        }
    }

    // Edge case: if we selected nothing but target > 0 and candidates exist, select at least one
    if (selectedIds.length === 0 && reductionTarget > 0 && candidates.length > 0) {
        selectedIds.push(candidates[0].id);
        totalSelectedKw += candidates[0].load_kw;
    }

    return {
        selectedIds,
        totalSelectedKw,
        canMeetTarget: totalSelectedKw >= reductionTarget
    };
}

// Smart suggestion factory — canonical shape for AppliancePanel + banner
export function buildSmartSuggestion(appliances, reductionTarget, currentReward, obedienceRate) {
    const pre = preselectAppliances(appliances, reductionTarget);
    const names = pre.selectedIds
        .map(id => appliances.find(a => a.id === id)?.name)
        .filter(Boolean);

    return {
        selectedIds: pre.selectedIds,
        applianceNames: names,
        totalKw: pre.totalSelectedKw,
        rewardValue: Math.round(pre.totalSelectedKw * currentReward),
        coveragePercent: getReductionContribution(pre.totalSelectedKw, reductionTarget),
        obedienceRate,
        currentReward,
        canMeetTarget: pre.canMeetTarget,
    };
}


export function calculateKwhSaved(appliances, selectedIds) {
    return appliances
        .filter(app => selectedIds.includes(app.id))
        .reduce((sum, app) => sum + app.load_kw, 0);
}

export function calculateComplianceLevel(kwhSaved, reductionTarget) {
    if (reductionTarget <= 0) return 100;
    return Math.min(100, Math.round((kwhSaved / reductionTarget) * 100));
}

export function calculatePoints(kwhSaved, currentReward, reductionTarget) {
    // Base points = kWh saved * reward rate
    // Bonus if target met?
    // For now, simpler: just reward * kwh
    return Math.round(kwhSaved * currentReward);
}

export function calculateEarlyActionBonus(appliances) {
    const unnecessaryOn = getUnnecessaryOnAppliances(appliances);
    // If during peak, and unnecessaryOn is empty, user acted early?
    // This logic usually checks if user enters peak with everything already off.
    return unnecessaryOn.length === 0;
}

export function calculateUsageBreakdown(appliances) {
    if (!appliances) return [];

    const totalLoad = getTotalLoad(appliances);
    if (totalLoad === 0) return [];

    const breakdown = {};
    appliances.forEach(app => {
        if (app.status === 'on') {
            const cat = app.category || 'other';
            breakdown[cat] = (breakdown[cat] || 0) + app.load_kw;
        }
    });

    const colors = {
        cooling: '#3b82f6',     // Blue
        transport: '#8b5cf6',   // Violet
        cleaning: '#ec4899',    // Pink
        kitchen: '#f59e0b',     // Amber
        lighting: '#eab308',    // Yellow
        heating: '#ef4444',     // Red
        entertainment: '#6366f1', // Indigo
        other: '#94a3b8'        // Slate
    };

    return Object.keys(breakdown).map(cat => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        value: Math.round((breakdown[cat] / totalLoad) * 100),
        fill: colors[cat] || colors.other
    })).sort((a, b) => b.value - a.value);
}

export function generateWeeklyUsage(todayIndex) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // Generate synthetic data for the week roughly based on typical usage
    return days.map((day, index) => ({
        day,
        usage: Math.floor(Math.random() * (35 - 18) + 18) + (index === 5 || index === 6 ? 5 : 0) // Higher on weekends
    }));
}

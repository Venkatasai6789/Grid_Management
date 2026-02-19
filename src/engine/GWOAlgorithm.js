// ============================================================
// GWOAlgorithm.js — Grey Wolf Optimization (real implementation)
// ============================================================
// Runs in < 5ms in browser. Uses actual wolf movement equations.

const BOUNDS = {
    reward: { min: 1, max: 50 },   // ₹/kWh
    penalty: { min: 5, max: 100 }, // ₹ flat
};

const WOLF_COUNT = 5;
const ITERATIONS = 10;

// ============================================================
// Core GWO position update equation
// ============================================================
function gwoUpdate(pos, alphaPos, betaPos, deltaPos, a, bounds) {
    const updateFromLeader = (leaderPos) => {
        const r1 = Math.random();
        const r2 = Math.random();
        const A = 2 * a * r1 - a;
        const C = 2 * r2;
        const D = Math.abs(C * leaderPos - pos);
        return leaderPos - A * D;
    };

    const x1 = updateFromLeader(alphaPos);
    const x2 = updateFromLeader(betaPos);
    const x3 = updateFromLeader(deltaPos);

    // Average of three leader influences, clamped to bounds
    return Math.min(Math.max((x1 + x2 + x3) / 3, bounds.min), bounds.max);
}

// ============================================================
// Fitness function
// ============================================================
function fitness(reward, penalty, obedienceRate, gridStressNormalized) {
    // Higher reward pulls more users to comply
    const rewardEffect = (reward / BOUNDS.reward.max) * 0.4;
    // Higher penalty pushes non-compliant users
    const penaltyEffect = (penalty / BOUNDS.penalty.max) * 0.3;
    // Current state baseline
    const baseline = (obedienceRate * 0.6) + ((1 - gridStressNormalized) * 0.4);
    return baseline + rewardEffect + penaltyEffect;
}

// ============================================================
// Sort wolves by fitness descending
// ============================================================
function sortByFitness(wolves) {
    return [...wolves].sort((a, b) => b.fit - a.fit);
}

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

// ============================================================
// Main GWO runner — this IS the algorithm
// ============================================================
export function runGWO(obedienceRate, gridStressNormalized) {
    // Initialize wolves at random positions
    let wolves = Array.from({ length: WOLF_COUNT }, () => {
        const r = rand(BOUNDS.reward.min, BOUNDS.reward.max);
        const p = rand(BOUNDS.penalty.min, BOUNDS.penalty.max);
        return {
            reward: r,
            penalty: p,
            fit: fitness(r, p, obedienceRate, gridStressNormalized),
        };
    });

    // Sort to find initial alpha, beta, delta
    let sorted = sortByFitness(wolves);
    let [alpha, beta, delta] = sorted;

    // Iteration history for convergence visualization
    const convergenceHistory = [];

    for (let t = 0; t < ITERATIONS; t++) {
        const a = 2 - (2 * t / ITERATIONS); // Linearly decreases 2→0

        wolves = wolves.map((wolf) => {
            const newReward = gwoUpdate(
                wolf.reward, alpha.reward, beta.reward, delta.reward, a, BOUNDS.reward
            );
            const newPenalty = gwoUpdate(
                wolf.penalty, alpha.penalty, beta.penalty, delta.penalty, a, BOUNDS.penalty
            );
            return {
                reward: newReward,
                penalty: newPenalty,
                fit: fitness(newReward, newPenalty, obedienceRate, gridStressNormalized),
            };
        });

        sorted = sortByFitness(wolves);
        [alpha, beta, delta] = sorted;

        convergenceHistory.push({
            iteration: t,
            alphaFit: alpha.fit,
            alphaReward: alpha.reward,
            alphaPenalty: alpha.penalty,
        });
    }

    const optimalReward = Math.round(alpha.reward);
    const optimalPenalty = Math.round(alpha.penalty);

    // Boundary detection for status messages
    let boundaryMessage = null;
    if (optimalPenalty >= BOUNDS.penalty.max - 5) {
        boundaryMessage = '⚠ Penalty near maximum — shifting focus to reward incentives';
    } else if (optimalReward >= BOUNDS.reward.max - 5) {
        boundaryMessage = '⚠ Reward near maximum — maintaining current incentive structure';
    }

    return {
        optimalReward,
        optimalPenalty,
        fitnessScore: parseFloat(alpha.fit.toFixed(3)),
        wolfPositions: {
            alpha: { x: Math.round(alpha.reward * 10) / 10, y: Math.round(alpha.penalty * 10) / 10 },
            beta: { x: Math.round(beta.reward * 10) / 10, y: Math.round(beta.penalty * 10) / 10 },
            delta: { x: Math.round(delta.reward * 10) / 10, y: Math.round(delta.penalty * 10) / 10 },
        },
        allWolfPositions: sorted.map((w, i) => ({
            id: i,
            x: Math.round(w.reward * 10) / 10,
            y: Math.round(w.penalty * 10) / 10,
            fit: parseFloat(w.fit.toFixed(3)),
            label: i === 0 ? 'α' : i === 1 ? 'β' : i === 2 ? 'δ' : `ω${i - 2}`,
        })),
        convergenceHistory,
        boundaryMessage,
        bounds: BOUNDS,
    };
}

// ============================================================
// Generate a human-readable action description
// ============================================================
export function describeGWOAction(prevReward, prevPenalty, newReward, newPenalty, obedienceRate) {
    const parts = [];

    if (newPenalty > prevPenalty + 3) {
        parts.push(`Penalty ↑ ₹${prevPenalty} → ₹${newPenalty}`);
    } else if (newPenalty < prevPenalty - 3) {
        parts.push(`Penalty ↓ ₹${prevPenalty} → ₹${newPenalty}`);
    }

    if (newReward > prevReward + 3) {
        parts.push(`Reward ↑ ₹${prevReward} → ₹${newReward}`);
    } else if (newReward < prevReward - 3) {
        parts.push(`Reward ↓ ₹${prevReward} → ₹${newReward}`);
    }

    if (parts.length === 0) parts.push('Parameters stable');

    const rateText = `Compliance: ${Math.round(obedienceRate * 100)}%`;
    return `${rateText} — ${parts.join(', ')}`;
}

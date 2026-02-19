// ============================================================
// initialState.js — Default context values for all 4 contexts
// ============================================================
import { DEFAULT_APPLIANCES, USER_PERSONAS, GRID_DATA, REWARD_CONFIG } from '../engine/SimulationEngine';

// ============================================================
// Transaction schema — used by UserContext + WalletPage
// ============================================================
export const TRANSACTION_SCHEMA = {
    id: 0,              // Date.now()
    hour: 0,            // 0–23
    timestamp: '00:00', // Display label
    type: '',           // 'REWARD' | 'PENALTY' | 'EARLY_BONUS' | 'MARKETPLACE'
    amount: 0,          // Positive = earned, negative = penalized
    kwhSaved: 0,        // kWh reduced (0 for penalties)
    description: '',    // Human-readable string
};

// ============================================================
// Pre-populated GWO history — 24h flat baseline (never empty chart)
// ============================================================
export const INITIAL_GWO_HISTORY = GRID_DATA.map((g) => ({
    hour: g.hour,
    label: g.label,
    reward: REWARD_CONFIG.BASE_REWARD_PER_KWH,
    penalty: REWARD_CONFIG.BASE_PENALTY,
    obedience: null,
    gridStress: null,
    fitnessScore: null,
    recorded: false,
}));

// ============================================================
// Auth Context initial state
// ============================================================
export const INITIAL_AUTH_STATE = {
    role: null,            // 'user' | 'admin' | null
    email: null,
    isAuthenticated: false,
};

// ============================================================
// Simulation Context initial state
// ============================================================
export const INITIAL_SIMULATION_STATE = {
    currentHour: 0,              // Start at midnight (hour 0)
    isPeak: false,
    autoRun: false,
    modalShouldOpen: false,      // Set atomically with modalActive
    modalActive: false,          // True while modal displayed — auto-run guard
    simulationComplete: false,   // True after hour 23
    hourlyLoadHistory: [],       // [{hour, actualLoad, baseLoad, stressLevel}]
    allDecisions: [],            // SINGLE SOURCE: every decision (NPC + real), isNPC flag
    simulatedPersonas: USER_PERSONAS.map((p) => ({ ...p })),
    obedienceRate: 0,            // 0.0–1.0, current hour's compliance
    preselectedApplianceIds: [], // Transient: set by AppliancePanel, consumed by Modal
    sessionId: 1771500000000,    // Date.now() placeholder, regenerated on reset
};

// ============================================================
// User Context initial state
// ============================================================
export const INITIAL_USER_STATE = {
    points: 0,
    penalty: 0,
    totalKwhSaved: 0,
    appliances: DEFAULT_APPLIANCES.map((a) => ({ ...a })),
    userDecidedThisPeak: false,  // Owned by UserContext, read by SimCtx via ref
};

// ============================================================
// GWO Context initial state
// ============================================================
export const INITIAL_GWO_STATE = {
    currentReward: REWARD_CONFIG.BASE_REWARD_PER_KWH,
    currentPenalty: REWARD_CONFIG.BASE_PENALTY,
    fitnessScore: 0,
    wolfPositions: {
        alpha: { x: 10, y: 10 },
        beta: { x: 10, y: 10 },
        delta: { x: 10, y: 10 },
    },
    hourlyHistory: INITIAL_GWO_HISTORY.map((h) => ({ ...h })),
    gwoLog: [],                  // [{hour, message, action}]
    lastAction: null,            // Human-readable
    gwoStatus: 'idle',           // 'idle' | 'computing' | 'complete' | 'error'
    decisionFeed: [],            // Stagger-dispatched, real user prepended with ⭐
};

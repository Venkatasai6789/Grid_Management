import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { useSimulationOrchestrator } from '../../hooks/useSimulationOrchestrator';
import { formatHour } from '../../engine/SimulationEngine';
import { StatCard } from './components/StatCard';
import { GWOChart } from './components/GWOChart';
import { DecisionStream } from './components/DecisionStream';
import { ControlPanel, OverridePanel } from './components/Panels';
import { Zap, ThumbsUp, Wallet, AlertTriangle } from 'lucide-react';

const AdminDashboardPage = () => {
    const auth = useAuth();
    const admin = useAdminDashboard();
    const orchestrator = useSimulationOrchestrator();
    const navigate = useNavigate();

    // Prepare chart data: map admin history to simple objects
    const chartData = admin.hourlyHistory.map((h, i) => ({
        hour: formatHour(i),
        // If recorded, use actual. If not, use current global state to show "projected" flat line
        // or just use the history value which is pre-populated in initialState
        reward: h.reward,
        penalty: h.penalty,
        isRecorded: h.recorded
    }));

    // Calculate trends (simple mock trends based on hour 12 vs current)
    // In a real app, compare with previous hour
    const isComplianceUp = admin.gridStats.overallCompliance > 80;
    const isEnergySavedUp = admin.gridStats.totalKwhSaved > 1000;

    return (
        <div className="min-h-screen bg-[#050607] font-sans text-white pb-10 selection:bg-blue-500/30">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#050607]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                        <span className="material-symbols-outlined text-blue-500 text-xl">admin_panel_settings</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                            Admin <span className="text-blue-500">Control Room</span>
                        </h1>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Smart Grid Management System</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Status Badge */}
                    <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 border ${admin.isPeak
                        ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${admin.isPeak ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                        {admin.isPeak ? '⚡ PEAK MODE ACTIVE' : '✓ OFF-PEAK STABLE'}
                        <span className="opacity-30">|</span>
                        <span>{formatHour(admin.currentHour)}</span>
                    </div>

                    <button onClick={() => { auth.logout(); navigate('/login'); }} className="px-4 py-2 hover:bg-white/5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all text-gray-400 hover:text-white">
                        Logout
                    </button>
                </div>
            </header>

            <main className="p-6 max-w-[1600px] mx-auto space-y-6">

                {/* 1. KPI Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Compliance Rate"
                        value={`${admin.gridStats.overallCompliance}%`}
                        icon={ThumbsUp}
                        color="green"
                        trend={isComplianceUp ? 'up' : 'down'}
                        trendValue={isComplianceUp ? '+2.1%' : '-1.5%'}
                    />
                    <StatCard
                        title="Energy Saved"
                        value={`${admin.gridStats.totalKwhSaved.toLocaleString()} kWh`}
                        icon={Zap}
                        color="yellow"
                        trend={!isEnergySavedUp ? 'down' : 'up'}
                        trendValue={!isEnergySavedUp ? '-0.5%' : '+1.2%'}
                    />
                    <StatCard
                        title="Current Reward"
                        value={`₹${admin.currentReward} /kWh`}
                        icon={Wallet}
                        color="blue"
                        trend="up"
                        trendValue="+0.02%"
                    />
                    <StatCard
                        title="Penalty Rate"
                        value={`₹${admin.currentPenalty} /kWh`}
                        subtext="CRITICAL"
                        icon={AlertTriangle}
                        color="red"
                    />
                </div>

                {/* 2. Main Visual Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart Section (2/3 width) - Fixed aspect or min-height */}
                    <div className="lg:col-span-2 h-[450px] lg:h-[500px]">
                        <GWOChart
                            data={chartData}
                            alpha={admin.wolfPositions.alpha}
                            beta={admin.wolfPositions.beta}
                            delta={admin.wolfPositions.delta}
                        />
                    </div>

                    {/* Decision Stream (1/3 width) - Matches chart height */}
                    <div className="col-span-1 h-[450px] lg:h-[500px]">
                        <DecisionStream
                            logs={admin.decisionFeed.map(d => ({
                                title: d.choice === 'comply' ? `${d.userName}: LOAD_REDUCED` : d.choice === 'marketplace' ? `${d.userName}: MARKET_TRADE` : `${d.userName}: ALERT_IGNORED`,
                                message: d.choice === 'comply' ? `User matched target. Saved ${d.kwhSaved}kWh.` : d.choice === 'marketplace' ? `User traded on marketplace.` : `Penalty multiplier active (x1.5).`,
                                type: d.choice === 'comply' ? 'success' : d.choice === 'marketplace' ? 'info' : 'danger',
                                timestamp: d.timestamp
                            }))}
                        />
                    </div>
                </div>

                {/* 3. Bottom Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Simulation Control */}
                    <div className="col-span-1 h-auto min-h-[140px]">
                        <ControlPanel
                            onNext={orchestrator.advanceHour}
                            onAuto={orchestrator.toggleAutoRun}
                            onReset={orchestrator.resetAll}
                            isAutoRunning={orchestrator.isAutoRunning}
                            canAdvance={orchestrator.canAdvanceHour}
                        />
                    </div>

                    {/* Manual Override (2/3 width) */}
                    <div className="col-span-1 lg:col-span-2 h-auto min-h-[140px]">
                        <OverridePanel
                            currentReward={admin.currentReward}
                            currentPenalty={admin.currentPenalty}
                            onOverride={admin.overrideRates}
                            canOverride={admin.canOverrideRates}
                        />
                    </div>
                </div>

            </main>
        </div>
    );
};

export default AdminDashboardPage;

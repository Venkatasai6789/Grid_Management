import React, { useState } from 'react';
import { useUserDashboard } from '../hooks/useUserDashboard';
import { GRID_DATA, formatHour } from '../engine/SimulationEngine';
import { BentoLayout } from '../components/BentoGrid/BentoLayout';
import { BentoCard } from '../components/BentoGrid/BentoCard'; // Keeping for wrapper if needed, or using direct divs

// New Components
import GridStatusCard from './user/components/GridStatusCard';
import WalletCard from './user/components/WalletCard';
import ImpactCard from './user/components/ImpactCard';
import DeviceList from './user/components/DeviceList';
import EnergyChart from './user/components/EnergyChart';
import EfficiencyMeter from './user/components/EfficiencyMeter';
import CommunityPulse from './user/components/CommunityPulse';

const DashboardPage = () => {
    const {
        currentHour,
        isPeak,
        hoursUntilPeak,
        currentLoad,
        points,
        totalKwhSaved,
        co2Context,
        appliances,
        toggleAppliance,
        turnOffAppliances,
        totalLoadDisplay,
        hourlyLoadHistory
    } = useUserDashboard();

    // Transform hourly history for the chart
    // If history is empty (start of sim), show a flat line or mock trend that looks realistic
    const chartData = React.useMemo(() => {
        if (!hourlyLoadHistory || hourlyLoadHistory.length === 0) {
            // Return empty placeholder structure with 24h labels
            return Array.from({ length: 7 }, (_, i) => ({
                day: formatHour((currentHour - 6 + i + 24) % 24), // Show last 6 hours + current
                value: 30 + Math.random() * 20
            }));
        }
        // Take last 7 entries or all if less
        return hourlyLoadHistory.slice(-7).map(h => ({
            day: formatHour(h.hour),
            value: h.actualLoad || 0
        }));
    }, [hourlyLoadHistory, currentHour]);

    return (
        <div className="min-h-screen bg-[#050607] pb-20 font-sans text-slate-200">
            {/* Header */}
            {/* <div className="max-w-[1600px] mx-auto p-6 pt-8 flex justify-between items-center">
                 <h1 className="text-2xl font-black text-white tracking-tight">
                    Smart Grid <span className="text-google-blue">Dashboard</span>
                </h1>
                <div className="text-xs font-mono text-slate-500">
                    LIVE SYSTEM CLOCK: {formatHour(currentHour)}:00
                </div>
            </div> */}
            {/* Header integrated into cards or kept minimal */}

            <div className="max-w-[1600px] mx-auto p-6 space-y-6">

                {/* Top Row: Status, Wallet, Impact */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[320px]">
                    {/* 1. Grid Status (Large) */}
                    <div className="lg:col-span-1 h-full">
                        <GridStatusCard
                            currentHour={currentHour}
                            isPeak={isPeak}
                            currentLoad={currentLoad}
                            hoursUntilPeak={hoursUntilPeak}
                        />
                    </div>

                    {/* 2. Wallet & Impact (Split Column on large, stacked on small) */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                        <WalletCard points={points} />
                        <ImpactCard
                            kwhSaved={totalKwhSaved}
                            co2Saved={co2Context?.treesPerYear} // Using trees for now as proxy or context value
                        />
                    </div>
                </div>

                {/* Middle Row: Devices */}
                <div className="w-full">
                    <DeviceList
                        appliances={appliances}
                        onToggle={toggleAppliance}
                        onTurnOff={turnOffAppliances}
                    />
                </div>

                {/* Bottom Row: History, Efficiency, Community */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-auto lg:h-[350px]">

                    {/* Historical Chart (2 cols) */}
                    <div className="lg:col-span-2 h-full">
                        <EnergyChart data={chartData} />
                    </div>

                    {/* Efficiency Meter (1 col) */}
                    <div className="lg:col-span-1 h-full">
                        <EfficiencyMeter
                            currentLoad={totalLoadDisplay?.current || 0}
                            baseLoad={totalLoadDisplay?.baseline || 120}
                        />
                    </div>

                    {/* Community Pulse (1 col) */}
                    <div className="lg:col-span-1 h-full">
                        <CommunityPulse />
                    </div>
                </div>

            </div>


        </div>
    );
};

export default DashboardPage;

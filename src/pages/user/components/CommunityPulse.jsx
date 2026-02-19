import React from 'react';
import { useSimulation } from '../../../context/SimulationContext';

// Mock avatars for UI polish
const MOCK_USERS = [
    { name: 'Sarah J.', action: 'Reduced load by 30% in Oak Ridge', color: 'bg-orange-200' },
    { name: 'Marcus L.', action: 'Shared excess solar: 12 kW', color: 'bg-blue-200' },
    { name: 'Elena R.', action: 'Peak saver badge earned!', color: 'bg-purple-200' },
    { name: 'Tom K.', action: 'Switched to eco-mode (HVAC)', color: 'bg-green-200' },
];

const CommunityPulse = () => {
    // Optionally hook into real sim data if available, or use mock for "Other Users" feel
    // const { allDecisions } = useSimulation();

    return (
        <div className="bg-[#1e1e1e] rounded-3xl p-6 border border-white/5 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-google-blue text-sm">hub</span>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Community Pulse</h3>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                {MOCK_USERS.map((u, i) => (
                    <div key={i} className="flex gap-3 items-start">
                        <div className={`w-8 h-8 rounded-full ${u.color} shrink-0 flex items-center justify-center text-[10px] font-black text-slate-800`}>
                            {u.name.charAt(0)}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white">{u.name}</div>
                            <div className="text-[10px] text-slate-500 font-medium leading-tight">{u.action}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-500 text-center italic">
                    Community data updates every hour.
                </p>
            </div>
        </div>
    );
};

export default CommunityPulse;

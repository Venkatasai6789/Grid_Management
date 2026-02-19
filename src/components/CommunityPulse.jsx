import React from 'react';
import { BentoCard } from './BentoGrid/BentoCard';

const CommunityPulse = () => {
    const pulses = [
        { id: 1, name: 'Sarah J.', action: 'Reduced load by 30% in Oak Ridge', time: '2m ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
        { id: 2, name: 'Marcus L.', action: 'Shared excess solar: 12 kW', time: '5m ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
        { id: 3, name: 'Elena R.', action: 'Peak saver badge earned!', time: '12m ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
        { id: 4, name: 'Tom K.', action: 'Switched to eco-mode (HVAC)', time: '15m ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom' },
    ];

    return (
        <BentoCard title="Community Pulse" icon="groups" className="h-full">
            <div className="space-y-4">
                {pulses.map((pulse) => (
                    <div key={pulse.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default group">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                            <img src={pulse.avatar} alt={pulse.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-200 group-hover:text-primary transition-colors">{pulse.name}</span>
                                <span className="text-[10px] text-gray-500 font-mono">{pulse.time}</span>
                            </div>
                            <div className="text-xs text-gray-400 truncate">{pulse.action}</div>
                        </div>
                    </div>
                ))}
                <div className="pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>124 neighbors active</span>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-5 h-5 rounded-full bg-surface-highlight border border-surface-card flex items-center justify-center text-[8px] text-gray-400">
                                    +
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </BentoCard>
    );
};

export default CommunityPulse;

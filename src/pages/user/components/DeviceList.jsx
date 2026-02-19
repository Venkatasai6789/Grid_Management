import React from 'react';
import ApplianceCard from './ApplianceCard';

const DeviceList = ({ appliances = [], onToggle, onTurnOff }) => {
    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-4 px-1">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-google-blue">devices_other</span>
                    <h2 className="text-lg font-black text-white tracking-tight">Connected Devices</h2>
                </div>
                <button className="text-xs font-bold text-google-blue hover:text-blue-400 transition-colors">
                    Manage All
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {(appliances || []).map(app => (
                    <ApplianceCard
                        key={app.id}
                        appliance={app}
                        onToggle={() => onToggle(app.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default DeviceList;

import React from 'react';

const ApplianceCard = ({ appliance, onToggle }) => {
    const isOn = appliance.status === 'on';

    return (
        <div className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-between text-center h-[140px] group ${isOn
            ? 'bg-[#1e1e1e] border-google-blue/20 hover:border-google-blue/40'
            : 'bg-[#151515] border-white/5 opacity-60 hover:opacity-100'
            }`}>
            <div className={`p-2 rounded-xl transition-colors ${isOn ? 'text-google-blue bg-google-blue/10' : 'text-slate-500 bg-white/5'
                }`}>
                <span className="material-symbols-outlined">
                    {getIconForAppliance(appliance.name)}
                </span>
            </div>

            <div>
                <div className="text-xs font-bold text-slate-200 mb-0.5">{appliance.name}</div>
                <div className="text-[10px] font-mono text-slate-500">
                    {appliance.load_kw} kW
                </div>
            </div>

            {/* Toggle Switch */}
            <button
                onClick={onToggle}
                className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isOn ? 'bg-google-blue' : 'bg-slate-700'
                    }`}
            >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isOn ? 'left-6' : 'left-1'
                    }`}></div>
            </button>
        </div>
    );
};
// Helper to get icons
const getIconForAppliance = (name) => {
    const n = name.toLowerCase();
    if (n.includes('ac') || n.includes('condition')) return 'ac_unit';
    if (n.includes('heater') || n.includes('water')) return 'water_heater';
    if (n.includes('wash') || n.includes('laundry')) return 'local_laundry_service';
    if (n.includes('dryer')) return 'local_laundry_service'; // Fallback
    if (n.includes('fridge') || n.includes('freezer')) return 'kitchen';
    if (n.includes('tv') || n.includes('television')) return 'tv';
    if (n.includes('light') || n.includes('lamp')) return 'lightbulb';
    if (n.includes('fan')) return 'mode_fan';
    if (n.includes('charger') || n.includes('ev')) return 'ev_station';
    if (n.includes('microwave') || n.includes('oven')) return 'microwave';
    return 'devices_other';
};

export default ApplianceCard;

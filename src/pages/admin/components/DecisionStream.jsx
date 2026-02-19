import React, { useEffect, useRef } from 'react';

export const DecisionStream = ({ logs = [] }) => {
    const scrollRef = useRef(null);

    // Auto-scroll to bottom on new logs
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getLogColor = (type) => {
        switch (type) {
            case 'success': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
            case 'warning': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5';
            case 'danger': return 'text-red-400 border-red-500/20 bg-red-500/5';
            case 'info': return 'text-blue-400 border-blue-500/20 bg-blue-500/5';
            default: return 'text-gray-400 border-white/5 bg-white/5';
        }
    };

    return (
        <div className="bg-[#0f1115] border border-white/5 rounded-xl p-0 flex flex-col h-full overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">history</span>
                    Decision Stream
                </h3>
                <span className="text-[10px] text-gray-600 font-mono">REALTIME_V2</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" ref={scrollRef}>
                {logs.length === 0 ? (
                    <div className="text-center text-gray-600 text-xs py-10 font-mono">No activity recorded...</div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className="animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="text-[10px] text-gray-500 font-mono mb-1">
                                [{new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                            </div>
                            <div className={`p-3 rounded border ${getLogColor(log.type)}`}>
                                <div className="font-bold text-xs uppercase tracking-wider mb-0.5">{log.title}</div>
                                <div className="text-[10px] opacity-80 font-mono leading-relaxed">{log.message}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

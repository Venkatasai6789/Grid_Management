import React from 'react';

export const BentoCard = ({
    children,
    className = '',
    title,
    icon,
    variant = 'default',
    colSpan = 1,
    rowSpan = 1
}) => {
    // Base classes for the glassmorphism effect and borders
    const baseClasses = "relative overflow-hidden rounded-3xl p-6 transition-all duration-300 group";

    // Variant styles
    // Variant styles
    const variants = {
        default: "bg-white/80 dark:bg-surface-card/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50 shadow-sm hover:shadow-md transition-colors",
        primary: "bg-primary/10 backdrop-blur-xl border border-primary/20 hover:border-primary/40 shadow-lg shadow-primary/5",
        danger: "bg-danger/10 backdrop-blur-xl border border-danger/20 hover:border-danger/40 shadow-lg shadow-danger/5",
        success: "bg-success/10 backdrop-blur-xl border border-success/20 hover:border-success/40 shadow-lg shadow-success/5",
        warning: "bg-secondary/10 backdrop-blur-xl border border-secondary/20 hover:border-secondary/40 shadow-lg shadow-secondary/5",
        gradient: "bg-gradient-to-br from-surface-card to-surface-highlight border border-white/10 text-white"
    };

    // Grid spanning classes
    const colSpans = {
        1: "col-span-1",
        2: "md:col-span-2",
        3: "md:col-span-2 lg:col-span-3",
        4: "md:col-span-2 lg:col-span-4"
    };

    const rowSpans = {
        1: "row-span-1",
        2: "row-span-2",
        3: "row-span-3"
    };

    return (
        <div className={`
            ${baseClasses} 
            ${variants[variant] || variants.default} 
            ${colSpans[colSpan] || colSpans[1]} 
            ${rowSpans[rowSpan] || rowSpans[1]} 
            ${className}
            flex flex-col
        `}>
            {/* Header */}
            {(title || icon) && (
                <div className="flex items-center gap-3 mb-4 shrink-0">
                    {icon && (
                        <span className={`material-symbols-outlined text-2xl ${variant === 'default' ? 'text-primary' : 'text-inherit opacity-90'
                            }`}>
                            {icon}
                        </span>
                    )}
                    {title && (
                        <h3 className={`font-bold uppercase tracking-wider text-sm ${variant === 'default' ? 'text-slate-500 dark:text-slate-400' : 'text-inherit opacity-90'
                            }`}>
                            {title}
                        </h3>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 flex-1 min-h-0">
                {children}
            </div>

            {/* Background Decor (optional gloss) */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </div>
    );
};

import React from 'react';

export const BentoLayout = ({ children, className = '' }) => {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(180px,auto)] gap-4 p-4 max-w-[1600px] mx-auto ${className}`}>
            {children}
        </div>
    );
};

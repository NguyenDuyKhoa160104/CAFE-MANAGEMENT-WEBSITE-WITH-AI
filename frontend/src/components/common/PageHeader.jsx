import React from 'react';

const PageHeader = ({ title, subtitle }) => {
    return (
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#49332b]">{title}</h1>
            {subtitle && (
                <p className="mt-1 text-sm text-[#8b7e76]">{subtitle}</p>
            )}
        </div>
    );
};

export default PageHeader;

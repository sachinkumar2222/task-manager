import React from 'react';

const StatCard = ({ title, value }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</h3>
            {/* Show 0 instead of '-' if value is 0, otherwise show '-' for null/undefined */}
            <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {value ?? (value === 0 ? 0 : '-')}
            </p>
        </div>
    );
};

export default StatCard;
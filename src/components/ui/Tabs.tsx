import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                flex items-center whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium
                ${isActive
                  ? 'border-[#2C3E50] text-[#2C3E50]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                transition-colors duration-200
              `}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`
                    ml-2 py-0.5 px-2 text-xs rounded-full
                    ${isActive ? 'bg-[#2C3E50] text-white' : 'bg-gray-100 text-gray-600'}
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;
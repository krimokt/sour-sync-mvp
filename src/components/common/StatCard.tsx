import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@/icons/index';

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  trend?: {
    value: number;
    label?: string;
    direction: 'up' | 'down';
  };
  icon?: React.ReactNode;
  variant?: 'dark' | 'light';
}

export default function StatCard({ 
  title, 
  value, 
  trend, 
  icon,
  variant = 'light' 
}: StatCardProps) {
  const isDark = variant === 'dark';
  
  return (
    <div className={`
      rounded-xl p-6 border transition-all duration-200 relative overflow-hidden
      ${isDark 
        ? 'bg-gradient-to-br from-[#06b6d4] to-[#0f7aff] border-[#06b6d4]/20 text-white shadow-lg' 
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600'
      }
    `}>
      <div className="flex flex-col h-full justify-between relative z-10">
        <div>
          <div className="flex justify-between items-start mb-4">
            <h3 className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
              {title}
            </h3>
            {icon && (
              <div className={`p-2.5 rounded-lg ${isDark ? 'bg-white/20 backdrop-blur-sm text-white' : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'}`}>
                {icon}
              </div>
            )}
          </div>
          
          <div className="flex items-end justify-between gap-4">
            <span className={`text-2xl font-bold tracking-tight truncate ${isDark ? 'text-white' : ''}`}>
              {value}
            </span>
            
            {trend && (
              <div className="flex items-center gap-1 mb-1">
                <span className={`
                  flex items-center text-sm font-semibold
                  ${trend.direction === 'up' 
                    ? 'text-green-500' 
                    : 'text-red-500'
                  }
                `}>
                  {trend.direction === 'up' ? (
                    <ArrowUpIcon className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDownIcon className="w-3 h-3 mr-1" />
                  )}
                  {trend.value}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

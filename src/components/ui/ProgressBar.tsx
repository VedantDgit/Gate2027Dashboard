'use client';

import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  height?: number;
  color?: string;
  bgColor?: string;
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  height = 6,
  color = 'bg-sky-500',
  bgColor = 'bg-slate-800/80',
  showLabel = false,
  className = '',
}) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          <span className="text-slate-400">Progress</span>
          <span className="text-slate-200 font-mono">{percent.toFixed(1)}%</span>
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full ${bgColor} border border-white/5`}
        style={{ height }}
      >
        <div
          className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

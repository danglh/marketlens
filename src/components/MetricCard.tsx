import React, { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { getKeyMetrics, KeyMetricsPayload } from '../lib/dashboardApi';

export type MetricKey = 'breadth_up' | 'breadth_down' | 'near_high_count' | 'near_low_count';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  percentage: number;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  metricKey?: MetricKey;
}

export default function MetricCard({
  title,
  value,
  unit,
  percentage,
  icon: Icon,
  colorClass,
  bgClass,
  metricKey,
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState<string | number>(value);
  const [displayPercentage, setDisplayPercentage] = useState<number>(percentage);

  useEffect(() => {
    if (!metricKey) {
      return;
    }

    const applyValue = (payload: KeyMetricsPayload) => {
      if (metricKey === 'breadth_up') {
        setDisplayValue(payload.breadthUp);
        setDisplayPercentage(payload.pctUp * 100);
      }
      if (metricKey === 'breadth_down') {
        setDisplayValue(payload.breadthDown);
        setDisplayPercentage(payload.pctDown * 100);
      }
      if (metricKey === 'near_high_count') {
        setDisplayValue(payload.nearHighCount);
        setDisplayPercentage(payload.pctNearHigh * 100);
      }
      if (metricKey === 'near_low_count') {
        setDisplayValue(payload.nearLowCount);
        setDisplayPercentage(payload.pctNearLow * 100);
      }
    };

    getKeyMetrics().then(applyValue).catch(() => {
      setDisplayValue(value);
      setDisplayPercentage(percentage);
    });
  }, [metricKey, percentage, value]);

  return (
    <div className="bg-card-dark p-6 rounded-2xl border border-border-dark shadow-sm hover:border-slate-600 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 ${bgClass} rounded-lg ${colorClass}`}>
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{title}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight">{displayValue}</span>
        <span className={`${colorClass} text-sm font-medium`}>{unit}</span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`${colorClass.replace('text-', 'bg-')} h-full transition-all duration-1000 ease-out`}
            style={{ width: `${displayPercentage}%` }}
          ></div>
        </div>
        <span className="text-xs font-mono text-slate-400">{displayPercentage.toFixed(2)}%</span>
      </div>
    </div>
  );
}

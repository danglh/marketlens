import React, { useEffect, useState } from 'react';
import { PieChart, Info } from 'lucide-react';
import { getMarketSnapshot, MarketSnapshotPayload } from '../lib/dashboardApi';

const fallback: MarketSnapshotPayload = {
  snapshotId: 0,
  capturedAt: '',
  upPercent: 33,
  downPercent: 63,
  nearHighPercent: 10,
  nearLowPercent: 47,
  upGt1Count: 4,
  downLtMinus1Count: 12,
  weightedUpShare: 0.4,
  weightedDownShare: 0.58,
  heavyweightsWeightedMove: 0.24,
  nonHeavyweightsWeightedMove: -0.51,
  msiSimple: 'DISTRIBUTION',
};

export default function MarketSnapshot() {
  const [data, setData] = useState<MarketSnapshotPayload>(fallback);

  useEffect(() => {
    getMarketSnapshot().then(setData).catch(() => setData(fallback));
  }, []);

  const neutralWidth = Math.max(0, 100 - data.upPercent - data.downPercent);
  const nearNeutralWidth = Math.max(0, 100 - data.nearHighPercent - data.nearLowPercent);

  return (
    <div className="space-y-6">
      <div className="bg-card-dark p-6 rounded-2xl border border-border-dark shadow-sm">
        <h3 className="font-bold mb-6 flex items-center gap-2">
          <PieChart className="text-blue-500" size={20} />
          Market Snapshot
        </h3>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-[10px] uppercase tracking-wider mb-2">
              <span className="text-slate-500">Up / Down Ratio</span>
              <span className="font-mono text-slate-300">{data.upPercent.toFixed(0)}% / {data.downPercent.toFixed(0)}%</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-slate-800">
              <div className="bg-emerald-500" style={{ width: `${data.upPercent}%` }}></div>
              <div className="bg-red-500" style={{ width: `${data.downPercent}%` }}></div>
              <div className="bg-slate-600" style={{ width: `${neutralWidth}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] uppercase tracking-wider mb-2">
              <span className="text-slate-500">NearHigh / NearLow</span>
              <span className="font-mono text-slate-300">{data.nearHighPercent.toFixed(0)}% / {data.nearLowPercent.toFixed(0)}%</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-slate-800">
              <div className="bg-blue-500" style={{ width: `${data.nearHighPercent}%` }}></div>
              <div className="bg-orange-500" style={{ width: `${data.nearLowPercent}%` }}></div>
              <div className="bg-slate-600" style={{ width: `${nearNeutralWidth}%` }}></div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-dark space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Up &gt; 1% count:</span>
              <span className="text-xs font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20">{data.upGt1Count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Down &lt; -1% count:</span>
              <span className="text-xs font-mono px-2 py-0.5 bg-red-500/10 text-red-500 rounded border border-red-500/20">{data.downLtMinus1Count}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card-dark p-6 rounded-2xl border border-border-dark shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Info className="text-yellow-500" size={18} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">MSI (Simple)</span>
        </div>

        <div className="p-3 bg-slate-800/50 rounded-lg text-center mb-6 border border-border-dark">
          <span className="text-lg font-bold tracking-[0.3em] text-slate-200">{data.msiSimple}</span>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Weighted Up Share:</span>
            <span className="font-mono text-sm text-slate-300">{data.weightedUpShare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Weighted Down Share:</span>
            <span className="font-mono text-sm text-slate-300">{data.weightedDownShare.toFixed(2)}</span>
          </div>
          <div className="pt-3 border-t border-border-dark">
            <div className="flex justify-between items-center text-blue-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Heavyweights vs Rest:</span>
              <span className="font-mono font-bold text-sm">{data.heavyweightsWeightedMove.toFixed(2)} / {data.nonHeavyweightsWeightedMove.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronUp, 
  ChevronDown, 
  Filter, 
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import PerformanceTable from './components/PerformanceTable';
import MarketSnapshot from './components/MarketSnapshot';
import AnalysisLog from './components/AnalysisLog';
import Signals from './components/Signals';
import MarketHealth from './components/MarketHealth';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('market-health');

  return (
    <div className="flex min-h-screen bg-background-dark text-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <div className="p-8 space-y-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'market-health' && (
              <motion.div 
                key="market-health"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <MarketHealth />
              </motion.div>
            )}

            {activeTab === 'key-metrics' && (
              <motion.div 
                key="key-metrics"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Key Metrics Overview</h1>
                    <p className="text-slate-500 text-sm mt-1">Real-time market breadth and heavyweight distribution analysis.</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-card-dark border border-border-dark px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors">
                      <Filter size={16} /> Filter
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                      <Download size={16} /> Export
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard 
                    title="Breadth Up"
                    value={10}
                    unit="Stocks"
                    percentage={33}
                    icon={ArrowUpRight}
                    colorClass="text-emerald-500"
                    bgClass="bg-emerald-500/10"
                  />
                  <MetricCard 
                    title="Breadth Down"
                    value={19}
                    unit="Stocks"
                    percentage={63}
                    icon={ArrowDownRight}
                    colorClass="text-red-500"
                    bgClass="bg-red-500/10"
                  />
                  <MetricCard 
                    title="Near High Count"
                    value={3}
                    unit="Assets"
                    percentage={10.00}
                    icon={ChevronUp}
                    colorClass="text-blue-500"
                    bgClass="bg-blue-500/10"
                  />
                  <MetricCard 
                    title="Near Low Count"
                    value={14}
                    unit="Assets"
                    percentage={46.67}
                    icon={ChevronDown}
                    colorClass="text-orange-500"
                    bgClass="bg-orange-500/10"
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <PerformanceTable />
                  </div>
                  <div>
                    <MarketSnapshot />
                  </div>
                </div>
                
                <AnalysisLog />
              </motion.div>
            )}

            {activeTab === 'signals' && (
              <motion.div 
                key="signals"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <Signals />
              </motion.div>
            )}

            {activeTab !== 'key-metrics' && activeTab !== 'signals' && activeTab !== 'market-health' && (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-[60vh] text-slate-500"
              >
                <div className="text-lg font-medium">Section Under Development</div>
                <p className="text-sm">The {activeTab} view is coming soon.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

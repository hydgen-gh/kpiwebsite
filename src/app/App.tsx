import React, { useState } from 'react';
import { LayoutDashboard, Package, TrendingUp, Megaphone, DollarSign, Book, Upload } from 'lucide-react';
import OverviewDashboard from './components/OverviewDashboard';
import ProductDashboard from './components/ProductDashboard';
import SalesDashboard from './components/SalesDashboard';
import MarketingDashboard from './components/MarketingDashboard';

import RnD from './components/RnD';
import FinancialData from './components/FinancialData';
import UploadKPI from './components/UploadKPI';
import { KPIProvider } from './kpi/KPIContext';
import MonthSelector from './components/MonthSelector';

type Tab = 'overview' | 'product' | 'sales' | 'marketing' | 'rnd' | 'finance' | 'upload'; 

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [department, setDepartment] = useState('All Departments');

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'product', label: 'Product', icon: <Package className="w-5 h-5" /> },
    { id: 'sales', label: 'Sales', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'marketing', label: 'Marketing', icon: <Megaphone className="w-5 h-5" /> },
    { id: 'rnd', label: 'R&D', icon: <Book className="w-5 h-5" /> },
    { id: 'finance', label: 'Finance', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'upload', label: 'Upload KPI', icon: <Upload className="w-5 h-5" /> },
  ];

  return (
    <KPIProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40">
      {/* Top Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3 min-w-fit">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <div className="text-white font-bold text-xl">H</div>
              </div>
              <div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  HYDGEN
                </h1>
              </div>
            </div>

            {/* Month Selector inline */}
            <div className="flex-1 flex items-center justify-center">
              <MonthSelector />
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4 min-w-fit">
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1440px] mx-auto flex">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 bg-white/60 backdrop-blur border-r border-slate-200/60 min-h-[calc(100vh-73px)] p-6">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

         
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          {activeTab === 'overview' && <OverviewDashboard />}
          {activeTab === 'product' && <ProductDashboard />}
          {activeTab === 'sales' && <SalesDashboard />}
          {activeTab === 'marketing' && <MarketingDashboard />}
          {activeTab === 'finance' && <FinancialData />}
          {activeTab === 'rnd' && <RnD />}
          {activeTab === 'upload' && <UploadKPI />}
          

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-slate-200/60 text-center">
            <p className="text-xs text-slate-500">
              Internal KPI Dashboard – HYDGEN | Q4 2025
            </p>
          </footer>
        </main>
      </div>
      </div>
    </KPIProvider>
  );
}
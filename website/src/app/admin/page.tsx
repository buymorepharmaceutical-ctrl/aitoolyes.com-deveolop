'use client';
import React, { useState, useEffect } from 'react';
import { Activity, Users, Box, Link as LinkIcon, Server, Search, Bell, Menu, LayoutDashboard, FileText, Settings, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-100px)] w-full gap-6 p-4">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 flex flex-col gap-2 p-6 glass-panel rounded-3xl shrink-0">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground tracking-tight">AdminOS</h2>
            <p className="text-xs text-foreground/50">v2.0.0 Pro</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<Activity size={20} />} label="Analytics" />
          <NavItem icon={<Box size={20} />} label="AI Tools" />
          <NavItem icon={<FileText size={20} />} label="Blog Posts" badge="5" />
          <NavItem icon={<Users size={20} />} label="Users" />
        </nav>

        <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-card-border">
          <NavItem icon={<Settings size={20} />} label="Settings" />
          <NavItem icon={<LogOut size={20} />} label="Logout" className="text-red-500 hover:bg-red-500/10 hover:text-red-600" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6 w-full min-w-0">
        
        {/* Top Header */}
        <header className="flex items-center justify-between glass-panel rounded-3xl p-4 px-6">
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
            <input 
              type="text" 
              placeholder="Search tools, analytics..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/40 border border-card-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2.5 rounded-xl bg-white/40 border border-card-border hover:bg-white/60 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-card-border">
              <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="Admin" className="w-9 h-9 rounded-full border border-card-border" />
              <div className="hidden sm:block text-sm">
                <p className="font-bold">Super Admin</p>
                <p className="text-xs text-foreground/50">admin@aitoolyes.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Visitors" value="45,231" trend="+12.5%" icon={<Users className="w-6 h-6 text-blue-500" />} color="blue" />
          <StatCard title="AI Tools Used" value="1,204" trend="+5.2%" icon={<Box className="w-6 h-6 text-purple-500" />} color="purple" />
          <StatCard title="API Requests" value="128k" trend="+24.1%" icon={<Activity className="w-6 h-6 text-green-500" />} color="green" />
          <StatCard title="System Health" value="99.9%" trend="Stable" icon={<Server className="w-6 h-6 text-orange-500" />} color="orange" isStatus />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart Area */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-lg">Platform Usage</h3>
                <p className="text-sm text-foreground/50">Weekly AI API consumption</p>
              </div>
              <select className="bg-white/40 border border-card-border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
              </select>
            </div>
            
            {/* Mock Chart using CSS Grid */}
            <div className="flex-1 min-h-[250px] flex items-end gap-2 sm:gap-4 mt-auto">
              {[35, 45, 25, 60, 75, 45, 85].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full relative rounded-t-lg bg-primary/20 hover:bg-primary/30 transition-all overflow-hidden flex items-end justify-center" style={{ height: '200px' }}>
                    <div 
                      className="w-full bg-gradient-to-t from-primary/80 to-primary rounded-t-lg transition-all duration-1000 ease-out group-hover:brightness-110" 
                      style={{ height: `${h}%` }}
                    ></div>
                    {/* Tooltip */}
                    <div className="absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] py-1 px-2 rounded backdrop-blur-md">
                      {h}k reqs
                    </div>
                  </div>
                  <span className="text-xs font-medium text-foreground/50">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vercel Status / Quick Actions */}
          <div className="flex flex-col gap-6">
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="font-bold text-lg mb-4">Deployment Status</h3>
              <div className="bg-black/90 text-white rounded-2xl p-5 border border-white/10 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)]"></div>
                  <span className="font-mono text-sm tracking-wide">Production Ready</span>
                </div>
                <div className="space-y-3 font-mono text-xs text-zinc-400">
                  <div className="flex justify-between">
                    <span>Environment:</span>
                    <span className="text-white">Vercel Edge</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next.js Ver:</span>
                    <span className="text-white">15.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Branch:</span>
                    <span className="text-white">main</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Deploy:</span>
                    <span className="text-white">Just now</span>
                  </div>
                </div>
                <button className="w-full mt-6 bg-white text-black py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors">
                  View Logs
                </button>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 flex-1">
              <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <ActivityItem title="New user signed up" time="2 mins ago" type="user" />
                <ActivityItem title="UI Generator executed" time="15 mins ago" type="ai" />
                <ActivityItem title="Blog post published" time="1 hour ago" type="content" />
                <ActivityItem title="API limit reached (Gemma)" time="3 hours ago" type="warning" />
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

// Subcomponents

function NavItem({ icon, label, active, badge, className = '' }: any) {
  return (
    <button className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium w-full text-left
      ${active ? 'bg-primary text-primary-foreground shadow-md' : 'text-foreground/70 hover:bg-white/40 hover:text-foreground'} 
      ${className}
    `}>
      {icon}
      <span>{label}</span>
      {badge && (
        <span className="ml-auto bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ title, value, trend, icon, color, isStatus }: any) {
  const colorMap: any = {
    blue: 'from-blue-500/10 to-blue-500/5 text-blue-600 border-blue-500/20',
    purple: 'from-purple-500/10 to-purple-500/5 text-purple-600 border-purple-500/20',
    green: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-500/20',
    orange: 'from-orange-500/10 to-orange-500/5 text-orange-600 border-orange-500/20',
  };

  return (
    <div className={`glass-panel rounded-3xl p-6 bg-gradient-to-br ${colorMap[color]} border transition-transform hover:scale-[1.02] cursor-default`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-white/60 shadow-sm backdrop-blur-md`}>
          {icon}
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-white/60 shadow-sm ${isStatus ? 'text-emerald-600' : 'text-foreground/70'}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground/60 mb-1">{title}</p>
        <h4 className="text-3xl font-black text-foreground tracking-tight">{value}</h4>
      </div>
    </div>
  );
}

function ActivityItem({ title, time, type }: any) {
  const colors: any = {
    user: 'bg-blue-500',
    ai: 'bg-purple-500',
    content: 'bg-emerald-500',
    warning: 'bg-orange-500',
  };

  return (
    <div className="flex items-start gap-3">
      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${colors[type]}`}></div>
      <div>
        <p className="text-sm font-medium text-foreground/80">{title}</p>
        <p className="text-xs text-foreground/50">{time}</p>
      </div>
    </div>
  );
}

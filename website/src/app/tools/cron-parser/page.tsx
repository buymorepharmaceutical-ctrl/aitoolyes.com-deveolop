'use client';
import { useState, useMemo } from 'react';
import cronstrue from 'cronstrue';
import parseExpression from 'cron-parser';
import { Clock, CalendarClock, Info, AlertTriangle, ArrowRight } from 'lucide-react';

export default function CronParser() {
  const [cron, setCron] = useState('0 0 * * *');

  const { description, nextDates, error } = useMemo(() => {
    if (!cron.trim()) {
      return { description: '', nextDates: [], error: null };
    }

    try {
      // 1. Get Human Readable Description
      const desc = cronstrue.toString(cron, { throwExceptionOnParseError: true });
      
      // 2. Get Next 5 Execution Dates
      const interval = (parseExpression as any).parseExpression ? (parseExpression as any).parseExpression(cron) : (parseExpression as any)(cron);
      const dates = [];
      for (let i = 0; i < 5; i++) {
        dates.push(interval.next().toDate().toLocaleString());
      }

      return { description: desc, nextDates: dates, error: null };
    } catch (e) {
      return { description: '', nextDates: [], error: e instanceof Error ? e.message : 'Invalid Cron Expression' };
    }
  }, [cron]);

  const presetCrons = [
    { label: 'Every minute', val: '* * * * *' },
    { label: 'Every 5 minutes', val: '*/5 * * * *' },
    { label: 'Every hour', val: '0 * * * *' },
    { label: 'Every day at midnight', val: '0 0 * * *' },
    { label: 'Every Monday at 9AM', val: '0 9 * * 1' },
    { label: 'First day of month', val: '0 0 1 * *' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] gap-6 p-4 lg:p-8 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Clock className="w-8 h-8 text-primary" />
          Cron Job Parser
        </h1>
        <p className="text-foreground/70 mt-1">Translate cron expressions into human-readable text and see the next execution dates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        
        {/* Left Side: Input & Presets */}
        <div className="flex flex-col gap-6">
          <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-card-border p-6 shadow-sm">
            <h2 className="font-bold mb-4">Cron Expression</h2>
            <div className="relative">
              <input 
                type="text" 
                value={cron}
                onChange={(e) => setCron(e.target.value)}
                className={`w-full text-center text-4xl font-mono py-6 rounded-xl border-2 focus:outline-none transition-all shadow-inner \${error ? 'border-red-400 bg-red-50 text-red-600' : 'border-card-border bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10'}`}
                placeholder="* * * * *"
              />
            </div>
            
            <div className="grid grid-cols-5 gap-2 mt-4 text-center text-xs font-semibold text-foreground/50 uppercase tracking-widest">
              <div>Minute</div>
              <div>Hour</div>
              <div>Day(Month)</div>
              <div>Month</div>
              <div>Day(Week)</div>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-card-border p-6 shadow-sm">
            <h2 className="font-bold mb-4 text-sm uppercase tracking-wider text-foreground/60">Common Presets</h2>
            <div className="flex flex-wrap gap-2">
              {presetCrons.map((p, i) => (
                <button 
                  key={i}
                  onClick={() => setCron(p.val)}
                  className="bg-white border border-card-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/5 hover:border-primary/30 transition-all text-left flex flex-col gap-1"
                >
                  <span className="font-bold">{p.label}</span>
                  <span className="font-mono text-xs text-primary">{p.val}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Results */}
        <div className="flex flex-col gap-6">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm flex items-start gap-4 text-red-600">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-1">Invalid Expression</h3>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Human Readable */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-2 text-primary font-bold mb-3 uppercase tracking-wider text-sm">
                  <Info className="w-5 h-5" />
                  Explanation
                </div>
                <div className="text-3xl font-bold leading-tight text-foreground">
                  "{description}"
                </div>
              </div>

              {/* Next Executions */}
              <div className="bg-white/60 backdrop-blur-md border border-card-border rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col">
                <div className="bg-white/80 px-6 py-4 border-b border-card-border flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-green-600" />
                  <h2 className="font-bold text-lg">Next 5 Executions</h2>
                </div>
                <div className="p-6 flex flex-col gap-3">
                  {nextDates.map((date, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white border border-card-border p-4 rounded-xl shadow-sm">
                      <div className="bg-green-100 text-green-700 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div className="font-mono text-lg font-medium">{date}</div>
                      {idx === 0 && (
                        <div className="ml-auto text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                          Next Up
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

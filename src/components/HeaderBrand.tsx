import React from 'react';
import { Activity, Gamepad2, ShieldCheck, Power, Cpu, RefreshCw } from 'lucide-react';

interface HeaderBrandProps {
  ghubRunning: boolean;
  setGhubRunning: (v: boolean | ((prev: boolean) => boolean)) => void;
  rlRunning: boolean;
  setRlRunning: (v: boolean | ((prev: boolean) => boolean)) => void;
  hookStatus: 'OFF' | 'INSPECTED' | 'ON';
  addLog: (text: string, level?: 'info' | 'success' | 'warn' | 'error' | 'action') => void;
}

export const HeaderBrand: React.FC<HeaderBrandProps> = ({
  ghubRunning,
  setGhubRunning,
  rlRunning,
  setRlRunning,
  hookStatus,
  addLog,
}) => {
  const toggleGHub = () => {
    setGhubRunning((prev) => {
      const next = !prev;
      addLog(
        next
          ? '[G HUB] Service agent connected (PID: 14208).'
          : '[G HUB] Service stopped by user.',
        next ? 'success' : 'warn'
      );
      return next;
    });
  };

  const toggleRL = () => {
    setRlRunning((prev) => {
      const next = !prev;
      addLog(
        next
          ? '[GAME] RocketLeague.exe detected in foreground (PID: 8840).'
          : '[GAME] Rocket League closed.',
        next ? 'success' : 'info'
      );
      return next;
    });
  };

  return (
    <header id="header-brand-panel" className="w-full space-y-2">
      {/* Brand Title Bar */}
      <div
        id="brand-header-bar"
        className="flex flex-wrap items-center justify-between border border-[#2b3a55] bg-gradient-to-r from-[#141e2d] via-[#101926] to-[#141e2d] px-4 py-2.5 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-amber-500/40 bg-amber-500/10 text-amber-400">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-mono text-sm md:text-base font-bold tracking-wider text-amber-400 uppercase">
              FN ROCKET LEAGUE ESPORTS ENGINE v7.0 - TABBED CORE
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              Logitech G HUB Lua Dispatcher • TAInput 0-Delay Physics • Micro-Dash Subsystem
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            id="hook-badge"
            className={`px-2.5 py-0.5 rounded text-[11px] font-bold border transition-colors ${
              hookStatus === 'ON'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                : hookStatus === 'INSPECTED'
                ? 'bg-amber-950/80 border-amber-500 text-amber-400'
                : 'bg-red-950/70 border-red-500/50 text-red-400'
            }`}
          >
            HOOK: {hookStatus === 'ON' ? '[ON] ACTIVE' : hookStatus === 'INSPECTED' ? 'READY' : '[OFF] INACTIVE'}
          </span>
        </div>
      </div>

      {/* Service Status Monitoring Panel */}
      <div
        id="status-monitoring-panel"
        className="grid grid-cols-1 md:grid-cols-2 gap-2 border border-[#23232c] bg-[#19191e] px-4 py-2 text-xs font-mono"
      >
        <div className="flex items-center justify-between py-0.5">
          <div className="flex items-center gap-2">
            <Activity className={`h-3.5 w-3.5 ${ghubRunning ? 'text-lime-400 animate-pulse' : 'text-red-400'}`} />
            <span className="text-slate-300 font-semibold">G HUB SERVICE STATUS:</span>
            <span className={`font-bold ${ghubRunning ? 'text-lime-400' : 'text-red-400'}`}>
              {ghubRunning ? 'ONLINE (RUNNING - PID: 14208)' : 'OFFLINE (SERVICE STOPPED)'}
            </span>
          </div>
          <button
            id="toggle-ghub-btn"
            onClick={toggleGHub}
            title="Toggle G HUB Service status simulation"
            className="text-[10px] px-2 py-0.5 border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded transition"
          >
            {ghubRunning ? 'Stop' : 'Start'}
          </button>
        </div>

        <div className="flex items-center justify-between py-0.5 border-t md:border-t-0 md:border-l border-slate-800/80 md:pl-3">
          <div className="flex items-center gap-2">
            <Gamepad2 className={`h-3.5 w-3.5 ${rlRunning ? 'text-lime-400 animate-pulse' : 'text-amber-500'}`} />
            <span className="text-slate-300 font-semibold">ROCKET LEAGUE STATUS:</span>
            <span className={`font-bold ${rlRunning ? 'text-lime-400' : 'text-orange-400'}`}>
              {rlRunning ? 'ONLINE (ACTIVE GAME - PID: 8840)' : 'OFFLINE (GAME NOT RUNNING)'}
            </span>
          </div>
          <button
            id="toggle-rl-btn"
            onClick={toggleRL}
            title="Toggle Rocket League process simulation"
            className="text-[10px] px-2 py-0.5 border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded transition"
          >
            {rlRunning ? 'Close' : 'Launch'}
          </button>
        </div>
      </div>
    </header>
  );
};

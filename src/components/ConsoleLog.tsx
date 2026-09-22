import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { LogEntry } from '../types';

interface ConsoleLogProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const ConsoleLog: React.FC<ConsoleLogProps> = ({ logs, onClear }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div id="console-log-container" className="w-full border border-[#1f2430] bg-[#0a0a0a]">
      <div className="flex items-center justify-between border-b border-[#1c1f26] px-3 py-1 bg-[#12141a] text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <Terminal className="h-3 w-3 text-emerald-400" />
          <span className="font-semibold text-slate-300">CONSOLE LOG OUTPUT</span>
          <span className="text-[10px] text-slate-500">({logs.length} events recorded)</span>
        </div>
        <button
          id="clear-console-logs-btn"
          onClick={onClear}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-red-400 transition"
          title="Clear console log"
        >
          <Trash2 className="h-2.5 w-2.5" />
          <span>Clear</span>
        </button>
      </div>

      <div
        id="console-log-scrollbox"
        ref={scrollRef}
        className="h-28 overflow-y-auto p-2.5 font-mono text-xs space-y-1 select-text"
      >
        {logs.map((log) => {
          let colorClass = 'text-lime-400';
          if (log.level === 'warn') colorClass = 'text-yellow-400';
          if (log.level === 'error') colorClass = 'text-red-400 font-bold';
          if (log.level === 'action') colorClass = 'text-cyan-400 font-semibold';
          if (log.level === 'info') colorClass = 'text-slate-300';

          return (
            <div key={log.id} className="leading-snug break-words">
              <span className="text-slate-500 mr-2">[{log.timestamp}]</span>
              <span className={colorClass}>{log.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  Play,
  RotateCcw,
  History,
  Shield,
  Zap,
  Radio,
  Eye,
  Edit3,
} from 'lucide-react';
import { downloadFile } from '../utils/generators';

interface TabLuaProps {
  luaScript: string;
  setLuaScript: React.Dispatch<React.SetStateAction<string>>;
  onCreateLuaConfig: () => void;
  onBackupLua: () => void;
  onRestoreLua: (content: string) => void;
  luaBackups: { id: string; timestamp: string; content: string }[];
  hookStatus: 'OFF' | 'INSPECTED' | 'ON';
  setHookStatus: (status: 'OFF' | 'INSPECTED' | 'ON') => void;
  addLog: (text: string, level?: 'info' | 'success' | 'warn' | 'error' | 'action') => void;
  dodgeDeadzone: string;
  dashGKeyIndex: number;
  speedGKeyIndex: number;
}

export const TabLua: React.FC<TabLuaProps> = ({
  luaScript,
  setLuaScript,
  onCreateLuaConfig,
  onBackupLua,
  onRestoreLua,
  luaBackups,
  hookStatus,
  setHookStatus,
  addLog,
  dodgeDeadzone,
  dashGKeyIndex,
  speedGKeyIndex,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedAction, setSimulatedAction] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(luaScript);
    setCopied(true);
    addLog('[LUA] Script copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadFile(luaScript, 'RocketLeague_Macros.lua');
    addLog('[LUA] Downloaded RocketLeague_Macros.lua.', 'success');
  };

  const inspectAndCreateHook = () => {
    setHookStatus('INSPECTED');
    addLog(
      `[HOOK INSPECTION] Loaded Hook Config -> Preset Dodge DZ: ${dodgeDeadzone} | Status: INSPECTED & READY`,
      'info'
    );
  };

  const setHookOn = () => {
    setHookStatus('ON');
    addLog('[ENGINE HOOK] Engaged Active Engine Memory Control. [ON]', 'success');
  };

  const setHookOff = () => {
    setHookStatus('OFF');
    addLog('[ENGINE HOOK] Disengaged Engine Control. [OFF]', 'warn');
  };

  // Live Lua environment simulation
  const simulateGEvent = async (actionType: 'dash' | 'speedflip') => {
    setIsSimulating(true);
    const ddzNum = parseFloat(dodgeDeadzone) || 0.05;

    if (actionType === 'dash') {
      const delay1 = Math.max(10, Math.floor(32 * (ddzNum / 0.05)));
      const delay2 = Math.max(5, Math.floor(15 * (ddzNum / 0.05)));
      setSimulatedAction(`Adaptive Dash (G${dashGKeyIndex})`);
      addLog(`[LIVE MON] G_PRESSED received: arg=${dashGKeyIndex} (Dash G-Key)`, 'action');
      addLog(`[LIVE MON] PressMouseButton(3) [RightClick / Jump]`, 'action');
      await new Promise((r) => setTimeout(r, delay1 * 4));
      addLog(`[LIVE MON] ReleaseMouseButton(3) after ${delay1}ms sleep`, 'action');
      await new Promise((r) => setTimeout(r, delay2 * 4));
      addLog(`[LIVE MON] PressMouseButton(3) [Second Jump / Dodge]`, 'action');
      await new Promise((r) => setTimeout(r, delay1 * 4));
      addLog(`[LIVE MON] ReleaseMouseButton(3) after ${delay1}ms sleep`, 'action');
      addLog(
        `[LIVE MON] ACTION: Adaptive Dash Executed | Delays: ${delay1}ms / ${delay2}ms`,
        'success'
      );
    } else {
      setSimulatedAction(`Adaptive Speedflip (G${speedGKeyIndex})`);
      addLog(`[LIVE MON] G_PRESSED received: arg=${speedGKeyIndex} (Speedflip G-Key)`, 'action');
      addLog(`[LIVE MON] PressMouseButton(1) [LeftClick / Boost] + PressMouseButton(3) [Jump]`, 'action');
      await new Promise((r) => setTimeout(r, 140));
      addLog(`[LIVE MON] ReleaseMouseButton(3) (35ms) + Sleep (15ms)`, 'action');
      await new Promise((r) => setTimeout(r, 60));
      addLog(`[LIVE MON] PressMouseButton(3) [Dodge Flip Diagonal]`, 'action');
      await new Promise((r) => setTimeout(r, 300));
      addLog(`[LIVE MON] ReleaseMouseButton(3) & ReleaseMouseButton(1) [Flip Complete]`, 'action');
      addLog(
        `[LIVE MON] ACTION: Adaptive Speedflip Executed | Dodge DZ: ${dodgeDeadzone}`,
        'success'
      );
    }

    setIsSimulating(false);
    setTimeout(() => setSimulatedAction(null), 2500);
  };

  return (
    <div id="tab-lua-container" className="space-y-4">
      {/* 1. Lua Engine Config & Runtime Suite */}
      <section
        id="grp-lua-suite"
        className="rounded border border-emerald-700/60 bg-[#121218] p-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs md:text-sm font-bold tracking-wider text-emerald-400 uppercase font-mono">
              LUA ENGINE CONFIG & RUNTIME SUITE
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              id="copy-lua-btn"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
              title="Copy Lua Script"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              id="download-lua-btn"
              onClick={handleDownload}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
              title="Download Lua file"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Action Buttons row matching FN_Engine_v50.ps1 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 font-mono text-xs">
          <button
            id="btn-create-lua-config"
            onClick={onCreateLuaConfig}
            className="rounded bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold py-2.5 px-3 transition shadow"
          >
            CREATE LUA CONFIG
          </button>

          <button
            id="btn-edit-lua-config"
            onClick={() => setIsEditing(!isEditing)}
            className="rounded bg-emerald-850 hover:bg-emerald-800 active:bg-emerald-900 border border-emerald-600 text-white font-bold py-2.5 px-3 transition shadow flex items-center justify-center gap-1.5"
          >
            {isEditing ? <Eye className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
            <span>{isEditing ? 'VIEW MODE' : 'EDIT LUA CONFIG'}</span>
          </button>

          <button
            id="btn-backup-lua"
            onClick={onBackupLua}
            className="rounded bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-800 text-white font-bold py-2.5 px-3 transition shadow flex items-center justify-center gap-1.5"
          >
            <History className="h-3.5 w-3.5" />
            <span>BACKUP LUA CONFIG</span>
          </button>

          <button
            id="btn-restore-lua"
            onClick={() => setShowRestoreModal(true)}
            className="rounded bg-amber-700 hover:bg-amber-600 active:bg-amber-800 text-white font-bold py-2.5 px-3 transition shadow flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>RESTORE LUA ({luaBackups.length})</span>
          </button>
        </div>

        {/* Live Simulation Trigger Row */}
        <div className="rounded border border-purple-900/60 bg-[#161220] p-3 mb-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Radio className={`h-4 w-4 ${isSimulating ? 'text-purple-400 animate-ping' : 'text-purple-400'}`} />
              <span className="font-mono text-xs font-bold text-purple-300 uppercase">
                LIVE LUA ENVIRONMENT & MACRO MONITOR
              </span>
            </div>
            {simulatedAction && (
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-purple-950 border border-purple-500 text-purple-200">
                Triggered: {simulatedAction}
              </span>
            )}
          </div>
          <p className="text-[11px] font-mono text-slate-400 mb-2">
            Test macro event triggers in real-time. Calculated delays adjust adaptively to Internal Dodge DZ ({dodgeDeadzone}).
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              id="test-dash-macro-btn"
              disabled={isSimulating}
              onClick={() => simulateGEvent('dash')}
              className="flex-1 min-w-[180px] rounded bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-mono text-xs font-bold py-2 px-3 transition flex items-center justify-center gap-2"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>TEST ADAPTIVE DASH (G{dashGKeyIndex})</span>
            </button>
            <button
              id="test-speedflip-macro-btn"
              disabled={isSimulating}
              onClick={() => simulateGEvent('speedflip')}
              className="flex-1 min-w-[180px] rounded bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 text-white font-mono text-xs font-bold py-2 px-3 transition flex items-center justify-center gap-2"
            >
              <Play className="h-3.5 w-3.5" />
              <span>TEST SPEEDFLIP (G{speedGKeyIndex})</span>
            </button>
          </div>
        </div>

        {/* Lua Code Display / Editor */}
        <div className="relative rounded border border-[#232733] bg-[#0c0d14]">
          <div className="flex items-center justify-between border-b border-[#1f2330] px-3 py-1.5 text-[11px] font-mono text-slate-400 bg-[#12141c]">
            <span>RocketLeague_Macros.lua</span>
            <span className="text-[10px] text-emerald-400">
              {isEditing ? 'Editing Mode Active' : 'Read-Only Preview'}
            </span>
          </div>
          {isEditing ? (
            <textarea
              id="lua-editor-textarea"
              value={luaScript}
              onChange={(e) => setLuaScript(e.target.value)}
              className="w-full h-64 p-3 font-mono text-xs bg-transparent text-emerald-300 focus:outline-none resize-y selection:bg-emerald-900"
              spellCheck={false}
            />
          ) : (
            <pre className="h-64 overflow-auto p-3 font-mono text-xs text-emerald-300/90 whitespace-pre selection:bg-emerald-900">
              <code>{luaScript}</code>
            </pre>
          )}
        </div>
      </section>

      {/* 2. Physical Engine Hook Controller */}
      <section
        id="grp-engine-hook"
        className="rounded border border-amber-700/60 bg-[#121218] p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-amber-400" />
          <h2 className="text-xs md:text-sm font-bold tracking-wider text-amber-400 uppercase font-mono">
            PHYSICAL ENGINE HOOK CONTROLLER
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center font-mono text-xs">
          <button
            id="btn-inspect-create-hook"
            onClick={inspectAndCreateHook}
            className="rounded bg-sky-700 hover:bg-sky-600 active:bg-sky-800 text-white font-bold py-2.5 px-3 transition shadow"
          >
            INSPECT & CREATE HOOK
          </button>

          <button
            id="btn-hook-on"
            onClick={setHookOn}
            className="rounded bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-2.5 px-3 transition shadow"
          >
            HOOK [ON]
          </button>

          <button
            id="btn-hook-off"
            onClick={setHookOff}
            className="rounded bg-red-700 hover:bg-red-600 active:bg-red-800 text-white font-bold py-2.5 px-3 transition shadow"
          >
            HOOK [OFF]
          </button>

          <div className="text-center sm:text-right">
            <span
              id="hook-detailed-status"
              className={`inline-block font-mono text-xs font-bold px-3 py-1.5 rounded border ${
                hookStatus === 'ON'
                  ? 'border-emerald-500 bg-emerald-950/60 text-emerald-400'
                  : hookStatus === 'INSPECTED'
                  ? 'border-amber-500 bg-amber-950/60 text-amber-400'
                  : 'border-red-500 bg-red-950/60 text-red-400'
              }`}
            >
              HOOK STATUS: {hookStatus === 'ON' ? '[ON] ACTIVE' : hookStatus === 'INSPECTED' ? 'INSPECTED & READY' : '[OFF] INACTIVE'}
            </span>
          </div>
        </div>
      </section>

      {/* Restore Lua Backups Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 font-mono">
          <div className="w-full max-w-lg rounded border border-slate-700 bg-[#161822] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h3 className="text-sm font-bold text-amber-400 uppercase">
                Restore Lua Config Snapshot
              </h3>
              <button
                onClick={() => setShowRestoreModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1"
              >
                Close [✕]
              </button>
            </div>

            {luaBackups.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No backups saved yet. Click "BACKUP LUA CONFIG" to capture snapshots.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {luaBackups.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded border border-slate-800 bg-[#0f1118] p-2.5 text-xs"
                  >
                    <div>
                      <div className="text-slate-200 font-semibold">{b.id}</div>
                      <div className="text-[10px] text-slate-500">{b.timestamp}</div>
                    </div>
                    <button
                      onClick={() => {
                        onRestoreLua(b.content);
                        setShowRestoreModal(false);
                      }}
                      className="rounded bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 text-xs font-bold transition"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

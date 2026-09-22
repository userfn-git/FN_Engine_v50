import React, { useState, useEffect } from 'react';
import {
  PhysicsConfig,
  KeyBindings,
  GKeyMapping,
  TrainingPack,
  LogEntry,
  TabKey,
} from './types';
import {
  INITIAL_TRAINING_PACKS,
  DEADZONE_PRESETS,
  HARDWARE_PROFILES,
  ANGLE_JITTER_OPTIONS,
  G_KEYS_LIST,
} from './data/initialData';
import {
  generateLuaScript,
  generateTAInputIni,
  getGKeyIndex,
} from './utils/generators';
import { HeaderBrand } from './components/HeaderBrand';
import { ConsoleLog } from './components/ConsoleLog';
import { TabPhysics } from './components/TabPhysics';
import { TabLua } from './components/TabLua';
import { TabTAInput } from './components/TabTAInput';
import { TabTraining } from './components/TabTraining';
import { TabApiReference } from './components/TabApiReference';
import { Sliders, FileCode, FileText, Trophy, BookOpen } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabKey>('physics');

  // Process / Hook simulation states
  const [ghubRunning, setGhubRunning] = useState<boolean>(true);
  const [rlRunning, setRlRunning] = useState<boolean>(true);
  const [hookStatus, setHookStatus] = useState<'OFF' | 'INSPECTED' | 'ON'>('OFF');

  // Core configurations
  const [physics, setPhysics] = useState<PhysicsConfig>({
    internalDeadzone: DEADZONE_PRESETS[1], // 0.07 (NWPO Esports Pro)
    dodgeDeadzone: '0.05',
    hardwareProfile: HARDWARE_PROFILES[0], // KBM Esports Pro (Logitech G502X)
    axisAngleJitter: ANGLE_JITTER_OPTIONS[2], // 1.0 Deg (Pro)
  });

  const [keys, setKeys] = useState<KeyBindings>({
    aerialKey: 'SpaceBar',
    speedflipKey: 'LeftShift',
    halfFlipKey: 'S',
  });

  const [gkeys, setGkeys] = useState<GKeyMapping>({
    dashGKey: G_KEYS_LIST[2], // G3 (MB3)
    speedGKey: G_KEYS_LIST[4], // G5 (MB5)
  });

  // Training packs
  const [packs, setPacks] = useState<TrainingPack[]>(INITIAL_TRAINING_PACKS);

  // File contents & backups
  const [luaScript, setLuaScript] = useState<string>('');
  const [taInputContent, setTaInputContent] = useState<string>('');
  const [luaBackups, setLuaBackups] = useState<{ id: string; timestamp: string; content: string }[]>([]);
  const [taBackups, setTaBackups] = useState<{ id: string; timestamp: string; content: string }[]>([]);

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      text: '[INFO] FN Esports Master Engine v7.0 Tabbed Core Online.',
      level: 'info',
    },
    {
      id: 'log-2',
      timestamp: new Date().toLocaleTimeString(),
      text: '[TABBED UI] Integrated Multi-Tab Suite Active.',
      level: 'info',
    },
  ]);

  const addLog = (
    text: string,
    level: 'info' | 'success' | 'warn' | 'error' | 'action' = 'info'
  ) => {
    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      text,
      level,
    };
    setLogs((prev) => [...prev, newEntry]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  // Sync initial generation
  useEffect(() => {
    const initialLua = generateLuaScript(physics, keys, gkeys);
    setLuaScript(initialLua);
    const initialTA = generateTAInputIni(physics.dodgeDeadzone);
    setTaInputContent(initialTA);
  }, []);

  // Handlers matching FN_Engine_v50.ps1 actions
  const handleApplyUnifiedPhysics = () => {
    const dz = physics.internalDeadzone.split(' ')[0] || '0.07';
    const ddz = physics.dodgeDeadzone || '0.05';
    const hwProf = physics.hardwareProfile;

    const newLua = generateLuaScript(physics, keys, gkeys);
    setLuaScript(newLua);

    const newTA = generateTAInputIni(ddz);
    setTaInputContent(newTA);

    addLog(
      `[PHYSICS SUCCESS] Hardware Profile: '${hwProf}' Injected! Internal DZ: ${dz}, Dodge DZ: ${ddz}`,
      'success'
    );
  };

  const handleApplyGKeys = () => {
    const newLua = generateLuaScript(physics, keys, gkeys);
    setLuaScript(newLua);
    addLog('[G-KEYS] Mouse & Full G1-G6 Mappings Applied to Advanced Lua Engine.', 'success');
  };

  const handleCreateLuaConfig = () => {
    const newLua = generateLuaScript(physics, keys, gkeys);
    setLuaScript(newLua);
    addLog('[LUA ENGINE] Generated Advanced Lua Config.', 'success');
  };

  const handleBackupLua = () => {
    const timeStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupId = `RocketLeague_Macros_${timeStr}.lua.bak`;
    setLuaBackups((prev) => [
      { id: backupId, timestamp: new Date().toLocaleString(), content: luaScript },
      ...prev,
    ]);
    addLog(`[LUA BACKUP] Saved Lua Backup: ${backupId}`, 'success');
  };

  const handleRestoreLua = (content: string) => {
    setLuaScript(content);
    addLog('[LUA RESTORE] Restored Lua Script successfully.', 'success');
  };

  const handleCreateTAInput = () => {
    const ddz = physics.dodgeDeadzone || '0.05';
    const newTA = generateTAInputIni(ddz);
    setTaInputContent(newTA);
    addLog('[SUCCESS] Injected Direct FN Engine Physics into TAInput.ini.', 'success');
  };

  const handleBackupTAInput = () => {
    const timeStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupId = `TAInput_${timeStr}.ini.bak`;
    setTaBackups((prev) => [
      { id: backupId, timestamp: new Date().toLocaleString(), content: taInputContent },
      ...prev,
    ]);
    addLog(`[TAINPUT BACKUP] Saved TAInput.ini backup: ${backupId}`, 'success');
  };

  const handleRestoreTAInput = (content: string) => {
    setTaInputContent(content);
    addLog('[TAINPUT RESTORE] Restored TAInput.ini from backup!', 'success');
  };

  const handleLaunchGame = () => {
    setRlRunning(true);
    addLog('[LAUNCH] Rocket League Signal Sent (com.epicgames.launcher://apps/Sugar?action=launch).', 'action');
  };

  return (
    <div id="main-app-container" className="min-h-screen bg-[#0c0c12] text-slate-200 p-2 sm:p-4 md:p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-3">
        {/* Top Branding & Process Status */}
        <HeaderBrand
          ghubRunning={ghubRunning}
          setGhubRunning={setGhubRunning}
          rlRunning={rlRunning}
          setRlRunning={setRlRunning}
          hookStatus={hookStatus}
          addLog={addLog}
        />

        {/* Real-time Console Log Box */}
        <ConsoleLog logs={logs} onClear={handleClearLogs} />

        {/* Tab Navigation Bar */}
        <div id="tab-navigation-bar" className="flex flex-wrap border-b border-[#2a2e3d] bg-[#12141c] rounded-t font-mono text-xs md:text-sm">
          <button
            id="tab-btn-physics"
            onClick={() => setActiveTab('physics')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold transition-all border-b-2 ${
              activeTab === 'physics'
                ? 'border-fuchsia-500 text-fuchsia-400 bg-[#171724]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#151722]'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Physics & Bindings</span>
          </button>

          <button
            id="tab-btn-lua"
            onClick={() => setActiveTab('lua')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold transition-all border-b-2 ${
              activeTab === 'lua'
                ? 'border-emerald-500 text-emerald-400 bg-[#171724]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#151722]'
            }`}
          >
            <FileCode className="h-4 w-4" />
            <span>Lua & Engine Hook</span>
          </button>

          <button
            id="tab-btn-tainput"
            onClick={() => setActiveTab('tainput')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold transition-all border-b-2 ${
              activeTab === 'tainput'
                ? 'border-purple-500 text-purple-400 bg-[#171724]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#151722]'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>TAInput & G HUB Interop</span>
          </button>

          <button
            id="tab-btn-training"
            onClick={() => setActiveTab('training')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold transition-all border-b-2 ${
              activeTab === 'training'
                ? 'border-cyan-500 text-cyan-400 bg-[#171724]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#151722]'
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>Training & Launchers</span>
          </button>

          <button
            id="tab-btn-apiref"
            onClick={() => setActiveTab('apiref')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold transition-all border-b-2 ${
              activeTab === 'apiref'
                ? 'border-amber-500 text-amber-400 bg-[#171724]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#151722]'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>G HUB Lua Docs</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <main id="tab-body-content" className="rounded-b border border-t-0 border-[#232733] bg-[#0e0e14] p-3 md:p-5 shadow-lg">
          {activeTab === 'physics' && (
            <TabPhysics
              physics={physics}
              setPhysics={setPhysics}
              keys={keys}
              setKeys={setKeys}
              gkeys={gkeys}
              setGkeys={setGkeys}
              onApplyUnifiedPhysics={handleApplyUnifiedPhysics}
              onApplyGKeys={handleApplyGKeys}
            />
          )}

          {activeTab === 'lua' && (
            <TabLua
              luaScript={luaScript}
              setLuaScript={setLuaScript}
              onCreateLuaConfig={handleCreateLuaConfig}
              onBackupLua={handleBackupLua}
              onRestoreLua={handleRestoreLua}
              luaBackups={luaBackups}
              hookStatus={hookStatus}
              setHookStatus={setHookStatus}
              addLog={addLog}
              dodgeDeadzone={physics.dodgeDeadzone}
              dashGKeyIndex={getGKeyIndex(gkeys.dashGKey)}
              speedGKeyIndex={getGKeyIndex(gkeys.speedGKey)}
            />
          )}

          {activeTab === 'tainput' && (
            <TabTAInput
              taInputContent={taInputContent}
              setTaInputContent={setTaInputContent}
              onCreateTAInput={handleCreateTAInput}
              onBackupTAInput={handleBackupTAInput}
              onRestoreTAInput={handleRestoreTAInput}
              taBackups={taBackups}
              addLog={addLog}
              ghubRunning={ghubRunning}
              setGhubRunning={setGhubRunning}
            />
          )}

          {activeTab === 'training' && (
            <TabTraining
              packs={packs}
              setPacks={setPacks}
              addLog={addLog}
              onLaunchGame={handleLaunchGame}
            />
          )}

          {activeTab === 'apiref' && <TabApiReference />}
        </main>
      </div>
    </div>
  );
};

export default App;

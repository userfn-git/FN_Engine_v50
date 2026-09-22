import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  RotateCcw,
  History,
  Eye,
  Edit3,
  Server,
  RefreshCw,
  Send,
  Database,
} from 'lucide-react';
import { downloadFile } from '../utils/generators';

interface TabTAInputProps {
  taInputContent: string;
  setTaInputContent: React.Dispatch<React.SetStateAction<string>>;
  onCreateTAInput: () => void;
  onBackupTAInput: () => void;
  onRestoreTAInput: (content: string) => void;
  taBackups: { id: string; timestamp: string; content: string }[];
  addLog: (text: string, level?: 'info' | 'success' | 'warn' | 'error' | 'action') => void;
  ghubRunning: boolean;
  setGhubRunning: (v: boolean) => void;
}

export const TabTAInput: React.FC<TabTAInputProps> = ({
  taInputContent,
  setTaInputContent,
  onCreateTAInput,
  onBackupTAInput,
  onRestoreTAInput,
  taBackups,
  addLog,
  ghubRunning,
  setGhubRunning,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [ghubBackups, setGhubBackups] = useState<string[]>([]);

  const handleCopy = () => {
    navigator.clipboard.writeText(taInputContent);
    setCopied(true);
    addLog('[TAINPUT] Copied TAInput.ini contents to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadFile(taInputContent, 'TAInput.ini');
    addLog('[TAINPUT] Downloaded TAInput.ini configuration file.', 'success');
  };

  const handleStartGHub = () => {
    setGhubRunning(true);
    addLog('[G HUB] Launched All G HUB Background Services (agent, updater, core).', 'success');
  };

  const handleRestartGHub = () => {
    addLog('[G HUB] Stopping LGHUB processes...', 'warn');
    setGhubRunning(false);
    setTimeout(() => {
      setGhubRunning(true);
      addLog('[G HUB] Restarted Services Cleanly with Active Profile.', 'success');
    }, 800);
  };

  const handleBackupGHub = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupName = `settings_${timestamp}.db`;
    setGhubBackups((prev) => [backupName, ...prev]);
    addLog(`[G HUB BACKUP] Saved Settings DB snapshot: ${backupName}`, 'success');
  };

  const handleRestoreGHub = () => {
    if (ghubBackups.length === 0) {
      addLog('[G HUB RESTORE ERROR] settings.db backup not found. Create a backup first.', 'error');
      return;
    }
    const target = ghubBackups[0];
    addLog(`[G HUB RESTORE] Restored DB from: ${target}`, 'info');
    handleRestartGHub();
  };

  const handleWin32PostMessage = () => {
    if (!ghubRunning) {
      addLog('[G HUB ERROR] Target G HUB Window handle not found. Service offline.', 'error');
      return;
    }
    addLog('[G HUB] Sent Ctrl+S signal in background via PostMessage (HWND 0x002A14).', 'action');
    addLog('[G HUB] Active Lua macro profile recompiled and executed.', 'success');
  };

  return (
    <div id="tab-tainput-container" className="space-y-4">
      {/* 1. TAInput.ini Configuration Manager */}
      <section
        id="grp-tainput-suite"
        className="rounded border border-purple-800/60 bg-[#121218] p-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-400" />
            <h2 className="text-xs md:text-sm font-bold tracking-wider text-purple-400 uppercase font-mono">
              TAINPUT.INI CONFIGURATION MANAGER
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              id="copy-tainput-btn"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
              title="Copy TAInput.ini"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-purple-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              id="download-tainput-btn"
              onClick={handleDownload}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
              title="Download TAInput.ini file"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Buttons row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 font-mono text-xs">
          <button
            id="btn-create-tainput"
            onClick={onCreateTAInput}
            className="rounded bg-purple-700 hover:bg-purple-600 active:bg-purple-800 text-white font-bold py-2.5 px-3 transition shadow"
          >
            CREATE TAINPUT
          </button>

          <button
            id="btn-edit-tainput"
            onClick={() => setIsEditing(!isEditing)}
            className="rounded bg-purple-900 hover:bg-purple-800 active:bg-purple-950 border border-purple-600 text-white font-bold py-2.5 px-3 transition shadow flex items-center justify-center gap-1.5"
          >
            {isEditing ? <Eye className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
            <span>{isEditing ? 'VIEW MODE' : 'EDIT TAINPUT'}</span>
          </button>

          <button
            id="btn-backup-tainput"
            onClick={onBackupTAInput}
            className="rounded bg-teal-700 hover:bg-teal-600 active:bg-teal-800 text-white font-bold py-2.5 px-3 transition shadow flex items-center justify-center gap-1.5"
          >
            <History className="h-3.5 w-3.5" />
            <span>BACKUP TAINPUT</span>
          </button>

          <button
            id="btn-restore-tainput"
            onClick={() => setShowRestoreModal(true)}
            className="rounded bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white font-bold py-2.5 px-3 transition shadow flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>RESTORE TAINPUT ({taBackups.length})</span>
          </button>
        </div>

        {/* Content Preview/Editor */}
        <div className="rounded border border-[#232733] bg-[#0c0d14]">
          <div className="flex items-center justify-between border-b border-[#1f2330] px-3 py-1.5 text-[11px] font-mono text-slate-400 bg-[#12141c]">
            <span>TAInput.ini (Rocket League Config Direct Injection)</span>
            <span className="text-[10px] text-purple-400">
              {isEditing ? 'Editing Mode Active' : 'Read-Only Preview'}
            </span>
          </div>
          {isEditing ? (
            <textarea
              id="tainput-editor-textarea"
              value={taInputContent}
              onChange={(e) => setTaInputContent(e.target.value)}
              className="w-full h-56 p-3 font-mono text-xs bg-transparent text-purple-200 focus:outline-none resize-y selection:bg-purple-900"
              spellCheck={false}
            />
          ) : (
            <pre className="h-56 overflow-auto p-3 font-mono text-xs text-purple-200/90 whitespace-pre selection:bg-purple-900">
              <code>{taInputContent}</code>
            </pre>
          )}
        </div>
      </section>

      {/* 2. Logitech G HUB Service & Profile Suite */}
      <section
        id="grp-ghub-suite"
        className="rounded border border-amber-600/60 bg-[#121218] p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <Server className="h-4 w-4 text-amber-400" />
          <h2 className="text-xs md:text-sm font-bold tracking-wider text-amber-400 uppercase font-mono">
            LOGITECH G HUB SERVICE & PROFILE SUITE
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 font-mono text-xs">
          <button
            id="btn-start-ghub"
            onClick={handleStartGHub}
            className="rounded bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold py-2.5 px-3 transition shadow"
          >
            START G HUB SUITE
          </button>

          <button
            id="btn-restart-ghub"
            onClick={handleRestartGHub}
            className="rounded bg-rose-700 hover:bg-rose-600 active:bg-rose-800 text-white font-bold py-2.5 px-3 transition shadow flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>RESTART G HUB SUITE</span>
          </button>

          <button
            id="btn-backup-ghub"
            onClick={handleBackupGHub}
            className="rounded bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-800 text-white font-bold py-2.5 px-3 transition shadow flex items-center justify-center gap-1.5"
          >
            <Database className="h-3.5 w-3.5" />
            <span>BACKUP SETTINGS</span>
          </button>

          <button
            id="btn-restore-ghub"
            onClick={handleRestoreGHub}
            className="rounded bg-amber-700 hover:bg-amber-600 active:bg-amber-800 text-white font-bold py-2.5 px-3 transition shadow flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>RESTORE SETTINGS</span>
          </button>
        </div>

        <button
          id="btn-save-run-ghub"
          onClick={handleWin32PostMessage}
          className="w-full flex items-center justify-center gap-2 rounded bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-mono text-xs md:text-sm font-bold py-2.5 px-4 shadow transition"
        >
          <Send className="h-4 w-4" />
          <span>SAVE & RUN SCRIPT IN G HUB (WIN32 POSTMESSAGE SIMULATOR)</span>
        </button>
      </section>

      {/* Restore TAInput Backups Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 font-mono">
          <div className="w-full max-w-lg rounded border border-slate-700 bg-[#161822] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h3 className="text-sm font-bold text-purple-400 uppercase">
                Restore TAInput.ini Snapshot
              </h3>
              <button
                onClick={() => setShowRestoreModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1"
              >
                Close [✕]
              </button>
            </div>

            {taBackups.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No backups saved yet. Click "BACKUP TAINPUT" to capture snapshots.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {taBackups.map((b) => (
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
                        onRestoreTAInput(b.content);
                        setShowRestoreModal(false);
                      }}
                      className="rounded bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 text-xs font-bold transition"
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

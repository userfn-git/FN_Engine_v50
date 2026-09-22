import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Copy,
  Trash2,
  Folder,
  Map,
  Play,
  Check,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { TrainingPack } from '../types';

interface TabTrainingProps {
  packs: TrainingPack[];
  setPacks: React.Dispatch<React.SetStateAction<TrainingPack[]>>;
  addLog: (text: string, level?: 'info' | 'success' | 'warn' | 'error' | 'action') => void;
  onLaunchGame: () => void;
}

export const TabTraining: React.FC<TabTrainingProps> = ({
  packs,
  setPacks,
  addLog,
  onLaunchGame,
}) => {
  const [packName, setPackName] = useState('My Custom Pack');
  const [packCode, setPackCode] = useState('FA8A-2DA1-E2F5-5080');
  const [selectedPackId, setSelectedPackId] = useState<string>(packs[0]?.id || '');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const selectedPack = packs.find((p) => p.id === selectedPackId);

  const handleAddFavorite = () => {
    if (!packName.trim() || !packCode.trim()) {
      addLog('[FAVORITES ERROR] Pack name and code are required.', 'error');
      return;
    }
    const newPack: TrainingPack = {
      id: `pack-${Date.now()}`,
      name: packName.trim(),
      code: packCode.trim(),
      difficulty: 'Advanced',
    };
    setPacks((prev) => [newPack, ...prev]);
    setSelectedPackId(newPack.id);
    addLog(`[FAVORITES] Added '${newPack.name}' (${newPack.code}) successfully.`, 'success');
  };

  const handleCopySelected = (codeToCopy?: string) => {
    const target = codeToCopy || selectedPack?.code;
    if (target) {
      navigator.clipboard.writeText(target);
      setCopiedCode(target);
      addLog(`[TRAINING] Copied Code (${target}) to Clipboard!`, 'action');
      setTimeout(() => setCopiedCode(null), 2000);
    } else {
      addLog('[TRAINING] Please select a training pack first.', 'warn');
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedPackId) return;
    const toDelete = packs.find((p) => p.id === selectedPackId);
    setPacks((prev) => prev.filter((p) => p.id !== selectedPackId));
    setSelectedPackId(packs[1]?.id || '');
    addLog(`[FAVORITES] Removed selected item: ${toDelete?.name || ''}`, 'warn');
  };

  const handleOpenTrainingDir = () => {
    addLog('[TRAINING] Simulated opening Training Favorites Directory (%USERDOCS%\\TAGame\\Training\\Favorites).', 'info');
  };

  const handleOpenWorkshop = () => {
    addLog('[TRAINING] Simulated opening Workshop Maps & CookedPCConsole Directory.', 'info');
  };

  const handleOpenReplays = () => {
    addLog('[REPLAYS] Simulated opening Replays Directory (%USERDOCS%\\TAGame\\DemosEpic).', 'info');
  };

  const handleOpenConfigDir = () => {
    addLog('[CONFIG] Simulated opening Rocket League Config Directory (%USERDOCS%\\TAGame\\Config).', 'info');
  };

  return (
    <div id="tab-training-container" className="space-y-4">
      {/* 1. Custom Training & Favorites Manager Suite */}
      <section
        id="grp-training-suite"
        className="rounded border border-cyan-800/60 bg-[#121218] p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-cyan-400" />
          <h2 className="text-xs md:text-sm font-bold tracking-wider text-cyan-400 uppercase font-mono">
            CUSTOM TRAINING & FAVORITES MANAGER SUITE
          </h2>
        </div>

        {/* Input Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 mb-3 font-mono text-xs items-end">
          <div className="lg:col-span-4">
            <label htmlFor="input-pack-name" className="block text-slate-300 mb-1 font-semibold">
              Pack Name:
            </label>
            <input
              id="input-pack-name"
              type="text"
              value={packName}
              onChange={(e) => setPackName(e.target.value)}
              className="w-full bg-[#1e1e24] border border-slate-700 rounded px-2.5 py-1.5 text-cyan-400 focus:border-cyan-400 focus:outline-none"
              placeholder="My Custom Pack"
            />
          </div>

          <div className="lg:col-span-4">
            <label htmlFor="input-pack-code" className="block text-slate-300 mb-1 font-semibold">
              Code:
            </label>
            <input
              id="input-pack-code"
              type="text"
              value={packCode}
              onChange={(e) => setPackCode(e.target.value)}
              className="w-full bg-[#1e1e24] border border-slate-700 rounded px-2.5 py-1.5 text-cyan-400 focus:border-cyan-400 focus:outline-none uppercase font-mono tracking-wider"
              placeholder="FA8A-2DA1-E2F5-5080"
            />
          </div>

          <div className="lg:col-span-4 flex gap-2">
            <button
              id="btn-add-fav"
              onClick={handleAddFavorite}
              className="flex-1 rounded bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold py-1.5 px-3 transition shadow flex items-center justify-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>ADD FAVORITE</span>
            </button>
          </div>
        </div>

        {/* Main List and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
          {/* Listbox */}
          <div className="lg:col-span-8 rounded border border-slate-800 bg-[#14141c] overflow-hidden">
            <div className="p-2 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between bg-[#191924]">
              <span>SAVED TRAINING PACKS ({packs.length})</span>
              <span>NAME | CODE</span>
            </div>
            <div className="max-h-52 overflow-y-auto p-1.5 space-y-1 font-mono text-xs">
              {packs.map((pack) => {
                const isSelected = pack.id === selectedPackId;
                return (
                  <div
                    key={pack.id}
                    onClick={() => setSelectedPackId(pack.id)}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition select-none ${
                      isSelected
                        ? 'bg-cyan-950/80 border border-cyan-500/80 text-cyan-300'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold text-white">{pack.name}</span>
                      <span className="text-slate-500 text-[11px] ml-2">[{pack.code}]</span>
                    </div>
                    {pack.difficulty && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 shrink-0">
                        {pack.difficulty}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action sidebar buttons */}
          <div className="lg:col-span-4 flex flex-col gap-2 font-mono text-xs">
            <button
              id="btn-copy-selected"
              onClick={() => handleCopySelected()}
              className="flex-1 rounded bg-fuchsia-700 hover:bg-fuchsia-600 active:bg-fuchsia-800 text-white font-bold py-2 px-3 transition shadow flex items-center justify-center gap-1.5"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 text-lime-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCode ? 'COPIED TO CLIPBOARD!' : 'COPY SELECTED'}</span>
            </button>

            <button
              id="btn-open-traindir"
              onClick={handleOpenTrainingDir}
              className="flex-1 rounded bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white font-bold py-2 px-3 transition shadow flex items-center justify-center gap-1.5"
            >
              <Folder className="h-3.5 w-3.5 text-amber-400" />
              <span>TRAINING DIR</span>
            </button>

            <button
              id="btn-custom-maps"
              onClick={handleOpenWorkshop}
              className="flex-1 rounded bg-sky-700 hover:bg-sky-600 active:bg-sky-800 text-white font-bold py-2 px-3 transition shadow flex items-center justify-center gap-1.5"
            >
              <Map className="h-3.5 w-3.5 text-emerald-400" />
              <span>WORKSHOP MAPS</span>
            </button>

            <button
              id="btn-delete-fav"
              onClick={handleDeleteSelected}
              className="flex-1 rounded bg-red-700 hover:bg-red-600 active:bg-red-800 text-white font-bold py-2 px-3 transition shadow flex items-center justify-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>DELETE SELECTED</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Game Launcher & Directory Suite */}
      <section
        id="grp-launcher-suite"
        className="rounded border border-amber-600/60 bg-[#121218] p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <Play className="h-4 w-4 text-amber-400" />
          <h2 className="text-xs md:text-sm font-bold tracking-wider text-amber-400 uppercase font-mono">
            GAME LAUNCHER & DIRECTORY SUITE
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <button
            id="btn-start-rl"
            onClick={onLaunchGame}
            className="rounded bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold py-3 px-3 transition shadow flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4 text-amber-300" />
            <span>START ROCKET LEAGUE</span>
          </button>

          <button
            id="btn-open-replays"
            onClick={handleOpenReplays}
            className="rounded bg-amber-700 hover:bg-amber-600 active:bg-amber-800 text-white font-bold py-3 px-3 transition shadow flex items-center justify-center gap-2"
          >
            <FolderOpen className="h-4 w-4" />
            <span>OPEN REPLAYS FOLDER</span>
          </button>

          <button
            id="btn-open-gamedir"
            onClick={handleOpenConfigDir}
            className="rounded bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-800 text-white font-bold py-3 px-3 transition shadow flex items-center justify-center gap-2"
          >
            <Folder className="h-4 w-4" />
            <span>OPEN CONFIG DIRECTORY</span>
          </button>
        </div>
      </section>
    </div>
  );
};

import React from 'react';
import {
  PhysicsConfig,
  KeyBindings,
  GKeyMapping,
} from '../types';
import {
  DEADZONE_PRESETS,
  HARDWARE_PROFILES,
  ANGLE_JITTER_OPTIONS,
  VALID_KB_KEYS,
  G_KEYS_LIST,
} from '../data/initialData';
import { Zap, Sliders, Keyboard, MousePointerClick } from 'lucide-react';

interface TabPhysicsProps {
  physics: PhysicsConfig;
  setPhysics: React.Dispatch<React.SetStateAction<PhysicsConfig>>;
  keys: KeyBindings;
  setKeys: React.Dispatch<React.SetStateAction<KeyBindings>>;
  gkeys: GKeyMapping;
  setGkeys: React.Dispatch<React.SetStateAction<GKeyMapping>>;
  onApplyUnifiedPhysics: () => void;
  onApplyGKeys: () => void;
}

export const TabPhysics: React.FC<TabPhysicsProps> = ({
  physics,
  setPhysics,
  keys,
  setKeys,
  gkeys,
  setGkeys,
  onApplyUnifiedPhysics,
  onApplyGKeys,
}) => {
  return (
    <div id="tab-physics-container" className="space-y-4">
      {/* 1. Pro Internal Physics & Hardware Profile */}
      <section
        id="grp-physics-profile"
        className="rounded border border-fuchsia-800/60 bg-[#121218] p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="h-4 w-4 text-fuchsia-400" />
          <h2 className="text-xs md:text-sm font-bold tracking-wider text-fuchsia-400 uppercase font-mono">
            PRO INTERNAL PHYSICS & HARDWARE PROFILE
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono mb-4">
          <div>
            <label htmlFor="select-dz-preset" className="block text-slate-300 mb-1.5 font-semibold">
              Internal DZ Preset:
            </label>
            <select
              id="select-dz-preset"
              value={physics.internalDeadzone}
              onChange={(e) =>
                setPhysics((prev) => ({ ...prev, internalDeadzone: e.target.value }))
              }
              className="w-full bg-[#1e1e24] border border-slate-700 rounded px-2.5 py-1.5 text-cyan-400 focus:border-cyan-400 focus:outline-none"
            >
              {DEADZONE_PRESETS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="input-dodge-dz" className="block text-slate-300 mb-1.5 font-semibold">
              Internal Dodge DZ:
            </label>
            <input
              id="input-dodge-dz"
              type="text"
              value={physics.dodgeDeadzone}
              onChange={(e) =>
                setPhysics((prev) => ({ ...prev, dodgeDeadzone: e.target.value }))
              }
              className="w-full bg-[#1e1e24] border border-slate-700 rounded px-2.5 py-1.5 text-cyan-400 focus:border-cyan-400 focus:outline-none"
              placeholder="0.05"
            />
          </div>

          <div>
            <label htmlFor="select-hw-profile" className="block text-slate-300 mb-1.5 font-semibold">
              Hardware Profile:
            </label>
            <select
              id="select-hw-profile"
              value={physics.hardwareProfile}
              onChange={(e) =>
                setPhysics((prev) => ({ ...prev, hardwareProfile: e.target.value }))
              }
              className="w-full bg-[#1e1e24] border border-slate-700 rounded px-2.5 py-1.5 text-cyan-400 focus:border-cyan-400 focus:outline-none"
            >
              {HARDWARE_PROFILES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="select-angle-jitter" className="block text-slate-300 mb-1.5 font-semibold">
              Axis Angle Jitter:
            </label>
            <select
              id="select-angle-jitter"
              value={physics.axisAngleJitter}
              onChange={(e) =>
                setPhysics((prev) => ({ ...prev, axisAngleJitter: e.target.value }))
              }
              className="w-full bg-[#1e1e24] border border-slate-700 rounded px-2.5 py-1.5 text-cyan-400 focus:border-cyan-400 focus:outline-none"
            >
              {ANGLE_JITTER_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          id="btn-apply-unified-physics"
          onClick={onApplyUnifiedPhysics}
          className="w-full flex items-center justify-center gap-2 rounded bg-fuchsia-700 hover:bg-fuchsia-600 active:bg-fuchsia-800 text-white font-mono text-xs md:text-sm font-bold py-2.5 px-4 shadow transition duration-150"
        >
          <Zap className="h-4 w-4" />
          <span>APPLY & INJECT PRO HARDWARE SETTINGS</span>
        </button>
      </section>

      {/* 2. Standard Keyboard Essential Bindings */}
      <section
        id="grp-keyboard-bindings"
        className="rounded border border-cyan-800/60 bg-[#121218] p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <Keyboard className="h-4 w-4 text-cyan-400" />
          <h2 className="text-xs md:text-sm font-bold tracking-wider text-cyan-400 uppercase font-mono">
            STANDARD KEYBOARD ESSENTIAL BINDINGS
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label htmlFor="select-aerial-key" className="block text-slate-300 mb-1.5 font-semibold">
              Aerial Key:
            </label>
            <select
              id="select-aerial-key"
              value={keys.aerialKey}
              onChange={(e) => setKeys((prev) => ({ ...prev, aerialKey: e.target.value }))}
              className="w-full bg-[#1e1e24] border border-slate-700 rounded px-2.5 py-1.5 text-cyan-400 focus:border-cyan-400 focus:outline-none"
            >
              {VALID_KB_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="select-speedflip-key" className="block text-slate-300 mb-1.5 font-semibold">
              Speedflip Key:
            </label>
            <select
              id="select-speedflip-key"
              value={keys.speedflipKey}
              onChange={(e) => setKeys((prev) => ({ ...prev, speedflipKey: e.target.value }))}
              className="w-full bg-[#1e1e24] border border-slate-700 rounded px-2.5 py-1.5 text-cyan-400 focus:border-cyan-400 focus:outline-none"
            >
              {VALID_KB_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="select-halfflip-key" className="block text-slate-300 mb-1.5 font-semibold">
              HalfFlip Key:
            </label>
            <select
              id="select-halfflip-key"
              value={keys.halfFlipKey}
              onChange={(e) => setKeys((prev) => ({ ...prev, halfFlipKey: e.target.value }))}
              className="w-full bg-[#1e1e24] border border-slate-700 rounded px-2.5 py-1.5 text-cyan-400 focus:border-cyan-400 focus:outline-none"
            >
              {VALID_KB_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 3. Logitech G-Keys Mapping Suite (Full G1-G6) */}
      <section
        id="grp-gkeys-suite"
        className="rounded border border-amber-700/60 bg-[#121218] p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <MousePointerClick className="h-4 w-4 text-amber-400" />
          <h2 className="text-xs md:text-sm font-bold tracking-wider text-amber-400 uppercase font-mono">
            LOGITECH G-KEYS MAPPING SUITE (FULL G1-G6)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono items-end">
          <div>
            <label htmlFor="select-dash-gkey" className="block text-slate-300 mb-1.5 font-semibold">
              Dash G-Key:
            </label>
            <select
              id="select-dash-gkey"
              value={gkeys.dashGKey}
              onChange={(e) => setGkeys((prev) => ({ ...prev, dashGKey: e.target.value }))}
              className="w-full bg-[#1e1e24] border border-slate-700 rounded px-2.5 py-1.5 text-cyan-400 focus:border-cyan-400 focus:outline-none"
            >
              {G_KEYS_LIST.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="select-speed-gkey" className="block text-slate-300 mb-1.5 font-semibold">
              Speedflip G-Key:
            </label>
            <select
              id="select-speed-gkey"
              value={gkeys.speedGKey}
              onChange={(e) => setGkeys((prev) => ({ ...prev, speedGKey: e.target.value }))}
              className="w-full bg-[#1e1e24] border border-slate-700 rounded px-2.5 py-1.5 text-cyan-400 focus:border-cyan-400 focus:outline-none"
            >
              {G_KEYS_LIST.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              id="btn-save-gkeys"
              onClick={onApplyGKeys}
              className="w-full rounded bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-mono text-xs font-bold py-2 px-3 shadow transition"
            >
              APPLY ALL KEYS & GENERATE LUA
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

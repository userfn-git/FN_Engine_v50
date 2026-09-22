import React, { useState } from 'react';
import { BookOpen, Search, Code, Copy, Check } from 'lucide-react';

interface ApiDocItem {
  name: string;
  category: string;
  syntax: string;
  description: string;
  example: string;
}

const API_DOCS: ApiDocItem[] = [
  {
    name: 'OnEvent',
    category: 'Core',
    syntax: 'function OnEvent(event, arg [, family])',
    description: 'Handles script events (PROFILE_ACTIVATED, G_PRESSED, G_RELEASED, MOUSE_BUTTON_PRESSED, etc.).',
    example: `function OnEvent(event, arg, family)
    if event == "G_PRESSED" and arg == 1 then
        OutputLogMessage("G1 key pressed\\n")
    end
end`,
  },
  {
    name: 'PressMouseButton',
    category: 'Mouse',
    syntax: 'PressMouseButton(button)',
    description: 'Simulates mouse button down: 1 (Left/Boost), 2 (Middle), 3 (Right/Jump), 4 (MB4), 5 (MB5).',
    example: 'PressMouseButton(1) -- Press left mouse button / Boost',
  },
  {
    name: 'ReleaseMouseButton',
    category: 'Mouse',
    syntax: 'ReleaseMouseButton(button)',
    description: 'Simulates mouse button release.',
    example: 'ReleaseMouseButton(1) -- Release left mouse button',
  },
  {
    name: 'PressAndReleaseMouseButton',
    category: 'Mouse',
    syntax: 'PressAndReleaseMouseButton(button)',
    description: 'Simulates an atomic mouse click (press and immediate release).',
    example: 'PressAndReleaseMouseButton(3) -- Jump click',
  },
  {
    name: 'Sleep',
    category: 'Core',
    syntax: 'Sleep(timeout)',
    description: 'Pauses the script for the specified duration in milliseconds.',
    example: 'Sleep(35) -- Micro-wait 35ms for dodge physics window',
  },
  {
    name: 'OutputLogMessage',
    category: 'Core',
    syntax: 'OutputLogMessage(...)',
    description: 'Sends a formatted printf string to the G HUB script editor console.',
    example: 'OutputLogMessage("Speedflip Dodge DZ: %s\\n", tostring(CONFIG.InternalDodgeDZ))',
  },
  {
    name: 'MoveMouseRelative',
    category: 'Mouse',
    syntax: 'MoveMouseRelative(x, y)',
    description: 'Moves mouse cursor relative to current position in screen pixels.',
    example: 'MoveMouseRelative(10, -5) -- Adjust steering or camera',
  },
  {
    name: 'PressKey',
    category: 'Keyboard',
    syntax: 'PressKey(keyname)',
    description: 'Simulates a keyboard key press by name or scancode (e.g. "w", "spacebar", "shift").',
    example: 'PressKey("shift")',
  },
  {
    name: 'ReleaseKey',
    category: 'Keyboard',
    syntax: 'ReleaseKey(keyname)',
    description: 'Simulates a keyboard key release.',
    example: 'ReleaseKey("shift")',
  },
  {
    name: 'PressAndReleaseKey',
    category: 'Keyboard',
    syntax: 'PressAndReleaseKey(keyname)',
    description: 'Simulates a key press followed by a release.',
    example: 'PressAndReleaseKey("w")',
  },
  {
    name: 'IsMouseButtonPressed',
    category: 'Mouse',
    syntax: 'boolean = IsMouseButtonPressed(button)',
    description: 'Checks if a mouse button is currently held down.',
    example: 'if IsMouseButtonPressed(1) then OutputLogMessage("Boost active\\n") end',
  },
];

export const TabApiReference: React.FC = () => {
  const [search, setSearch] = useState('');
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const filtered = API_DOCS.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (name: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  return (
    <div id="tab-api-ref-container" className="space-y-4 font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border border-slate-700 bg-[#121218] p-3 rounded">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wide">
            Logitech G HUB Lua API Reference (v2023.5)
          </h2>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            id="search-api-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search API functions..."
            className="w-full bg-[#1b1c26] border border-slate-700 rounded pl-8 pr-2.5 py-1.5 text-cyan-300 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
        {filtered.map((item) => (
          <div
            key={item.name}
            className="rounded border border-slate-800 bg-[#14151f] p-3 space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-cyan-400">{item.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-400">
                  {item.category}
                </span>
              </div>
              <div className="bg-[#0c0d14] px-2 py-1 rounded border border-slate-800 text-emerald-400 text-[11px] my-1 font-semibold">
                {item.syntax}
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">{item.description}</p>
            </div>

            <div className="relative rounded bg-[#0a0a0f] p-2 border border-slate-900 text-[11px] text-slate-400">
              <pre className="overflow-x-auto text-emerald-300/80">
                <code>{item.example}</code>
              </pre>
              <button
                onClick={() => handleCopy(item.name, item.example)}
                className="absolute top-1.5 right-1.5 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Copy example"
              >
                {copiedName === item.name ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import { TrainingPack } from '../types';

export const INITIAL_TRAINING_PACKS: TrainingPack[] = [
  {
    id: 'pack-1',
    name: 'Musty Speedflip Kickoff Test',
    code: 'A503-264C-A7C4-27B2',
    description: 'The golden standard pack to test speedflip timing and kickoffs.',
    difficulty: 'Pro / Esports',
  },
  {
    id: 'pack-2',
    name: 'FA8A Pro Custom Aerials',
    code: 'FA8A-2DA1-E2F5-5080',
    description: 'High-speed redirection and aerial recovery pack from the FN engine.',
    difficulty: 'Advanced',
  },
  {
    id: 'pack-3',
    name: "Biddle's Consistency",
    code: '444B-C7E2-901B-71E6',
    description: '50 shots designed to build muscle memory across all angles.',
    difficulty: 'Intermediate',
  },
  {
    id: 'pack-4',
    name: 'Air Dribble & Flip Resets',
    code: '9D87-258C-3705-2049',
    description: 'Off-the-wall setup and ceiling recovery mechanics.',
    difficulty: 'Pro / Esports',
  },
  {
    id: 'pack-5',
    name: 'Deevo Double Tap Playground',
    code: '23BC-0377-C228-A338',
    description: 'Wall reads and backboard bounce predictions.',
    difficulty: 'Advanced',
  },
];

export const VALID_KB_KEYS = [
  'SpaceBar',
  'LeftShift',
  'S',
  'W',
  'A',
  'D',
  'Q',
  'E',
  'LeftControl',
  'F',
  'R',
  'C',
];

export const G_KEYS_LIST = [
  'G1 (Left Click / Boost)',
  'G2 (Right Click / Jump)',
  'G3 (MB3)',
  'G4 (MB4)',
  'G5 (MB5)',
  'G6 (Macro)',
];

export const DEADZONE_PRESETS = [
  '0.05 (RW9 Ultra Fast)',
  '0.07 (NWPO Esports Pro)',
  '0.10 (Standard Precision)',
];

export const HARDWARE_PROFILES = [
  'KBM Esports Pro (Logitech G502X)',
  'Pure Keyboard & Mouse',
  'Hybrid Controller/KBM',
];

export const ANGLE_JITTER_OPTIONS = [
  '0.0 Deg (Off)',
  '0.5 Deg (Micro)',
  '1.0 Deg (Pro)',
  '2.0 Deg (Esports)',
];

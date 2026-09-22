export interface PhysicsConfig {
  internalDeadzone: string;
  dodgeDeadzone: string;
  hardwareProfile: string;
  axisAngleJitter: string;
}

export interface KeyBindings {
  aerialKey: string;
  speedflipKey: string;
  halfFlipKey: string;
}

export interface GKeyMapping {
  dashGKey: string;
  speedGKey: string;
}

export interface TrainingPack {
  id: string;
  name: string;
  code: string;
  description?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro / Esports';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  text: string;
  level: 'info' | 'success' | 'warn' | 'error' | 'action';
}

export type TabKey = 'physics' | 'lua' | 'tainput' | 'training' | 'apiref';

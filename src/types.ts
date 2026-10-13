/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MilestoneKey =
  | 'cn'
  | 'cnu'
  | 'sd'
  | 'sdu'
  | 'dd'
  | 'ddu'
  | 'cd'
  | 'cdu'
  | 'con';

export type Stage =
  | 'CN'
  | 'SD'
  | 'DD'
  | 'CD'
  | 'Construction'
  | 'On hold'
  | 'Completed';

export interface MilestoneMeta {
  key: MilestoneKey;
  label: string;
  phase: 'cn' | 'sd' | 'dd' | 'cd' | 'con';
  phaseName: string;
  isUpdate: boolean;
  colorHex: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

export const MILESTONES: MilestoneMeta[] = [
  {
    key: 'cn',
    label: 'CN',
    phase: 'cn',
    phaseName: 'Concept Design',
    isUpdate: false,
    colorHex: '#d97706', // amber-600
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-500',
  },
  {
    key: 'cnu',
    label: 'CN update',
    phase: 'cn',
    phaseName: 'Concept Update',
    isUpdate: true,
    colorHex: '#d97706',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-500',
  },
  {
    key: 'sd',
    label: 'SD',
    phase: 'sd',
    phaseName: 'Schematic Design',
    isUpdate: false,
    colorHex: '#2563eb', // blue-600
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeText: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-500',
  },
  {
    key: 'sdu',
    label: 'SD update',
    phase: 'sd',
    phaseName: 'Schematic Update',
    isUpdate: true,
    colorHex: '#2563eb',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeText: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-500',
  },
  {
    key: 'dd',
    label: 'DD',
    phase: 'dd',
    phaseName: 'Design Development',
    isUpdate: false,
    colorHex: '#7c3aed', // violet-600
    badgeBg: 'bg-violet-500/10 dark:bg-violet-500/20',
    badgeText: 'text-violet-700 dark:text-violet-300',
    borderColor: 'border-violet-500',
  },
  {
    key: 'ddu',
    label: 'DD update',
    phase: 'dd',
    phaseName: 'Design Dev Update',
    isUpdate: true,
    colorHex: '#7c3aed',
    badgeBg: 'bg-violet-500/10 dark:bg-violet-500/20',
    badgeText: 'text-violet-700 dark:text-violet-300',
    borderColor: 'border-violet-500',
  },
  {
    key: 'cd',
    label: 'CD',
    phase: 'cd',
    phaseName: 'Construction Docs',
    isUpdate: false,
    colorHex: '#ea580c', // orange-600
    badgeBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    badgeText: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-500',
  },
  {
    key: 'cdu',
    label: 'CD update',
    phase: 'cd',
    phaseName: 'CD Update',
    isUpdate: true,
    colorHex: '#ea580c',
    badgeBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    badgeText: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-500',
  },
  {
    key: 'con',
    label: 'Construction',
    phase: 'con',
    phaseName: 'Construction Phase',
    isUpdate: false,
    colorHex: '#059669', // emerald-600
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-500',
  },
];

export const STAGES: Stage[] = [
  'CN',
  'SD',
  'DD',
  'CD',
  'Construction',
  'On hold',
  'Completed',
];

export interface TaskItem {
  id: string;
  t: string; // text
  d: number; // 0 or 1 done status
}

export interface Project {
  id: number;
  no: string;
  name: string;
  stage: Stage;
  pm: string;
  design: string;
  dates: Partial<Record<MilestoneKey, string>>;
  tasks: TaskItem[];
  client?: string;
  notes?: string;
}

export type ViewMode = 'projects' | 'timeline' | 'overview';
export type ProjectLayoutMode = 'grid' | 'table';

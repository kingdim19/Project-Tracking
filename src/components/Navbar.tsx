/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FolderKanban,
  CalendarDays,
  BarChart3,
  Plus,
  ArrowUpDown,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ViewMode } from '../types';

interface NavbarProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onNewProject: () => void;
  onOpenDataModal: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  saveStatus: { time: string; error: boolean };
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onViewChange,
  onNewProject,
  onOpenDataModal,
  darkMode,
  onToggleDarkMode,
  saveStatus,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center font-bold shadow-sm shadow-teal-500/20">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
              Project Tracker
            </span>
            <span className="hidden sm:inline-block text-xs text-neutral-400 dark:text-neutral-500 font-mono">
              v2.0
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation views */}
        <nav className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/70 p-1 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
          <button
            type="button"
            onClick={() => onViewChange('projects')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
              activeView === 'projects'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Projects</span>
          </button>

          <button
            type="button"
            onClick={() => onViewChange('timeline')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
              activeView === 'timeline'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Timeline & Workload</span>
          </button>

          <button
            type="button"
            onClick={() => onViewChange('overview')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
              activeView === 'overview'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Studio Overview</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 font-mono">
            {saveStatus.error ? (
              <span className="flex items-center gap-1 text-rose-500">
                <AlertCircle className="w-3 h-3" /> Save failed
              </span>
            ) : (
              <span className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                {saveStatus.time ? `Saved ${saveStatus.time}` : 'Auto-saved'}
              </span>
            )}
          </div>

          {/* Import / Export */}
          <button
            type="button"
            onClick={onOpenDataModal}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
            title="Import / Export Data"
            aria-label="Import or Export JSON"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle color theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* New Project CTA */}
          <button
            type="button"
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg transition-all shadow-sm shadow-teal-600/20 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        </div>
      </div>
    </header>
  );
};

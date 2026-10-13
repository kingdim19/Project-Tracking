/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  Plus,
  AlertTriangle,
  FolderKanban,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Project, ViewMode, ProjectLayoutMode, Stage, STAGES, TaskItem } from './types';
import { SEED_PROJECTS } from './data/seed';
import { Navbar } from './components/Navbar';
import { ProjectCard } from './components/ProjectCard';
import { ProjectTableView } from './components/ProjectTableView';
import { TimelineGantt } from './components/TimelineGantt';
import { WorkloadOverview } from './components/WorkloadOverview';
import { ProjectModal } from './components/ProjectModal';
import { ImportExportModal } from './components/ImportExportModal';
import { getDaysDifference, getTodayIso } from './utils/date';

const STORAGE_KEY = 'ptrk';
const THEME_KEY = 'ptrk_theme';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [darkMode]);

  // Projects state
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any, idx: number) => ({
            id: p.id || Date.now() + idx,
            no: String(p.no || ''),
            name: String(p.name || 'Untitled'),
            stage: p.stage || 'CN',
            pm: String(p.pm || ''),
            design: String(p.design || ''),
            dates: p.dates || {},
            tasks: Array.isArray(p.tasks)
              ? p.tasks.map((t: any, tIdx: number) => ({
                  id: t.id || `task-${tIdx}`,
                  t: String(t.t || ''),
                  d: t.d ? 1 : 0,
                }))
              : [],
            client: p.client || '',
            notes: p.notes || '',
          }));
        }
      }
    } catch (e) {
      console.error('Failed to parse saved projects', e);
    }
    return JSON.parse(JSON.stringify(SEED_PROJECTS));
  });

  // Save status
  const [saveStatus, setSaveStatus] = useState<{ time: string; error: boolean }>({
    time: '',
    error: false,
  });

  // Auto-save effect
  const saveToStorage = useCallback((data: Project[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      const now = new Date();
      setSaveStatus({
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: false,
      });
    } catch (err) {
      setSaveStatus({ time: '', error: true });
    }
  }, []);

  // Update storage whenever projects change
  const updateProjects = (updater: (prev: Project[]) => Project[]) => {
    setProjects((prev) => {
      const next = updater(prev);
      saveToStorage(next);
      return next;
    });
  };

  // Listen to cross-tab storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setProjects(parsed);
          }
        } catch {
          // ignore corrupted cross-tab payload
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // View state
  const [activeView, setActiveView] = useState<ViewMode>('projects');
  const [projectLayout, setProjectLayout] = useState<ProjectLayoutMode>('grid');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'All' | Stage>('All');
  const [pmFilter, setPmFilter] = useState<string>('All');
  const [onlyOverdue, setOnlyOverdue] = useState<boolean>(false);

  // Modals
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [dataModalOpen, setDataModalOpen] = useState(false);

  // Distinct PM list for filtering
  const distinctPms = useMemo(() => {
    const pms = new Set<string>();
    projects.forEach((p) => {
      if (p.pm && p.pm.trim()) pms.add(p.pm.trim());
    });
    return Array.from(pms).sort();
  }, [projects]);

  // Filtered projects
  const todayIso = getTodayIso();
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // 1. Stage filter
      if (stageFilter !== 'All' && p.stage !== stageFilter) {
        return false;
      }

      // 2. PM filter
      if (pmFilter !== 'All' && p.pm !== pmFilter) {
        return false;
      }

      // 3. Only Overdue filter
      if (onlyOverdue) {
        if (p.stage === 'Completed') return false;
        const hasOverdueMilestone = Object.values(p.dates).some((d) => {
          if (!d) return false;
          return getDaysDifference(d, todayIso) < 0;
        });
        if (!hasOverdueMilestone) return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNo = p.no.toLowerCase().includes(q);
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesPm = p.pm.toLowerCase().includes(q);
        const matchesDesign = p.design.toLowerCase().includes(q);
        const matchesNotes = p.notes?.toLowerCase().includes(q) || false;
        const matchesTasks = p.tasks.some((t) => t.t.toLowerCase().includes(q));
        if (
          !matchesNo &&
          !matchesName &&
          !matchesPm &&
          !matchesDesign &&
          !matchesNotes &&
          !matchesTasks
        ) {
          return false;
        }
      }

      return true;
    });
  }, [projects, stageFilter, pmFilter, onlyOverdue, searchQuery, todayIso]);

  // Handlers for Project actions
  const handleSaveProject = (saved: Project) => {
    updateProjects((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      if (exists) {
        return prev.map((p) => (p.id === saved.id ? saved : p));
      } else {
        return [saved, ...prev];
      }
    });
  };

  const handleDeleteProject = (id: number) => {
    updateProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDuplicateProject = (source: Project) => {
    const copy: Project = {
      ...source,
      id: Date.now(),
      no: `${source.no}-COPY`,
      name: `${source.name} (Copy)`,
      tasks: source.tasks.map((t, idx) => ({
        ...t,
        id: `copy-${Date.now()}-${idx}`,
        d: 0,
      })),
    };
    updateProjects((prev) => [copy, ...prev]);
  };

  const handleToggleTask = (projectId: number, taskIndex: number) => {
    updateProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newTasks = p.tasks.map((t, i) =>
          i === taskIndex ? { ...t, d: t.d === 1 ? 0 : 1 } : t
        );
        return { ...p, tasks: newTasks };
      })
    );
  };

  const handleAddTask = (projectId: number, taskText: string) => {
    updateProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newTask: TaskItem = {
          id: `task-${Date.now()}-${Math.random()}`,
          t: taskText,
          d: 0,
        };
        return { ...p, tasks: [...p.tasks, newTask] };
      })
    );
  };

  const handleDeleteTask = (projectId: number, taskIndex: number) => {
    updateProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tasks: p.tasks.filter((_, i) => i !== taskIndex),
        };
      })
    );
  };

  const handleImportProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    saveToStorage(newProjects);
  };

  const handleResetSeed = () => {
    const reset = JSON.parse(JSON.stringify(SEED_PROJECTS));
    setProjects(reset);
    saveToStorage(reset);
  };

  const openNewProjectModal = () => {
    setEditingProject(null);
    setProjectModalOpen(true);
  };

  const openEditProjectModal = (proj: Project) => {
    setEditingProject(proj);
    setProjectModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors">
      {/* Top Bar Navigation */}
      <Navbar
        activeView={activeView}
        onViewChange={setActiveView}
        onNewProject={openNewProjectModal}
        onOpenDataModal={() => setDataModalOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        saveStatus={saveStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: PROJECTS (Cards & Table) */}
        {activeView === 'projects' && (
          <div className="space-y-5">
            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by project name, number, PM, designer, task..."
                    className="w-full text-xs pl-8 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Secondary Filters & View Toggles */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* PM Filter */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-neutral-400 font-medium hidden sm:inline">PM:</span>
                    <select
                      value={pmFilter}
                      onChange={(e) => setPmFilter(e.target.value)}
                      className="text-xs px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="All">All PMs</option>
                      {distinctPms.map((pm) => (
                        <option key={pm} value={pm}>
                          {pm}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Overdue Only Filter */}
                  <button
                    type="button"
                    onClick={() => setOnlyOverdue(!onlyOverdue)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      onlyOverdue
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                        : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Overdue only</span>
                  </button>

                  <span className="text-neutral-300 dark:text-neutral-700">|</span>

                  {/* Grid vs Table Layout Toggle */}
                  <div className="inline-flex items-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-0.5">
                    <button
                      type="button"
                      onClick={() => setProjectLayout('grid')}
                      className={`p-1.5 rounded transition-all ${
                        projectLayout === 'grid'
                          ? 'bg-white dark:bg-neutral-900 text-teal-600 dark:text-teal-400 shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                      title="Card Grid view"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setProjectLayout('table')}
                      className={`p-1.5 rounded transition-all ${
                        projectLayout === 'table'
                          ? 'bg-white dark:bg-neutral-900 text-teal-600 dark:text-teal-400 shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                      title="Table List view"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stage Filter Tabs (Horizontal scroll on mobile) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
                <span className="text-neutral-400 font-medium shrink-0 mr-1">Stage:</span>
                <button
                  type="button"
                  onClick={() => setStageFilter('All')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                    stageFilter === 'All'
                      ? 'bg-teal-600 text-white font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  All ({projects.length})
                </button>
                {STAGES.map((s) => {
                  const count = projects.filter((p) => p.stage === s).length;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStageFilter(s)}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                        stageFilter === s
                          ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold shadow-xs'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {s} {count > 0 && <span className="opacity-70 font-mono">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results count indicator */}
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 px-1 font-mono">
              <span>
                Showing {filteredProjects.length} of {projects.length} projects
              </span>
              {(searchQuery || stageFilter !== 'All' || pmFilter !== 'All' || onlyOverdue) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStageFilter('All');
                    setPmFilter('All');
                    setOnlyOverdue(false);
                  }}
                  className="text-teal-600 dark:text-teal-400 hover:underline font-sans"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Projects Presentation */}
            {filteredProjects.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-12 text-center shadow-xs">
                <FolderKanban className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  No projects match your filter criteria
                </h3>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-sm mx-auto mb-4">
                  Try clearing active search queries or stage filters, or create a new project.
                </p>
                <button
                  type="button"
                  onClick={openNewProjectModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Project</span>
                </button>
              </div>
            ) : projectLayout === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProjects.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    onEdit={openEditProjectModal}
                    onDelete={handleDeleteProject}
                    onDuplicate={handleDuplicateProject}
                    onToggleTask={handleToggleTask}
                    onAddTask={handleAddTask}
                    onDeleteTask={handleDeleteTask}
                  />
                ))}
              </div>
            ) : (
              <ProjectTableView
                projects={filteredProjects}
                onEdit={openEditProjectModal}
                onDelete={handleDeleteProject}
                onDuplicate={handleDuplicateProject}
              />
            )}
          </div>
        )}

        {/* VIEW 2: TIMELINE & GANTT */}
        {activeView === 'timeline' && (
          <TimelineGantt
            projects={projects}
            onEditProject={openEditProjectModal}
          />
        )}

        {/* VIEW 3: STUDIO OVERVIEW */}
        {activeView === 'overview' && (
          <WorkloadOverview
            projects={projects}
            onSelectProject={(p) => {
              openEditProjectModal(p);
            }}
          />
        )}
      </main>

      {/* Modals */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        initialProject={editingProject}
      />

      <ImportExportModal
        isOpen={dataModalOpen}
        onClose={() => setDataModalOpen(false)}
        projects={projects}
        onImport={handleImportProjects}
        onResetSeed={handleResetSeed}
      />
    </div>
  );
}

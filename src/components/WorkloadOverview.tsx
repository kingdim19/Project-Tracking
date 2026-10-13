/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FolderKanban,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { Project, MILESTONES, MilestoneMeta, STAGES } from '../types';
import { formatDateFull, formatDateShort, getDaysDifference, getTodayIso } from '../utils/date';

interface WorkloadOverviewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export const WorkloadOverview: React.FC<WorkloadOverviewProps> = ({
  projects,
  onSelectProject,
}) => {
  const todayIso = getTodayIso();

  // 1. Collect all milestone deliverables with dates
  const allDeliverables: {
    project: Project;
    meta: MilestoneMeta;
    date: string;
    diff: number;
    isOverdue: boolean;
  }[] = [];

  projects.forEach((p) => {
    MILESTONES.forEach((m) => {
      const dateVal = p.dates[m.key];
      if (dateVal) {
        const diff = getDaysDifference(dateVal, todayIso);
        allDeliverables.push({
          project: p,
          meta: m,
          date: dateVal,
          diff,
          isOverdue: diff < 0 && p.stage !== 'Completed',
        });
      }
    });
  });

  // Sort by date ascending
  allDeliverables.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Overdue deliverables
  const overdueDeliverables = allDeliverables.filter((d) => d.isOverdue);

  // Upcoming deliverables in next 30 days
  const upcoming30Days = allDeliverables.filter((d) => d.diff >= 0 && d.diff <= 30);

  // Task stats
  let totalTasks = 0;
  let doneTasks = 0;
  projects.forEach((p) => {
    totalTasks += p.tasks.length;
    doneTasks += p.tasks.filter((t) => t.d === 1).length;
  });

  // Team capacity by PM
  const pmCounts: Record<string, number> = {};
  projects.forEach((p) => {
    const pm = p.pm || 'Unassigned';
    pmCounts[pm] = (pmCounts[pm] || 0) + 1;
  });

  // Team capacity by Design team (split by comma)
  const designerCounts: Record<string, number> = {};
  projects.forEach((p) => {
    if (p.design) {
      const names = p.design.split(',').map((s) => s.trim()).filter(Boolean);
      names.forEach((n) => {
        designerCounts[n] = (designerCounts[n] || 0) + 1;
      });
    }
  });

  // Stage distribution
  const stageCounts: Record<string, number> = {};
  STAGES.forEach((s) => (stageCounts[s] = 0));
  projects.forEach((p) => {
    stageCounts[p.stage] = (stageCounts[p.stage] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Active Projects</span>
            <FolderKanban className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-3xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
            {projects.length}
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            Across {Object.keys(stageCounts).filter((s) => stageCounts[s] > 0).length} stages
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Next 30 Days</span>
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-bold font-mono tracking-tight text-blue-600 dark:text-blue-400">
            {upcoming30Days.length}
          </div>
          <div className="text-xs text-neutral-400 mt-1">Deliverables scheduled</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Overdue Items</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div
            className={`text-3xl font-bold font-mono tracking-tight ${
              overdueDeliverables.length > 0 ? 'text-rose-600' : 'text-neutral-400'
            }`}
          >
            {overdueDeliverables.length}
          </div>
          <div className="text-xs text-neutral-400 mt-1">Requires immediate follow-up</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Tasks Done</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-3xl font-bold font-mono tracking-tight text-teal-600 dark:text-teal-400">
            {totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            {doneTasks} of {totalTasks} checklist items
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Deliverables vs. Team Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Upcoming Deliverables Queue */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Milestone Deliverables Schedule
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Chronological list of milestones coming up or needing submission
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-600 dark:text-neutral-400">
              {allDeliverables.length} milestones
            </span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {allDeliverables.slice(0, 12).map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectProject(item.project)}
                className="group flex items-center justify-between gap-3 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-3 h-3 rotate-45 shrink-0"
                    style={{
                      backgroundColor: item.meta.isUpdate
                        ? 'transparent'
                        : item.meta.colorHex,
                      border: `2px solid ${item.meta.colorHex}`,
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-neutral-400">
                        {item.project.no}
                      </span>
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                        {item.project.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {item.meta.label}
                      </span>
                      <span>({item.meta.phaseName})</span>
                      <span>·</span>
                      <span>PM: {item.project.pm}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {formatDateShort(item.date)}
                  </div>
                  <div
                    className={`text-[10px] font-mono font-medium ${
                      item.diff < 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : item.diff === 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-neutral-400'
                    }`}
                  >
                    {item.diff < 0
                      ? `${Math.abs(item.diff)}d overdue`
                      : item.diff === 0
                      ? 'Today'
                      : `In ${item.diff} days`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Team Capacity & Stage Pipeline */}
        <div className="space-y-6">
          {/* Project Managers */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Project Manager Load</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              {Object.entries(pmCounts).map(([pm, count]) => {
                const pct = Math.round((count / projects.length) * 100);
                return (
                  <div key={pm}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        {pm}
                      </span>
                      <span className="font-mono text-neutral-500">
                        {count} {count === 1 ? 'project' : 'projects'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-600 dark:bg-teal-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Design Team Assignments */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>Design Team Active Leads</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(designerCounts).map(([designer, count]) => (
                <div
                  key={designer}
                  className="px-2.5 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs flex items-center gap-1.5"
                >
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    {designer}
                  </span>
                  <span className="w-4 h-4 rounded-full bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 font-mono text-[10px] flex items-center justify-center font-bold">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stage Breakdown */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3">
              Stages Pipeline
            </h3>
            <div className="space-y-1.5 text-xs">
              {STAGES.map((s) => {
                const count = stageCounts[s] || 0;
                if (count === 0) return null;
                return (
                  <div key={s} className="flex items-center justify-between py-1">
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                      {s}
                    </span>
                    <span className="font-mono font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

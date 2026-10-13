/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Edit2, Trash2, Copy, AlertTriangle } from 'lucide-react';
import { Project, MILESTONES } from '../types';
import { formatDateShort, getDaysDifference, getTodayIso } from '../utils/date';

interface ProjectTableViewProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
  onDuplicate: (project: Project) => void;
}

export const ProjectTableView: React.FC<ProjectTableViewProps> = ({
  projects,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const todayIso = getTodayIso();

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4 w-28 font-mono">No.</th>
              <th className="py-3 px-4 min-w-[200px]">Project Name</th>
              <th className="py-3 px-4 w-24">Stage</th>
              <th className="py-3 px-4 w-28">PM</th>
              <th className="py-3 px-4 w-36">Design Team</th>
              <th className="py-3 px-4 min-w-[180px]">Next Milestone</th>
              <th className="py-3 px-4 w-32">Tasks Progress</th>
              <th className="py-3 px-4 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/70">
            {projects.map((p) => {
              const tasksTotal = p.tasks.length;
              const tasksDone = p.tasks.filter((t) => t.d === 1).length;
              const progressPercent = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

              // Find next upcoming milestone
              const activeMilestones = MILESTONES.filter((m) => !!p.dates[m.key]).map((m) => {
                const date = p.dates[m.key] as string;
                const diff = getDaysDifference(date, todayIso);
                return { meta: m, date, diff };
              });

              // Upcoming or overdue
              const nextUpcoming =
                activeMilestones.find((m) => m.diff >= 0) ||
                activeMilestones[activeMilestones.length - 1];

              return (
                <tr
                  key={p.id}
                  className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-neutral-600 dark:text-neutral-400">
                    {p.no || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-teal-600 dark:hover:text-teal-400 text-left transition-colors truncate block max-w-xs"
                    >
                      {p.name}
                    </button>
                    {p.notes && (
                      <span className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate block max-w-xs">
                        {p.notes}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 text-[11px] font-semibold rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-100/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {p.stage}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300 font-medium">
                    {p.pm || '-'}
                  </td>
                  <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                    {p.design || '-'}
                  </td>
                  <td className="py-3 px-4">
                    {nextUpcoming ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rotate-45 inline-block shrink-0"
                          style={{
                            backgroundColor: nextUpcoming.meta.isUpdate
                              ? 'transparent'
                              : nextUpcoming.meta.colorHex,
                            border: `1.5px solid ${nextUpcoming.meta.colorHex}`,
                          }}
                        />
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {nextUpcoming.meta.label}
                        </span>
                        <span className="text-neutral-500 dark:text-neutral-400 font-mono">
                          {formatDateShort(nextUpcoming.date)}
                        </span>
                        {nextUpcoming.diff < 0 && p.stage !== 'Completed' && (
                          <span className="text-[10px] px-1 py-0.2 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold rounded">
                            {Math.abs(nextUpcoming.diff)}d late
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-400 dark:text-neutral-500 italic">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-600 dark:bg-teal-500 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-neutral-400">
                        {tasksDone}/{tasksTotal}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicate(p)}
                        className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(p.id)}
                        className="p-1 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

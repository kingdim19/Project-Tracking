/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  Check,
  Clock,
  Edit2,
  Trash2,
  Copy,
  Plus,
  AlertTriangle,
  User,
  Users,
} from 'lucide-react';
import { Project, MILESTONES, MilestoneKey } from '../types';
import { formatDateShort, getDaysDifference, getTodayIso } from '../utils/date';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
  onDuplicate: (project: Project) => void;
  onToggleTask: (projectId: number, taskIndex: number) => void;
  onAddTask: (projectId: number, taskText: string) => void;
  onDeleteTask: (projectId: number, taskIndex: number) => void;
}

const STAGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CN: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/30',
  },
  SD: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-500/30',
  },
  DD: {
    bg: 'bg-violet-500/10 dark:bg-violet-500/20',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-500/30',
  },
  CD: {
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-500/30',
  },
  Construction: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/30',
  },
  'On hold': {
    bg: 'bg-neutral-500/10 dark:bg-neutral-500/20',
    text: 'text-neutral-600 dark:text-neutral-400',
    border: 'border-neutral-500/30',
  },
  Completed: {
    bg: 'bg-teal-500/10 dark:bg-teal-500/20',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-500/30',
  },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleTask,
  onAddTask,
  onDeleteTask,
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const todayIso = getTodayIso();

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(project.id, newTaskText.trim());
      setNewTaskText('');
    }
  };

  const tasksTotal = project.tasks.length;
  const tasksDone = project.tasks.filter((t) => t.d === 1).length;
  const progressPercent = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  // Active dates sorted by key order
  const activeMilestones = MILESTONES.filter((m) => !!project.dates[m.key]);

  const stageStyle = STAGE_COLORS[project.stage] || {
    bg: 'bg-neutral-100 dark:bg-neutral-800',
    text: 'text-neutral-700 dark:text-neutral-300',
    border: 'border-neutral-300 dark:border-neutral-700',
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl p-5 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between group">
      <div>
        {/* Top bar: Project Code & Stage Badge */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div>
            <div className="text-xs font-mono font-medium text-neutral-400 dark:text-neutral-500 tracking-wider">
              {project.no || 'NO NUMBER'}
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mt-0.5 leading-snug">
              {project.name}
            </h3>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${stageStyle.bg} ${stageStyle.text} ${stageStyle.border} shrink-0`}
          >
            {project.stage}
          </span>
        </div>

        {/* Team: PM & Design Leads */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-3.5 pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-neutral-400" />
            <span>PM:</span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {project.pm || 'Unassigned'}
            </span>
          </div>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-neutral-400" />
            <span>Design:</span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {project.design || 'Unassigned'}
            </span>
          </div>
        </div>

        {/* Milestones List */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            <span>Milestone Dates</span>
          </div>
          {activeMilestones.length === 0 ? (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 italic">
              No milestone dates scheduled
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {activeMilestones.map((m) => {
                const dateVal = project.dates[m.key] as string;
                const diff = getDaysDifference(dateVal, todayIso);
                const isOverdue = diff < 0 && project.stage !== 'Completed';
                const isToday = diff === 0;

                return (
                  <div
                    key={m.key}
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border font-mono transition-colors ${
                      isOverdue
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold'
                        : isToday
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-semibold'
                        : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-300'
                    }`}
                    title={`${m.phaseName} (${m.label}): ${dateVal} ${
                      isOverdue ? `(Overdue by ${Math.abs(diff)} days)` : `(${diff} days)`
                    }`}
                  >
                    {/* Visual phase diamond marker */}
                    <span
                      className="w-2 h-2 rotate-45 inline-block shrink-0"
                      style={{
                        backgroundColor: m.isUpdate ? 'transparent' : m.colorHex,
                        border: `1.5px solid ${m.colorHex}`,
                      }}
                    />
                    <span className="font-semibold">{m.label}</span>
                    <span className="text-neutral-400 dark:text-neutral-500 font-normal">
                      {formatDateShort(dateVal)}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold ml-0.5">
                        !
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="mb-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-neutral-500 dark:text-neutral-400">
              Tasks
            </span>
            <span className="font-mono text-neutral-400 dark:text-neutral-500">
              {tasksDone}/{tasksTotal} done ({progressPercent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mb-2.5">
            <div
              className="h-full bg-teal-600 dark:bg-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Tasks List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {project.tasks.map((task, idx) => (
              <div
                key={task.id || idx}
                className="group/task flex items-center justify-between gap-2 text-xs py-1 px-1.5 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.d === 1}
                    onChange={() => onToggleTask(project.id, idx)}
                    className="w-3.5 h-3.5 rounded border-neutral-300 dark:border-neutral-600 text-teal-600 focus:ring-teal-500 dark:bg-neutral-800 cursor-pointer accent-teal-600 shrink-0"
                  />
                  <span
                    className={`truncate select-none ${
                      task.d === 1
                        ? 'line-through text-neutral-400 dark:text-neutral-500'
                        : 'text-neutral-700 dark:text-neutral-200'
                    }`}
                  >
                    {task.t}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => onDeleteTask(project.id, idx)}
                  className="opacity-0 group-hover/task:opacity-100 text-neutral-400 hover:text-rose-500 transition-opacity p-0.5"
                  title="Remove task"
                  aria-label="Remove task"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add task inline */}
          <form onSubmit={handleAddTaskSubmit} className="mt-2.5 flex items-center gap-1.5">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add next action..."
              className="flex-1 text-xs px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={!newTaskText.trim()}
              className="px-2.5 py-1.5 text-xs font-medium text-white bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-900 dark:hover:bg-neutral-600 disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onEdit(project)}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <Edit2 className="w-3 h-3" />
          <span>Edit Details</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDuplicate(project)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Duplicate project"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(project.id)}
            className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Delete project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

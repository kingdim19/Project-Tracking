/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Project, STAGES, MILESTONES, MilestoneKey, TaskItem } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  onDelete?: (id: number) => void;
  initialProject?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialProject,
}) => {
  const isEditing = !!initialProject;

  const [no, setNo] = useState('');
  const [name, setName] = useState('');
  const [stage, setStage] = useState<Project['stage']>('CN');
  const [pm, setPm] = useState('');
  const [design, setDesign] = useState('');
  const [client, setClient] = useState('');
  const [notes, setNotes] = useState('');
  const [dates, setDates] = useState<Partial<Record<MilestoneKey, string>>>({});
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialProject) {
      setNo(initialProject.no || '');
      setName(initialProject.name || '');
      setStage(initialProject.stage || 'CN');
      setPm(initialProject.pm || '');
      setDesign(initialProject.design || '');
      setClient(initialProject.client || '');
      setNotes(initialProject.notes || '');
      setDates({ ...initialProject.dates });
      setTasks(initialProject.tasks ? [...initialProject.tasks] : []);
    } else {
      setNo(`2026-0${Math.floor(Math.random() * 80 + 20)}`);
      setName('');
      setStage('CN');
      setPm('');
      setDesign('');
      setClient('');
      setNotes('');
      setDates({});
      setTasks([]);
    }
    setError('');
    setNewTaskInput('');
  }, [initialProject, isOpen]);

  if (!isOpen) return null;

  const handleDateChange = (key: MilestoneKey, val: string) => {
    setDates((prev) => {
      const next = { ...prev };
      if (val) {
        next[key] = val;
      } else {
        delete next[key];
      }
      return next;
    });
  };

  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newTaskInput.trim()) {
      setTasks((prev) => [
        ...prev,
        { id: `task-${Date.now()}-${Math.random()}`, t: newTaskInput.trim(), d: 0 },
      ]);
      setNewTaskInput('');
    }
  };

  const handleRemoveTask = (idx: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleToggleTask = (idx: number) => {
    setTasks((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, d: t.d === 1 ? 0 : 1 } : t))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a project name.');
      return;
    }

    const savedProject: Project = {
      id: initialProject ? initialProject.id : Date.now(),
      no: no.trim(),
      name: name.trim(),
      stage,
      pm: pm.trim(),
      design: design.trim(),
      client: client.trim(),
      notes: notes.trim(),
      dates,
      tasks,
    };

    onSave(savedProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {isEditing ? 'Edit Project' : 'Add New Project'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Configure project parameters, team leads, and milestone schedule
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section: Basic Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
                Project No.
              </label>
              <input
                type="text"
                value={no}
                onChange={(e) => setNo(e.target.value)}
                placeholder="e.g. 2026-009A"
                className="w-full text-xs font-mono px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Parisian Hotel LZ"
                required
                className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
                Current Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as Project['stage'])}
                className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
                Project Manager (PM)
              </label>
              <input
                type="text"
                value={pm}
                onChange={(e) => setPm(e.target.value)}
                placeholder="e.g. Ricky"
                className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
                Design Leads
              </label>
              <input
                type="text"
                value={design}
                onChange={(e) => setDesign(e.target.value)}
                placeholder="e.g. Andy, Kiu, Edison"
                className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
                Client / Authority
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="e.g. Sands China, Municipal Bureau"
                className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
                Scope / Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Guestroom fitout package 04"
                className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Section: Milestone Deliverable Dates */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Milestone Submission Dates</span>
              </label>
              <span className="text-[11px] text-neutral-400">
                Leave empty if not applicable
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MILESTONES.map((m) => {
                const curVal = dates[m.key] || '';
                return (
                  <div
                    key={m.key}
                    className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rotate-45 inline-block"
                          style={{
                            backgroundColor: m.isUpdate ? 'transparent' : m.colorHex,
                            border: `1.5px solid ${m.colorHex}`,
                          }}
                        />
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          {m.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {m.isUpdate ? 'update' : 'main'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <input
                        type="date"
                        value={curVal}
                        onChange={(e) => handleDateChange(m.key, e.target.value)}
                        className="w-full text-xs font-mono px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      {curVal && (
                        <button
                          type="button"
                          onClick={() => handleDateChange(m.key, '')}
                          className="p-1 text-neutral-400 hover:text-rose-500 rounded transition-colors"
                          title="Clear date"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Action Tasks Checklist */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Action Tasks Checklist
              </label>
              <span className="text-xs font-mono text-neutral-400">
                {tasks.filter((t) => t.d === 1).length}/{tasks.length} completed
              </span>
            </div>

            <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
              {tasks.map((task, idx) => (
                <div
                  key={task.id || idx}
                  className="flex items-center justify-between gap-2 p-1.5 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={task.d === 1}
                      onChange={() => handleToggleTask(idx)}
                      className="w-3.5 h-3.5 rounded text-teal-600 focus:ring-teal-500 dark:bg-neutral-800"
                    />
                    <span
                      className={
                        task.d === 1
                          ? 'line-through text-neutral-400 dark:text-neutral-500'
                          : 'text-neutral-700 dark:text-neutral-200'
                      }
                    >
                      {task.t}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(idx)}
                    className="text-neutral-400 hover:text-rose-500 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                placeholder="Add checklist item..."
                className="flex-1 text-xs px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={() => handleAddTask()}
                className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-900 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete project "${initialProject?.name}"?`)) {
                    onDelete(initialProject!.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                Delete Project
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg transition-colors shadow-sm"
              >
                {isEditing ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

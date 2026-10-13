/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Info,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { Project, MILESTONES, MilestoneMeta } from '../types';
import { formatDateShort, getDaysDifference, getTodayIso } from '../utils/date';

interface TimelineGanttProps {
  projects: Project[];
  onEditProject: (project: Project) => void;
}

interface ActiveMilestoneItem {
  project: Project;
  meta: MilestoneMeta;
  dateStr: string;
  posPx: number;
  diffDays: number;
}

export const TimelineGantt: React.FC<TimelineGanttProps> = ({
  projects,
  onEditProject,
}) => {
  const todayIso = getTodayIso();
  const currentMonthIso = todayIso.slice(0, 7); // '2026-10'

  const [startMonth, setStartMonth] = useState<string>(currentMonthIso);
  const [spanMonths, setSpanMonths] = useState<number>(6);
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<number>>(
    new Set(projects.map((p) => p.id))
  );

  // Sync selection if new projects are added
  useMemo(() => {
    setSelectedProjectIds((prev) => {
      const next = new Set(prev);
      projects.forEach((p) => {
        if (!prev.has(p.id) && prev.size === 0) {
          next.add(p.id);
        }
      });
      return next;
    });
  }, [projects]);

  const toggleProject = (id: number) => {
    const next = new Set(selectedProjectIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedProjectIds(next);
  };

  const selectAll = () => setSelectedProjectIds(new Set(projects.map((p) => p.id)));
  const clearAll = () => setSelectedProjectIds(new Set());

  // Week width in pixels
  const WEEK_WIDTH = 32;
  const SIDEBAR_WIDTH = 220; // px

  // Calculate timeline start and weeks count
  const { s0, totalWeeks, totalTimelineWidth, monthHeaders, weekDates } = useMemo(() => {
    const [yStr, mStr] = startMonth.split('-');
    const year = parseInt(yStr, 10) || 2026;
    const month = parseInt(mStr, 10) - 1 || 9;

    const startDate = new Date(year, month, 1, 0, 0, 0);
    // Align to preceding Monday
    const dayOfWeek = startDate.getDay(); // 0 is Sunday, 1 is Monday
    const diffToMonday = (dayOfWeek + 6) % 7;
    startDate.setDate(startDate.getDate() - diffToMonday);

    const weeks = Math.ceil(spanMonths * 4.4);
    const totalWidth = weeks * WEEK_WIDTH;

    // Generate Month Header blocks
    const months: { label: string; leftPx: number; widthPx: number }[] = [];
    let currentMonthLabel = '';
    let currentMonthStartIndex = 0;

    for (let i = 0; i < weeks; i++) {
      const d = new Date(startDate.getTime() + i * 7 * 24 * 3600 * 1000);
      const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      if (label !== currentMonthLabel) {
        if (currentMonthLabel) {
          const w = (i - currentMonthStartIndex) * WEEK_WIDTH;
          months.push({
            label: currentMonthLabel,
            leftPx: currentMonthStartIndex * WEEK_WIDTH,
            widthPx: w,
          });
        }
        currentMonthLabel = label;
        currentMonthStartIndex = i;
      }
    }
    if (currentMonthLabel) {
      months.push({
        label: currentMonthLabel,
        leftPx: currentMonthStartIndex * WEEK_WIDTH,
        widthPx: (weeks - currentMonthStartIndex) * WEEK_WIDTH,
      });
    }

    // Week boundaries for quick lookup
    const weekArr: Date[] = [];
    for (let i = 0; i < weeks; i++) {
      weekArr.push(new Date(startDate.getTime() + i * 7 * 24 * 3600 * 1000));
    }

    return {
      s0: startDate,
      totalWeeks: weeks,
      totalTimelineWidth: totalWidth,
      monthHeaders: months,
      weekDates: weekArr,
    };
  }, [startMonth, spanMonths]);

  // Position function: maps ISO date string to X coordinate in pixels
  const getPositionPx = (isoDate: string): number => {
    const d = new Date(isoDate + 'T00:00:00');
    const diffMs = d.getTime() - s0.getTime();
    const weeks = diffMs / (7 * 24 * 3600 * 1000);
    return weeks * WEEK_WIDTH;
  };

  const todayPx = getPositionPx(todayIso);
  const isTodayVisible = todayPx >= 0 && todayPx <= totalTimelineWidth;

  // Filtered projects
  const activeProjects = projects.filter((p) => selectedProjectIds.has(p.id));

  // Compute workload deliverables per week
  const { weekDeliverables, maxWeeklyDeliverables } = useMemo(() => {
    const deliverablesPerWeek: {
      count: number;
      items: { project: Project; meta: MilestoneMeta; date: string }[];
    }[] = Array.from({ length: totalWeeks }, () => ({ count: 0, items: [] }));

    activeProjects.forEach((p) => {
      MILESTONES.forEach((m) => {
        const dateVal = p.dates[m.key];
        if (dateVal) {
          const px = getPositionPx(dateVal);
          const weekIdx = Math.floor(px / WEEK_WIDTH);
          if (weekIdx >= 0 && weekIdx < totalWeeks) {
            deliverablesPerWeek[weekIdx].count += 1;
            deliverablesPerWeek[weekIdx].items.push({ project: p, meta: m, date: dateVal });
          }
        }
      });
    });

    const max = Math.max(1, ...deliverablesPerWeek.map((w) => w.count));
    return { weekDeliverables: deliverablesPerWeek, maxWeeklyDeliverables: max };
  }, [activeProjects, totalWeeks, s0]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = startMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    setStartMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    );
  };

  const handleNextMonth = () => {
    const [y, m] = startMonth.split('-').map(Number);
    const d = new Date(y, m, 1);
    setStartMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    );
  };

  const handleJumpToToday = () => {
    setStartMonth(currentMonthIso);
  };

  // Tooltip hover state
  const [hoveredMilestone, setHoveredMilestone] = useState<{
    item: ActiveMilestoneItem;
    x: number;
    y: number;
  } | null>(null);

  const [hoveredWeek, setHoveredWeek] = useState<{
    weekIndex: number;
    dateLabel: string;
    items: { project: Project; meta: MilestoneMeta; date: string }[];
    x: number;
    y: number;
  } | null>(null);

  return (
    <div className="space-y-4">
      {/* Controls & Filter Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Timeframe controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-neutral-500 dark:text-neutral-400">
              Timeline:
            </span>

            <div className="inline-flex items-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded transition-colors text-neutral-600 dark:text-neutral-300"
                title="Previous month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <input
                type="month"
                value={startMonth}
                onChange={(e) => e.target.value && setStartMonth(e.target.value)}
                className="bg-transparent font-medium text-xs px-2 py-0.5 text-neutral-900 dark:text-neutral-100 focus:outline-none cursor-pointer"
              />
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded transition-colors text-neutral-600 dark:text-neutral-300"
                title="Next month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleJumpToToday}
              className="px-2.5 py-1 font-medium rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              Today
            </button>

            <span className="text-neutral-300 dark:text-neutral-700">|</span>

            {/* Span Duration buttons */}
            <div className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg border border-neutral-200/80 dark:border-neutral-700/80">
              {[3, 6, 9, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSpanMonths(m)}
                  className={`px-2 py-0.5 text-xs font-medium rounded transition-all ${
                    spanMonths === m
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  {m}M
                </button>
              ))}
            </div>
          </div>

          {/* Project selection filters */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400 dark:text-neutral-500 font-medium">
              Projects ({activeProjects.length}/{projects.length}):
            </span>
            <button
              type="button"
              onClick={selectAll}
              className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
            >
              All
            </button>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <button
              type="button"
              onClick={clearAll}
              className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              None
            </button>
          </div>
        </div>

        {/* Project Chip Toggles */}
        <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap gap-1.5 items-center">
          <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0 mr-1" />
          {projects.map((p) => {
            const isSelected = selectedProjectIds.has(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleProject(p.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
                  isSelected
                    ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-200 font-medium shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700/60 text-neutral-500 dark:text-neutral-400 opacity-60 hover:opacity-100'
                }`}
              >
                <span>{p.no || p.name}</span>
                <span className="text-[10px] font-sans font-normal opacity-75 truncate max-w-[100px]">
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Gantt Canvas */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto relative">
          <div
            style={{ width: `${SIDEBAR_WIDTH + totalTimelineWidth}px` }}
            className="min-h-[400px] select-none"
          >
            {/* Row 1: Month Headers */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/70 sticky top-0 z-20">
              <div
                style={{ width: `${SIDEBAR_WIDTH}px` }}
                className="shrink-0 p-2.5 font-bold text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider sticky left-0 bg-neutral-50 dark:bg-neutral-800 z-30 border-r border-neutral-200 dark:border-neutral-800"
              >
                Project
              </div>
              <div
                style={{ width: `${totalTimelineWidth}px` }}
                className="relative h-8 shrink-0 flex items-center"
              >
                {monthHeaders.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      left: `${m.leftPx}px`,
                      width: `${m.widthPx}px`,
                    }}
                    className="absolute top-0 bottom-0 border-l border-neutral-200/80 dark:border-neutral-700/80 px-2 flex items-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 font-mono tracking-tight"
                  >
                    {m.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Workload Intensity / Deliverables Due */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-800/40">
              <div
                style={{ width: `${SIDEBAR_WIDTH}px` }}
                className="shrink-0 p-2 font-medium text-xs text-neutral-600 dark:text-neutral-300 sticky left-0 bg-neutral-100/90 dark:bg-neutral-800/90 z-20 border-r border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Weekly Workload
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400">due/wk</span>
              </div>
              <div
                style={{ width: `${totalTimelineWidth}px` }}
                className="relative h-9 shrink-0 flex items-center"
              >
                {weekDeliverables.map((wk, idx) => {
                  const leftPx = idx * WEEK_WIDTH;
                  if (wk.count === 0) return null;

                  // Intensity calculation
                  const isHigh = wk.count >= 3;
                  const isMedium = wk.count === 2;

                  return (
                    <div
                      key={idx}
                      style={{
                        left: `${leftPx}px`,
                        width: `${WEEK_WIDTH}px`,
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredWeek({
                          weekIndex: idx,
                          dateLabel: formatDateShort(
                            weekDates[idx].toISOString().slice(0, 10)
                          ),
                          items: wk.items,
                          x: rect.left + rect.width / 2,
                          y: rect.bottom + 6,
                        });
                      }}
                      onMouseLeave={() => setHoveredWeek(null)}
                      className={`absolute top-1 bottom-1 flex items-center justify-center font-mono font-bold text-xs rounded transition-transform hover:scale-110 cursor-pointer z-10 ${
                        isHigh
                          ? 'bg-rose-500 text-white shadow-xs'
                          : isMedium
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-teal-600/80 text-white'
                      }`}
                      title={`${wk.count} milestone(s) due week of ${formatDateShort(
                        weekDates[idx].toISOString().slice(0, 10)
                      )}`}
                    >
                      {wk.count}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vertical Today Line Layer */}
            <div
              style={{
                left: `${SIDEBAR_WIDTH}px`,
                width: `${totalTimelineWidth}px`,
              }}
              className="absolute top-0 bottom-0 pointer-events-none z-15"
            >
              {isTodayVisible && (
                <div
                  style={{ left: `${todayPx}px` }}
                  className="absolute top-0 bottom-0 w-0.5 bg-rose-500/90 z-20 flex flex-col items-center"
                >
                  <div className="bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap -translate-y-1">
                    Today
                  </div>
                </div>
              )}
            </div>

            {/* Project Rows */}
            {activeProjects.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 dark:text-neutral-500 text-xs">
                No projects selected. Use the filter chips above to toggle project visibility.
              </div>
            ) : (
              activeProjects.map((p) => {
                // Collect and sort milestones by date
                const milestonesOnProject: ActiveMilestoneItem[] = [];
                MILESTONES.forEach((m) => {
                  const dateStr = p.dates[m.key];
                  if (dateStr) {
                    milestonesOnProject.push({
                      project: p,
                      meta: m,
                      dateStr,
                      posPx: getPositionPx(dateStr),
                      diffDays: getDaysDifference(dateStr, todayIso),
                    });
                  }
                });

                milestonesOnProject.sort(
                  (a, b) =>
                    new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime()
                );

                // Compute span line start & width
                let spanLeft = 0;
                let spanWidth = 0;
                if (milestonesOnProject.length > 0) {
                  const firstPx = milestonesOnProject[0].posPx;
                  const lastPx = milestonesOnProject[milestonesOnProject.length - 1].posPx;
                  spanLeft = Math.max(0, firstPx);
                  spanWidth = Math.max(8, lastPx - firstPx);
                }

                return (
                  <div
                    key={p.id}
                    className="flex border-b border-neutral-100 dark:border-neutral-800/80 hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors group relative"
                  >
                    {/* Sticky Project Label Column */}
                    <div
                      style={{ width: `${SIDEBAR_WIDTH}px` }}
                      className="shrink-0 px-3 py-2.5 sticky left-0 bg-white dark:bg-neutral-900 group-hover:bg-neutral-50 dark:group-hover:bg-neutral-800/80 z-20 border-r border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2 overflow-hidden"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-neutral-500 dark:text-neutral-400 truncate">
                            {p.no || 'NO NUM'}
                          </span>
                          <span className="text-[10px] px-1 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium">
                            {p.stage}
                          </span>
                        </div>
                        <div
                          className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate cursor-pointer hover:text-teal-600 dark:hover:text-teal-400"
                          onClick={() => onEditProject(p)}
                          title={`${p.name} (PM: ${p.pm})`}
                        >
                          {p.name}
                        </div>
                      </div>
                    </div>

                    {/* Timeline track area */}
                    <div
                      style={{ width: `${totalTimelineWidth}px` }}
                      className="relative h-12 shrink-0 flex items-center"
                    >
                      {/* Grid vertical guidelines per week */}
                      {Array.from({ length: totalWeeks }).map((_, wIdx) => (
                        <div
                          key={wIdx}
                          style={{
                            left: `${wIdx * WEEK_WIDTH}px`,
                            width: `${WEEK_WIDTH}px`,
                          }}
                          className="absolute top-0 bottom-0 border-r border-neutral-100/50 dark:border-neutral-800/30 pointer-events-none"
                        />
                      ))}

                      {/* Span line connecting milestones */}
                      {milestonesOnProject.length > 1 && (
                        <div
                          style={{
                            left: `${spanLeft}px`,
                            width: `${spanWidth}px`,
                          }}
                          className="absolute h-1.5 bg-neutral-200 dark:bg-neutral-700/80 rounded-full"
                        />
                      )}

                      {/* Milestone Diamond Markers */}
                      {milestonesOnProject.map((item, mIdx) => {
                        const isOverdue =
                          item.diffDays < 0 && p.stage !== 'Completed';

                        return (
                          <div
                            key={mIdx}
                            style={{
                              left: `${item.posPx}px`,
                            }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredMilestone({
                                item,
                                x: rect.left + rect.width / 2,
                                y: rect.top - 8,
                              });
                            }}
                            onMouseLeave={() => setHoveredMilestone(null)}
                            className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 cursor-pointer z-10 transition-transform hover:scale-125"
                          >
                            {/* Rotated 45deg diamond marker */}
                            <div
                              style={{
                                backgroundColor: item.meta.isUpdate
                                  ? 'var(--tw-card-bg, #ffffff)'
                                  : item.meta.colorHex,
                                borderColor: item.meta.colorHex,
                              }}
                              className={`w-3.5 h-3.5 rotate-45 border-2 rounded-xs shadow-xs transition-shadow ${
                                isOverdue ? 'ring-2 ring-rose-500 ring-offset-1' : ''
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Popover Tooltip for Milestone on Hover */}
      {hoveredMilestone && (
        <div
          style={{
            position: 'fixed',
            left: `${hoveredMilestone.x}px`,
            top: `${hoveredMilestone.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="z-50 pointer-events-none bg-neutral-900 dark:bg-neutral-800 text-white rounded-lg p-2.5 text-xs shadow-xl border border-neutral-700 max-w-xs animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="font-semibold text-neutral-200 mb-0.5">
            {hoveredMilestone.item.project.name}
          </div>
          <div className="flex items-center gap-1.5 font-mono mb-1">
            <span
              className="w-2 h-2 rotate-45 inline-block shrink-0"
              style={{
                backgroundColor: hoveredMilestone.item.meta.isUpdate
                  ? 'transparent'
                  : hoveredMilestone.item.meta.colorHex,
                border: `1.5px solid ${hoveredMilestone.item.meta.colorHex}`,
              }}
            />
            <span className="font-bold">{hoveredMilestone.item.meta.label}</span>
            <span className="text-neutral-400">
              ({hoveredMilestone.item.meta.phaseName})
            </span>
          </div>
          <div className="text-neutral-300 font-mono text-[11px] flex justify-between gap-4">
            <span>Date: {hoveredMilestone.item.dateStr}</span>
            <span
              className={
                hoveredMilestone.item.diffDays < 0
                  ? 'text-rose-400 font-semibold'
                  : hoveredMilestone.item.diffDays === 0
                  ? 'text-amber-400 font-semibold'
                  : 'text-teal-400'
              }
            >
              {hoveredMilestone.item.diffDays < 0
                ? `${Math.abs(hoveredMilestone.item.diffDays)}d overdue`
                : hoveredMilestone.item.diffDays === 0
                ? 'Due today'
                : `In ${hoveredMilestone.item.diffDays}d`}
            </span>
          </div>
        </div>
      )}

      {/* Popover Tooltip for Weekly Workload Crunch */}
      {hoveredWeek && (
        <div
          style={{
            position: 'fixed',
            left: `${hoveredWeek.x}px`,
            top: `${hoveredWeek.y}px`,
            transform: 'translate(-50%, 0)',
          }}
          className="z-50 pointer-events-none bg-neutral-900 text-white rounded-lg p-3 text-xs shadow-2xl border border-neutral-700 min-w-[220px]"
        >
          <div className="font-bold text-neutral-200 border-b border-neutral-700 pb-1 mb-2 flex items-center justify-between">
            <span>Week of {hoveredWeek.dateLabel}</span>
            <span className="font-mono text-amber-400">{hoveredWeek.items.length} due</span>
          </div>
          <div className="space-y-1.5">
            {hoveredWeek.items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2">
                <span className="truncate max-w-[140px] text-neutral-300">
                  {it.project.name}
                </span>
                <span
                  className="font-mono px-1 rounded text-[10px] font-bold shrink-0"
                  style={{
                    backgroundColor: `${it.meta.colorHex}30`,
                    color: it.meta.colorHex,
                  }}
                >
                  {it.meta.label} · {formatDateShort(it.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend & Guidance Footer */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
            Legend:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rotate-45 bg-amber-600 border border-amber-600 inline-block" />
            <span>Concept (CN)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rotate-45 bg-blue-600 border border-blue-600 inline-block" />
            <span>Schematic (SD)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rotate-45 bg-violet-600 border border-violet-600 inline-block" />
            <span>Design Dev (DD)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rotate-45 bg-orange-600 border border-orange-600 inline-block" />
            <span>Construction Docs (CD)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rotate-45 bg-emerald-600 border border-emerald-600 inline-block" />
            <span>Construction</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rotate-45 bg-white dark:bg-neutral-800 border-2 border-neutral-500 inline-block" />
            <span>Hollow = Update milestone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-500 inline-block" />
            <span className="text-rose-600 dark:text-rose-400 font-medium">Red line = Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 text-white font-mono text-[9px] flex items-center justify-center font-bold">
              3
            </span>
            <span>Shaded number = Crunch week (peak deadlines)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

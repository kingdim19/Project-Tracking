/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  RefreshCw,
  X,
  FileJson,
  Check,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { Project } from '../types';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onImport: (newProjects: Project[]) => void;
  onResetSeed: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  projects,
  onImport,
  onResetSeed,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [importMessage, setImportMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = JSON.stringify(projects, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    const dataStr = JSON.stringify(projects, null, 2);
    navigator.clipboard.writeText(dataStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed)) {
          throw new Error('Exported data must be an array of projects.');
        }

        // Normalize each project
        const sanitized: Project[] = parsed.map((p, idx) => ({
          id: p.id || Date.now() + idx,
          no: String(p.no || ''),
          name: String(p.name || 'Untitled Project'),
          stage: p.stage || 'CN',
          pm: String(p.pm || ''),
          design: String(p.design || ''),
          dates: p.dates && typeof p.dates === 'object' ? p.dates : {},
          tasks: Array.isArray(p.tasks)
            ? p.tasks.map((t: any, tIdx: number) => ({
                id: t.id || `t-${tIdx}`,
                t: String(t.t || ''),
                d: t.d ? 1 : 0,
              }))
            : [],
          client: p.client || '',
          notes: p.notes || '',
        }));

        onImport(sanitized);
        setImportMessage({
          text: `Successfully imported ${sanitized.length} projects!`,
          isError: false,
        });
        setTimeout(() => {
          onClose();
        }, 1200);
      } catch (err: any) {
        setImportMessage({
          text: `Invalid JSON file: ${err.message || 'Check format'}`,
          isError: true,
        });
      }
    };
    reader.readAsText(file);
    // Reset file input value so user can re-import same file if needed
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Manage Data & Backups
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {importMessage && (
            <div
              className={`p-3 rounded-lg border flex items-center gap-2 ${
                importMessage.isError
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {importMessage.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <Check className="w-4 h-4 shrink-0" />
              )}
              <span>{importMessage.text}</span>
            </div>
          )}

          {/* Export card */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                Export Current Projects
              </div>
              <div className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                Download a JSON backup of all {projects.length} projects and schedules.
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyJson}
                className="px-2.5 py-2 border border-neutral-200 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300"
                title="Copy JSON to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-1.5 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Import card */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                Import from JSON File
              </div>
              <div className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                Load a previously saved project configuration or migrate from another device.
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-900 dark:hover:bg-neutral-600 text-white rounded-lg transition-colors flex items-center gap-1.5 font-semibold shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import File</span>
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">
              Want to reload the architectural demo projects?
            </span>
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    'Reset to demo sample projects? Any unsaved local edits will be replaced.'
                  )
                ) {
                  onResetSeed();
                  onClose();
                }
              }}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

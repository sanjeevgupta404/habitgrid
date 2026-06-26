/**
 * Data Export / Import Utilities
 * ────────────────────────────────
 * Triggers file downloads in-browser. Import reads FileReader.
 * All logic is isolated here so it can be replaced with a backend download
 * endpoint without touching UI components.
 */

import { DataAPI } from '../core/api.js';

export function downloadText(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportJSON() {
  const json = await DataAPI.exportJSON();
  const ts = new Date().toISOString().slice(0, 10);
  downloadText(json, `habitgrid-backup-${ts}.json`, 'application/json');
}

export async function exportCSV(habits, completions, year, month) {
  const csv = await DataAPI.exportCSV(habits, completions, year, month);
  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  downloadText(csv, `habitgrid-${MONTHS_SHORT[month]}-${year}.csv`, 'text/csv');
}

export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        const data = await DataAPI.importJSON(e.target.result);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

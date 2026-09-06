import React, { useState } from 'react';
import {
  Calendar,
  Check,
  ChevronDown,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileSpreadsheet,
  ListTodo,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import {
  SHEET_DEFINITIONS,
  SheetDefinition,
  createGoogleCalendarUrl,
  sheetToCsv,
} from '../utils/googleSheetsSync';

export const SheetsSyncModal: React.FC = () => {
  const {
    isSheetsModalOpen,
    setIsSheetsModalOpen,
    lastSheetsSync,
    triggerSheetsSync,
    getAppSyncState,
    workouts,
    selectedDate,
  } = useHealth();

  const [copiedSheet, setCopiedSheet] = useState<string | null>(null);
  const [selectedSheetPreview, setSelectedSheetPreview] = useState<SheetDefinition | null>(
    SHEET_DEFINITIONS[2] // DAILY_LOG by default
  );
  const [activeTab, setActiveTab] = useState<'tables' | 'setup' | 'calendar'>('tables');

  if (!isSheetsModalOpen) return null;

  const appState = getAppSyncState();

  const handleCopyCsv = (sheetDef: SheetDefinition) => {
    const csv = sheetToCsv(sheetDef, appState);
    navigator.clipboard.writeText(csv);
    setCopiedSheet(sheetDef.name);
    setTimeout(() => setCopiedSheet(null), 2500);
  };

  const handleDownloadAllCsv = () => {
    // Generate combined bundle
    const allContent = SHEET_DEFINITIONS.map((def) => {
      return `### SHEET: ${def.name}\n${sheetToCsv(def, appState)}\n\n`;
    }).join('');

    const blob = new Blob([allContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FitTrack_GoogleSheets_Data_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerSheetsSync();
  };

  const nextWorkout = workouts[0] || {
    workoutType: 'Strength',
    durationMinutes: 45,
    activeCalories: 300,
  };

  const calUrl = createGoogleCalendarUrl(
    `${nextWorkout.workoutType} Training`,
    `FitTrack Workout: ${nextWorkout.durationMinutes} min session (~${nextWorkout.activeCalories} kcal)`,
    selectedDate,
    '08:00',
    '08:45'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl border border-[#F2F1EC] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#F0EEE6] flex items-center justify-between bg-[#F9F8F4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F4EF] text-[#7D8C6F] flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif italic text-[#4A5D4E]">Google Sheets Database Engine</h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F5F4EF] text-[#4A5D4E] border border-[#EBE9E1]">
                  15 Tables Ready
                </span>
              </div>
              <p className="text-xs text-[#8C8980]">
                FitTrack uses Google Sheets as its primary backend data structure
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSheetsModalOpen(false)}
            className="p-2 text-[#8C8980] hover:text-[#3D3D3D] hover:bg-[#F5F4EF] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subnav */}
        <div className="px-6 py-2.5 border-b border-[#F0EEE6] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('tables')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'tables'
                  ? 'bg-[#7D8C6F] text-white'
                  : 'text-[#8C8980] hover:bg-[#F5F4EF]'
              }`}
            >
              15 Sheets Data Tables
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'setup'
                  ? 'bg-[#7D8C6F] text-white'
                  : 'text-[#8C8980] hover:bg-[#F5F4EF]'
              }`}
            >
              Live Sheets Setup Guide
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-[#7D8C6F] text-white'
                  : 'text-[#8C8980] hover:bg-[#F5F4EF]'
              }`}
            >
              Calendar & Tasks Integration
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAllCsv}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#7D8C6F] hover:bg-[#68765c] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All 15 Sheets</span>
            </button>

            <button
              onClick={triggerSheetsSync}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#EBE9E1] text-[#4A5D4E] hover:bg-[#F5F4EF] text-xs font-bold transition-colors"
              title="Record Sync Timestamp"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#7D8C6F]" />
              <span>Sync Status</span>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'tables' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Table List Column */}
              <div className="md:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-1">
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#8C8980]">
                  Data Architecture Tables
                </span>
                {SHEET_DEFINITIONS.map((def) => {
                  const isSelected = selectedSheetPreview?.name === def.name;
                  const rowCount = def.getData(appState).length;
                  return (
                    <div
                      key={def.name}
                      onClick={() => setSelectedSheetPreview(def)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#7D8C6F] bg-[#F5F4EF] shadow-xs'
                          : 'border-[#F0EEE6] bg-white hover:border-[#EBE9E1]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Database className={`w-3.5 h-3.5 ${isSelected ? 'text-[#7D8C6F]' : 'text-[#8C8980]'}`} />
                          <span className="text-xs font-bold text-[#3D3D3D] truncate">
                            {def.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8C8980] truncate mt-0.5">
                          {def.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F4EF] text-[#4A5D4E] border border-[#EBE9E1]">
                          {rowCount} rows
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCsv(def);
                          }}
                          className="p-1 text-[#8C8980] hover:text-[#4A5D4E] hover:bg-[#F5F4EF] rounded-lg transition-colors cursor-pointer"
                          title="Copy CSV to clipboard"
                        >
                          {copiedSheet === def.name ? (
                            <Check className="w-3.5 h-3.5 text-[#7D8C6F]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Table Preview Column */}
              <div className="md:col-span-7 flex flex-col bg-[#F9F8F4] border border-[#EBE9E1] rounded-[28px] p-5 overflow-hidden">
                {selectedSheetPreview ? (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-[#EBE9E1]">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#3D3D3D]">
                            Sheet: {selectedSheetPreview.name}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F5F4EF] text-[#4A5D4E] rounded-full border border-[#EBE9E1]">
                            {selectedSheetPreview.columns.length} columns
                          </span>
                        </div>
                        <p className="text-xs text-[#8C8980] mt-0.5">
                          {selectedSheetPreview.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCopyCsv(selectedSheetPreview)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EBE9E1] text-xs font-bold text-[#4A5D4E] hover:bg-[#F5F4EF] transition-colors shadow-2xs cursor-pointer"
                      >
                        {copiedSheet === selectedSheetPreview.name ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#7D8C6F]" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy CSV</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Columns Preview */}
                    <div className="py-2.5 flex flex-wrap gap-1.5">
                      {selectedSheetPreview.columns.map((col) => (
                        <span
                          key={col}
                          className="text-[10px] font-mono font-bold px-2 py-0.5 bg-white border border-[#EBE9E1] rounded-md text-[#3D3D3D]"
                        >
                          {col}
                        </span>
                      ))}
                    </div>

                    {/* Data Rows Preview */}
                    <div className="flex-1 overflow-auto bg-white rounded-2xl border border-[#EBE9E1] mt-1 max-h-[300px]">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead className="bg-[#F9F8F4] sticky top-0 border-b border-[#EBE9E1] text-[11px] text-[#4A5D4E]">
                          <tr>
                            {selectedSheetPreview.columns.map((col) => (
                              <th key={col} className="p-2 font-bold">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0EEE6]">
                          {selectedSheetPreview.getData(appState).map((row, idx) => (
                            <tr key={idx} className="hover:bg-[#F9F8F4]/60">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-2 text-[#3D3D3D] whitespace-nowrap text-[11px]">
                                  {String(cell ?? '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#8C8980] text-xs">
                    Select a sheet from the list to preview
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-[#F5F4EF] border border-[#EBE9E1]">
                <div className="flex items-center gap-2 text-[#4A5D4E] font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-[#7D8C6F]" />
                  <span>Connecting FitTrack to your Live Google Sheet</span>
                </div>
                <p className="text-xs text-[#3D3D3D] mt-1 leading-relaxed">
                  FitTrack is designed so anyone can deploy it to GitHub and use their own personal
                  Google Spreadsheet as a secure, zero-cost, private cloud database.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C8980]">
                  Quick 3-Step Integration
                </h4>

                <div className="p-4 rounded-2xl border border-[#EBE9E1] bg-white space-y-1">
                  <span className="text-xs font-bold text-[#3D3D3D]">1. Create a Google Spreadsheet</span>
                  <p className="text-xs text-[#8C8980]">
                    Open{' '}
                    <a
                      href="https://sheets.new"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#4A5D4E] font-bold underline inline-flex items-center gap-1"
                    >
                      sheets.new <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    and name it <span className="font-bold text-[#3D3D3D]">“FitTrack Personal Health Database”</span>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-[#EBE9E1] bg-white space-y-2">
                  <span className="text-xs font-bold text-[#3D3D3D]">2. Paste Apps Script Connector (Optional Webhook)</span>
                  <p className="text-xs text-[#8C8980]">
                    In Google Sheets, go to <span className="font-bold text-[#3D3D3D]">Extensions → Apps Script</span>,
                    paste the simple Webhook code to automatically receive your daily food logs and measurements.
                  </p>
                  <pre className="p-3 bg-[#3D3D3D] text-[#E9EAE3] text-[11px] font-mono rounded-xl overflow-x-auto">
{`function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(data.sheetName);
  if (!sheet) sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(data.sheetName);
  sheet.appendRow(data.row);
  return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}`}
                  </pre>
                </div>

                <div className="p-4 rounded-2xl border border-[#EBE9E1] bg-white space-y-1">
                  <span className="text-xs font-bold text-[#3D3D3D]">3. Direct CSV Import</span>
                  <p className="text-xs text-[#8C8980]">
                    You can also click <span className="font-bold text-[#4A5D4E]">“Export All 15 Sheets”</span> above at any time to import all your data straight into Google Sheets or Microsoft Excel with 1 click.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-[#F5F4EF] border border-[#EBE9E1]">
                <div className="flex items-center gap-2 text-[#4A5D4E] font-bold text-sm">
                  <Calendar className="w-4 h-4 text-[#7D8C6F]" />
                  <span>Google Calendar & Google Tasks Integration</span>
                </div>
                <p className="text-xs text-[#3D3D3D] mt-1 leading-relaxed">
                  FitTrack allows you to push planned workouts and intermittent fasting eating windows directly to your Google Calendar and create wellness reminders in Google Tasks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-[#EBE9E1] bg-white space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#7D8C6F]" />
                    <h4 className="text-xs font-bold text-[#3D3D3D]">Google Calendar: Workout Event</h4>
                  </div>
                  <p className="text-xs text-[#8C8980]">
                    Add scheduled <span className="font-bold text-[#3D3D3D]">{nextWorkout.workoutType}</span> session to your Google Calendar with 1 click.
                  </p>
                  <a
                    href={calUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#7D8C6F] hover:bg-[#68765c] text-white rounded-full text-xs font-bold shadow-xs transition-colors"
                  >
                    <span>Schedule in Google Calendar</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-4 rounded-2xl border border-[#EBE9E1] bg-white space-y-3">
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-[#A6826D]" />
                    <h4 className="text-xs font-bold text-[#3D3D3D]">Google Tasks: Habit Reminders</h4>
                  </div>
                  <p className="text-xs text-[#8C8980]">
                    Keep your hydration target and daily food logging active in your daily task queue.
                  </p>
                  <a
                    href="https://tasks.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#A6826D] hover:bg-[#8f6e5b] text-white rounded-full text-xs font-bold shadow-xs transition-colors"
                  >
                    <span>Open Google Tasks</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#F0EEE6] bg-[#F9F8F4] flex items-center justify-between text-xs text-[#8C8980]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7D8C6F]" />
            <span>Local sync active • Last verified: {lastSheetsSync}</span>
          </div>

          <button
            onClick={() => setIsSheetsModalOpen(false)}
            className="px-5 py-2 rounded-full bg-[#4A5D4E] text-white hover:bg-[#3D3D3D] font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

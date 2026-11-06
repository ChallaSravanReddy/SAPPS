import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import { assessmentsApi } from '../services/api';

export default function BatchUpload() {
  const [file, setFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  // Sample CSV template generator
  const handleDownloadSampleCsv = () => {
    const csvContent =
      'roll_number,student_name,department,semester,attendance_percentage,internal_test_marks,assignment_score,quiz_score,prev_semester_gpa\n' +
      '2024CS1091,Priya Nair,Computer Science and Engineering,5,86.5,82.0,88.0,84.5,8.8\n' +
      '2024CS1092,Kunal Kapoor,Computer Science and Engineering,5,58.0,41.5,49.0,42.0,5.1\n' +
      '2024IT1093,Sneha Kulkarni,Information Technology,5,71.0,61.0,67.0,63.0,6.7\n' +
      '2024EC1094,Rohan Mehra,Electronics and Communication,5,45.0,34.0,42.0,38.0,4.8\n' +
      '2024CS1095,Ananya Sen,Computer Science and Engineering,5,92.0,89.5,94.0,91.0,9.3\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sapps_sample_assessments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV client-side for immediate visual inspection
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.endsWith('.csv')) {
      setError('Please select a valid .csv file.');
      return;
    }

    setFile(selected);
    setError('');
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length > 0) {
          const parsedHeaders = lines[0].split(',').map((h) => h.trim());
          setHeaders(parsedHeaders);

          const rows = [];
          for (let i = 1; i < Math.min(lines.length, 6); i++) {
            const values = lines[i].split(',').map((v) => v.trim());
            const rowObj = {};
            parsedHeaders.forEach((h, idx) => {
              rowObj[h] = values[idx] || '';
            });
            rows.push(rowObj);
          }
          setPreviewRows(rows);
        }
      }
    };
    reader.readAsText(selected);
  };

  // Submit to backend
  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      const res = await assessmentsApi.batchUploadCsv(file);
      setUploadResult(res);
    } catch (err) {
      console.error('Batch upload error:', err);
      setError(
        err.response?.data?.detail ||
          'Failed to process CSV file. Ensure valid headers and non-empty rows.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Batch CSV Assessment Ingestion
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Bulk-insert student academic records with automated schema validation and immediate ML risk evaluation.
          </p>
        </div>

        <button
          onClick={handleDownloadSampleCsv}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-300 rounded-xl transition-colors shadow-xs"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Download Sample Template CSV</span>
        </button>
      </div>

      {/* Upload Zone */}
      <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 transition-colors text-center shadow-xs">
        <input
          type="file"
          id="csv-file-input"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor="csv-file-input"
          className="cursor-pointer flex flex-col items-center justify-center space-y-3"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <span className="text-sm font-bold text-indigo-600 hover:underline">
              Click to browse your CSV file
            </span>
            <span className="text-sm text-slate-500"> or drag and drop</span>
            <p className="text-xs text-slate-400 mt-1">
              Supports CSV with student roll numbers, attendance, internals, assignments, quizzes, and GPA.
            </p>
          </div>
          {file && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold mt-2">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Selected: {file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </label>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Validation or Ingestion Error</h4>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Immediate Client Preview Table */}
      {previewRows.length > 0 && !uploadResult && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Data Preview (First {previewRows.length} rows)
              </h2>
              <p className="text-xs text-slate-500">
                Verify detected column headers and field mappings prior to database insertion.
              </p>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing & Running ML Inference...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Bulk Ingest</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="py-2.5 px-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {headers.map((h, i) => (
                      <td key={i} className="py-2 px-3 whitespace-nowrap font-mono text-slate-700">
                        {row[h] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Success Report */}
      {uploadResult && (
        <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Batch Ingestion & ML Inference Complete
              </h2>
              <p className="text-xs text-slate-500">
                All records successfully parsed, validated, committed, and evaluated.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Rows
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {uploadResult.total_processed}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                Successful Records
              </span>
              <p className="text-xl font-bold text-emerald-900 mt-1">
                {uploadResult.successful_records}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                New Students Added
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {uploadResult.inserted_students_count}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Assessments Inserted
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {uploadResult.inserted_assessments_count}
              </p>
            </div>
          </div>

          {/* Validation Warnings / Error Log if any failed */}
          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Rows with Validation Issues ({uploadResult.failed_records})</span>
              </div>
              <ul className="list-disc pl-5 text-xs text-amber-900 space-y-1">
                {uploadResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setFile(null);
                setPreviewRows([]);
                setUploadResult(null);
              }}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 rounded-lg transition-colors"
            >
              Upload Another CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Play,
  Sparkles,
  Info,
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  FileText,
  User,
  ArrowRight,
  Download,
} from 'lucide-react';
import { studentsApi, predictionsApi } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import FeatureImportanceChart from '../components/FeatureImportanceChart';
import { Link } from 'react-router-dom';

export default function FacultyDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [predictingId, setPredictingId] = useState(null);

  // XAI Modal State
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (riskFilter) params.risk_filter = riskFilter;
      const data = await studentsApi.getAll(params);
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, riskFilter]);

  // Run prediction on student row
  const handleRunPrediction = async (studentId, e) => {
    if (e) e.stopPropagation();
    try {
      setPredictingId(studentId);
      const res = await predictionsApi.evaluate(studentId);

      // Update student in local state
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? {
                ...s,
                latest_risk_tier: res.risk_tier,
                latest_confidence: res.confidence_score,
                latest_attendance: res.academic_snapshot?.attendance_percentage,
                latest_internals: res.academic_snapshot?.internal_test_marks,
              }
            : s
        )
      );

      // Open XAI Modal with results
      setSelectedPrediction(res);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Prediction failed:', err);
      alert(err.response?.data?.detail || 'Inference failed. Check assessment records for this student.');
    } finally {
      setPredictingId(null);
    }
  };

  // View existing prediction detail
  const handleViewDetails = async (student) => {
    try {
      setModalLoading(true);
      setIsModalOpen(true);
      const studentDetails = await studentsApi.getById(student.id);

      if (studentDetails.predictions && studentDetails.predictions.length > 0) {
        const latestPred = studentDetails.predictions[0];
        const latestAssess = studentDetails.assessments?.[0] || {};

        setSelectedPrediction({
          student_id: student.id,
          student_name: student.name,
          roll_number: student.roll_number,
          department: student.department,
          semester: student.current_semester,
          risk_tier: latestPred.risk_tier,
          confidence_score: latestPred.confidence_score,
          top_negative_factors: latestPred.top_negative_factors || [],
          actionable_recommendations: latestPred.actionable_recommendations || [],
          model_version: latestPred.model_version,
          academic_snapshot: {
            attendance_percentage: latestAssess.attendance_percentage || 0,
            internal_test_marks: latestAssess.internal_test_marks || 0,
            assignment_score: latestAssess.assignment_score || 0,
            quiz_score: latestAssess.quiz_score || 0,
            prev_semester_gpa: latestAssess.prev_semester_gpa || 0,
          },
          created_at: latestPred.created_at,
        });
      } else {
        // If unpredicted, trigger inference
        await handleRunPrediction(student.id);
      }
    } catch (err) {
      console.error('Failed to fetch details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Export filtered roster to CSV
  const handleExportCsv = () => {
    if (students.length === 0) return;
    const header = "Roll Number,Student Name,Department,Semester,Attendance %,Internal Marks,Risk Tier,Confidence\n";
    const rows = students.map(s =>
      `"${s.roll_number}","${s.name}","${s.department}",${s.current_semester},${s.latest_attendance ?? ''},${s.latest_internals ?? ''},"${s.latest_risk_tier ?? 'Unpredicted'}",${s.latest_confidence ? Math.round(s.latest_confidence * 100) + '%' : ''}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sapps_student_roster_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const highRiskCount = students.filter((s) => s.latest_risk_tier === 'High Risk').length;
  const modRiskCount = students.filter((s) => s.latest_risk_tier === 'Moderate Risk').length;
  const lowRiskCount = students.filter((s) => s.latest_risk_tier === 'Low Risk').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Student Academic Performance Roster
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time ML risk stratification, Explainable AI factor breakdown, and early academic intervention.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={students.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors shadow-xs disabled:opacity-50"
            title="Download current roster and prediction results as CSV"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Roster CSV</span>
          </button>
          <Link
            to="/batch-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs rounded-xl border border-indigo-200 transition-colors shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Batch CSV</span>
          </Link>
        </div>
      </div>

      {/* Cohort Quick Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Students
          </span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{students.length}</p>
        </div>
        <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200/80 shadow-xs">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> High Risk Alert
          </span>
          <p className="text-2xl font-extrabold text-rose-800 mt-1">{highRiskCount}</p>
        </div>
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 shadow-xs">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Moderate Risk
          </span>
          <p className="text-2xl font-extrabold text-amber-800 mt-1">{modRiskCount}</p>
        </div>
        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Low Risk (Safe)
          </span>
          <p className="text-2xl font-extrabold text-emerald-800 mt-1">{lowRiskCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or roll #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase">Risk Tier:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="High Risk">High Risk Only</option>
            <option value="Moderate Risk">Moderate Risk Only</option>
            <option value="Low Risk">Low Risk (Safe)</option>
            <option value="Unpredicted">Unpredicted</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-3.5">Roll Number</th>
                <th scope="col" className="px-6 py-3.5">Student Name</th>
                <th scope="col" className="px-6 py-3.5">Department</th>
                <th scope="col" className="px-6 py-3.5 text-center">Semester</th>
                <th scope="col" className="px-6 py-3.5 text-center">Attendance</th>
                <th scope="col" className="px-6 py-3.5 text-center">Internals</th>
                <th scope="col" className="px-6 py-3.5">Predicted Risk Tier</th>
                <th scope="col" className="px-6 py-3.5 text-right">Intervention Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2 text-indigo-600 font-medium">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      Loading student roster...
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400 text-sm">
                    No students match the current filters.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => handleViewDetails(student)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-semibold text-indigo-600 text-xs">
                      {student.roll_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">
                      {student.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-slate-700 font-medium text-xs">
                      Sem {student.current_semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs">
                      {student.latest_attendance !== null && student.latest_attendance !== undefined ? (
                        <span
                          className={`font-semibold ${
                            student.latest_attendance < 75 ? 'text-rose-600 font-bold' : 'text-slate-800'
                          }`}
                        >
                          {student.latest_attendance}%
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs">
                      {student.latest_internals !== null && student.latest_internals !== undefined ? (
                        <span
                          className={`font-semibold ${
                            student.latest_internals < 50 ? 'text-rose-600 font-bold' : 'text-slate-800'
                          }`}
                        >
                          {student.latest_internals}/100
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RiskBadge
                        riskTier={student.latest_risk_tier}
                        confidence={student.latest_confidence}
                        size="sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleRunPrediction(student.id, e)}
                          disabled={predictingId === student.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs transition-all disabled:opacity-50"
                          title="Run real-time inference on this student"
                        >
                          {predictingId === student.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                          <span>Run Prediction</span>
                        </button>

                        <button
                          onClick={() => handleViewDetails(student)}
                          className="px-2.5 py-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-colors font-medium"
                          title="View XAI Attribution & Interventions"
                        >
                          Explain AI
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* XAI & RECOMMENDATIONS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Explainable AI (XAI) Assessment Report
                  </h3>
                  <p className="text-xs text-slate-500">
                    Model: {selectedPrediction?.model_version || 'Random Forest Classifier (Optimized)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            {modalLoading ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Computing XAI Attributions & Interventions...</span>
              </div>
            ) : selectedPrediction ? (
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Student Overview Strip */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Student</span>
                    <h4 className="text-base font-bold text-slate-900">{selectedPrediction.student_name}</h4>
                    <p className="text-xs text-slate-600 font-mono mt-0.5">
                      {selectedPrediction.roll_number} • {selectedPrediction.department} (Sem {selectedPrediction.semester})
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-500 font-medium block">Risk Classification</span>
                      <RiskBadge
                        riskTier={selectedPrediction.risk_tier}
                        confidence={selectedPrediction.confidence_score}
                        size="lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Snapshot Metrics */}
                {selectedPrediction.academic_snapshot && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Academic Assessment Metrics Snapshot
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                        <span className="text-[11px] text-slate-500 block">Attendance</span>
                        <strong className="text-sm text-slate-800">
                          {selectedPrediction.academic_snapshot.attendance_percentage}%
                        </strong>
                      </div>
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                        <span className="text-[11px] text-slate-500 block">Internal Marks</span>
                        <strong className="text-sm text-slate-800">
                          {selectedPrediction.academic_snapshot.internal_test_marks}/100
                        </strong>
                      </div>
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                        <span className="text-[11px] text-slate-500 block">Assignment</span>
                        <strong className="text-sm text-slate-800">
                          {selectedPrediction.academic_snapshot.assignment_score}/100
                        </strong>
                      </div>
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                        <span className="text-[11px] text-slate-500 block">Quiz Score</span>
                        <strong className="text-sm text-slate-800">
                          {selectedPrediction.academic_snapshot.quiz_score}/100
                        </strong>
                      </div>
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-white col-span-2 sm:col-span-1">
                        <span className="text-[11px] text-slate-500 block">Prior GPA</span>
                        <strong className="text-sm text-slate-800">
                          {selectedPrediction.academic_snapshot.prev_semester_gpa}/10.0
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Feature Importance & Contribution Chart */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Feature Contribution to Risk Prediction (% Weight)
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Standard Benchmarks: Attendance &ge; 75%, Internals &ge; 50
                    </span>
                  </div>
                  <FeatureImportanceChart factors={selectedPrediction.top_negative_factors} />
                </div>

                {/* Prescriptive Interventions */}
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                      Tailored Academic Interventions (Faculty Action Plan)
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {selectedPrediction.actionable_recommendations &&
                    selectedPrediction.actionable_recommendations.length > 0 ? (
                      selectedPrediction.actionable_recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-indigo-950 bg-white/90 p-3 rounded-lg border border-indigo-100 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{rec}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">No specific interventions generated.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 rounded-lg transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


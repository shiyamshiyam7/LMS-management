import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download,
  RotateCcw,
  Printer,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const QuizPage: React.FC = () => {
  const {
    quizQuestions,
    quizAnswers,
    setQuizAnswer,
    quizResult,
    submitQuiz,
    resetQuiz,
    currentUser,
    selectedCourse,
    setActiveTab,
    showToast,
  } = useApp();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const answeredCount = Object.keys(quizAnswers).length;
  const isAllAnswered = answeredCount === quizQuestions.length;

  const handleSubmit = async () => {
    if (!isAllAnswered) {
      showToast(`Please answer all ${quizQuestions.length} questions before submitting.`, 'warn');
      return;
    }
    setIsSubmitting(true);
    await submitQuiz();
    setIsSubmitting(false);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Banner */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <Award className="w-4 h-4" />
              <span>Module 1.6 Assessment</span>
              <span>·</span>
              <span>Accreditation Exam</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Architecture Scenario Validation Quiz
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Passing criteria: 80% or higher. Evaluates PACELC trade-offs, Raft consensus invariants, and fencing tokens.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-400 font-mono">
              Progress: <strong className="text-white">{answeredCount}</strong> / {quizQuestions.length} answered
            </span>
          </div>
        </div>

        {/* Score Card (shown after submission) */}
        {quizResult && (
          <div
            className={`p-6 rounded-2xl border ${
              quizResult.passed
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-100'
            } space-y-4`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black ${
                    quizResult.passed
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {quizResult.score}%
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {quizResult.passed ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        Congratulations! You Passed the Assessment.
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-400" />
                        Score: {quizResult.score}% (Passing score is 80%)
                      </>
                    )}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {quizResult.passed
                      ? 'Your official Certificate of Excellence is now unlocked and available for download.'
                      : 'Review the explanations below and re-attempt to unlock your verified credential.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {quizResult.passed ? (
                  <button
                    onClick={() => setShowCertificateModal(true)}
                    className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <Award className="w-4 h-4" />
                    <span>View & Download Certificate</span>
                  </button>
                ) : (
                  <button
                    onClick={resetQuiz}
                    className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MCQ Questions List */}
        <div className="space-y-6">
          {quizQuestions.map((q, qIndex) => {
            const selectedOption = quizAnswers[q.id];
            const isCorrect = quizResult?.submitted && selectedOption === q.correctOptionId;
            const isIncorrect = quizResult?.submitted && selectedOption && selectedOption !== q.correctOptionId;

            return (
              <div
                key={q.id}
                className={`p-6 rounded-2xl bg-slate-900 border transition-colors ${
                  quizResult?.submitted
                    ? isCorrect
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-rose-500/40 bg-rose-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                } space-y-4`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded bg-slate-800 font-mono text-xs font-bold text-slate-300 flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                      {qIndex + 1}
                    </span>
                    <h4 className="text-sm sm:text-base font-semibold text-white leading-snug">
                      {q.question}
                    </h4>
                  </div>

                  {quizResult?.submitted && (
                    <div>
                      {isCorrect ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Options List */}
                <div className="space-y-2.5 pt-2">
                  {q.options.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    const isTheCorrectOne = quizResult?.submitted && opt.id === q.correctOptionId;

                    let optStyle = 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700';

                    if (isSelected && !quizResult?.submitted) {
                      optStyle = 'border-blue-500 bg-blue-500/15 text-white font-medium shadow-sm';
                    } else if (quizResult?.submitted) {
                      if (isTheCorrectOne) {
                        optStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-200 font-semibold';
                      } else if (isSelected && !isTheCorrectOne) {
                        optStyle = 'border-rose-500 bg-rose-500/15 text-rose-200';
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={quizResult?.submitted}
                        onClick={() => setQuizAnswer(q.id, opt.id)}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between transition-all ${optStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full border border-slate-700 text-[11px] font-mono flex items-center justify-center shrink-0 uppercase">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {isSelected && !quizResult?.submitted && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                        {isTheCorrectOne && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation on submit */}
                {quizResult?.submitted && (
                  <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-300 space-y-1">
                    <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                      Detailed Explanation:
                    </p>
                    <p className="leading-relaxed text-slate-400">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quiz Submission Button Footer */}
        {!quizResult?.submitted && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Submit your answers to receive instant automated evaluation and certificate accreditation.
            </p>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isAllAnswered}
              className={`py-3 px-6 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg ${
                isAllAnswered
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {isSubmitting ? 'Evaluating...' : 'Submit Assessment for Grading'}
            </button>
          </div>
        )}

      </div>

      {/* Certificate Modal / Full View */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl my-8">
            
            {/* Modal Top Bar */}
            <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Accredited Systems Engineering Certificate
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintCertificate}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Certificate Layout */}
            <div className="p-8 sm:p-12 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-4 border-double border-slate-700/80 m-4 rounded-2xl relative text-center space-y-6">
              
              {/* Decorative Corner Seals */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-500/50" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-500/50" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-500/50" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-500/50" />

              {/* Institution Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-blue-400 uppercase">
                  <Award className="w-5 h-5 text-blue-400" />
                  CLARITY LEARNING SYSTEMS · ACCREDITED
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  INSTITUTE OF DISTRIBUTED COMPUTING & SYSTEMS ARCHITECTURE
                </div>
              </div>

              {/* Title */}
              <div className="py-2 space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  Certificate of Excellence
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Distinguished Systems Architect
                </h2>
                <p className="text-xs text-slate-400 italic">
                  This official credential is hereby awarded to
                </p>
              </div>

              {/* Graduate Name */}
              <div className="py-2 border-b-2 border-t-2 border-slate-800/80">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-emerald-300 tracking-tight font-serif">
                  {currentUser.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  for successfully mastering the curriculum and passing the rigorous scenario assessment in
                </p>
                <p className="text-sm font-bold text-white mt-1">
                  {selectedCourse.title}
                </p>
              </div>

              {/* Signatures & Credentials Row */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-6 items-end text-left text-xs">
                
                {/* Instructor Signature */}
                <div>
                  <div className="font-serif italic text-lg text-slate-200 border-b border-slate-700 pb-1">
                    Dr. Sarah Chen
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    <strong>Lead Instructor</strong><br />
                    Staff Systems Architect
                  </p>
                </div>

                {/* Verification Seal */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex flex-col items-center justify-center text-emerald-400 shadow-inner">
                    <ShieldCheck className="w-6 h-6" />
                    <span className="text-[8px] font-bold tracking-widest uppercase">VERIFIED</span>
                  </div>
                </div>

                {/* Credential ID & Hash */}
                <div className="text-right">
                  <p className="font-mono text-slate-300 font-bold">
                    ID: CL-89241-ARCH
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono truncate">
                    Hash: 9f82a...bc41
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Issued: {new Date().toLocaleDateString()}
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

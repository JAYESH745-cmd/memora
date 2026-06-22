import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Clock,
  FileText,
  Flame,
  Plus,
  RotateCw,
  Sparkles,
  Trophy,
} from "lucide-react";

import Spinner from "../components/common/Spinner";
import progressService from "../services/progressService";

const emptyDashboard = {
  overview: {
    totalDocuments: 0,
    totalFlashcardSets: 0,
    totalFlashcards: 0,
    reviewedFlashcards: 0,
    starredFlashcards: 0,
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    studyStreak: 0,
  },
  recentActivity: {
    documents: [],
    quizzes: [],
  },
};

const numberOrZero = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const normalizeDashboard = (payload) => {
  const data = payload?.data ?? payload ?? {};
  const overview = data.overview ?? {};
  const recentActivity = data.recentActivity ?? {};

  return {
    overview: {
      ...emptyDashboard.overview,
      ...overview,
    },
    recentActivity: {
      documents: Array.isArray(recentActivity.documents)
        ? recentActivity.documents
        : [],
      quizzes: Array.isArray(recentActivity.quizzes)
        ? recentActivity.quizzes
        : [],
    },
  };
};

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await progressService.getDashboardData();
      setDashboardData(normalizeDashboard(res));
    } catch (err) {
      const message = err?.message || "Failed to load dashboard";
      setError(message);
      setDashboardData(emptyDashboard);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const { overview, recentActivity } = dashboardData;
  const documents = recentActivity.documents;
  const quizzes = recentActivity.quizzes;

  const studyScore = useMemo(() => {
    const reviewed = numberOrZero(overview.reviewedFlashcards);
    const total = numberOrZero(overview.totalFlashcards);
    return total > 0 ? Math.round((reviewed / total) * 100) : 0;
  }, [overview.reviewedFlashcards, overview.totalFlashcards]);

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const stats = [
    {
      title: "Documents",
      value: numberOrZero(overview.totalDocuments),
      icon: FileText,
      tone: "bg-cyan-50 text-cyan-700 ring-cyan-100",
      caption: "Uploaded learning material",
    },
    {
      title: "Flashcards",
      value: numberOrZero(overview.totalFlashcards),
      icon: BookOpen,
      tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      caption: `${numberOrZero(overview.totalFlashcardSets)} active sets`,
    },
    {
      title: "Quizzes",
      value: numberOrZero(overview.totalQuizzes),
      icon: BrainCircuit,
      tone: "bg-violet-50 text-violet-700 ring-violet-100",
      caption: `${numberOrZero(overview.completedQuizzes)} completed`,
    },
    {
      title: "Average Score",
      value: `${numberOrZero(overview.averageScore)}%`,
      icon: Trophy,
      tone: "bg-amber-50 text-amber-700 ring-amber-100",
      caption: "Across completed quizzes",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <Sparkles size={14} />
              Learning dashboard
            </div>

            <div className="mt-5 max-w-2xl">
              <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                Your study command center
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Track documents, review cards, and keep quizzes moving from one focused workspace.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/documents")}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus size={17} />
                Add document
              </button>
              <button
                type="button"
                onClick={() => navigate("/flashcards")}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Review cards
                <ArrowRight size={17} />
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-950 p-6 text-white lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Study streak</p>
                <p className="mt-1 text-4xl font-bold">
                  {numberOrZero(overview.studyStreak)}
                  <span className="ml-1 text-base font-semibold text-slate-300">days</span>
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-amber-300">
                <Flame size={26} />
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Flashcard review</span>
                <span className="font-semibold">{studyScore}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-emerald-400"
                  style={{ width: `${Math.min(studyScore, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchDashboardData}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 font-semibold text-white transition hover:bg-amber-700"
          >
            <RotateCw size={15} />
            Retry
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader
            icon={Clock}
            title="Recent activity"
            actionLabel="View documents"
            onAction={() => navigate("/documents")}
          />

          <div className="mt-5 space-y-3">
            {documents.length === 0 && quizzes.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {documents.map((doc) => (
                  <ActivityItem
                    key={doc._id}
                    icon={FileText}
                    title={doc.title || doc.fileName || "Untitled document"}
                    label="Document"
                    date={doc.lastAccessed || doc.createdAt}
                    onClick={() => doc._id && navigate(`/documents/${doc._id}`)}
                  />
                ))}
                {quizzes.map((quiz) => (
                  <ActivityItem
                    key={quiz._id}
                    icon={BrainCircuit}
                    title={quiz.title || "Quiz attempt"}
                    label="Quiz"
                    date={quiz.completedAt || quiz.createdAt}
                    rightText={`${numberOrZero(quiz.score)}%`}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader icon={BarChart3} title="Progress snapshot" />

          <div className="mt-5 space-y-5">
            <ProgressRow
              label="Cards reviewed"
              value={numberOrZero(overview.reviewedFlashcards)}
              total={numberOrZero(overview.totalFlashcards)}
            />
            <ProgressRow
              label="Starred cards"
              value={numberOrZero(overview.starredFlashcards)}
              total={numberOrZero(overview.totalFlashcards)}
            />
            <ProgressRow
              label="Completed quizzes"
              value={numberOrZero(overview.completedQuizzes)}
              total={numberOrZero(overview.totalQuizzes)}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ title, value, icon, tone, caption }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ring-1 ${tone}`}>
        {React.createElement(icon, { size: 22 })}
      </div>
    </div>
    <p className="mt-4 text-sm text-slate-500">{caption}</p>
  </div>
);

const SectionHeader = ({ icon, title, actionLabel, onAction }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {React.createElement(icon, { size: 18 })}
      </div>
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
    </div>
    {actionLabel && (
      <button
        type="button"
        onClick={onAction}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        {actionLabel}
        <ArrowRight size={15} />
      </button>
    )}
  </div>
);

const EmptyState = () => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
    <FileText className="mx-auto h-10 w-10 text-slate-400" />
    <h3 className="mt-3 text-sm font-semibold text-slate-900">No activity yet</h3>
    <p className="mt-1 text-sm text-slate-500">
      Upload a document and generate learning material to start filling this space.
    </p>
  </div>
);

const ActivityItem = ({ icon, title, label, date, rightText, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
  >
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        {React.createElement(icon, { size: 19 })}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {label} - {date ? new Date(date).toLocaleString() : "Recently"}
        </p>
      </div>
    </div>
    {rightText && (
      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-bold text-emerald-700">
        {rightText}
      </span>
    )}
  </button>
);

const ProgressRow = ({ label, value, total }) => {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">
          {value} / {total}
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-slate-900"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default DashboardPage;

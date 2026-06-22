import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Layers,
  RotateCcw,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";

import Flashcard from "../components/flashcards/Flashcard";
import Spinner from "../components/common/Spinner";
import flashcardService from "../services/flashcardservice";

const FlashcardPage = () => {
  const { id: documentId } = useParams();
  const navigate = useNavigate();

  const [set, setSet] = useState(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSet = async () => {
      try {
        const res = await flashcardService.getAllFlashcardSets();
        const sets = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const found = sets.find((item) => {
          const linkedDocumentId = item.documentId?._id || item.documentId;
          return linkedDocumentId === documentId || item._id === documentId;
        });

        if (!found) {
          toast.error("Flashcard set not found");
          navigate("/flashcards");
          return;
        }

        setSet(found);
      } catch {
        toast.error("Failed to load flashcards");
      } finally {
        setLoading(false);
      }
    };

    loadSet();
  }, [documentId, navigate]);

  const cards = set?.cards || [];
  const card = cards[index];

  const progress = useMemo(() => {
    if (cards.length === 0) return 0;
    return Math.round(((index + 1) / cards.length) * 100);
  }, [cards.length, index]);

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      setSet((prev) => ({
        ...prev,
        cards: prev.cards.map((item) =>
          item._id === cardId
            ? {
                ...item,
                isStarred: !item.isStarred,
              }
            : item
        ),
      }));
    } catch {
      toast.error("Failed to update star");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!set || cards.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
        <h2 className="mt-4 text-lg font-bold text-slate-950">No cards in this set</h2>
        <button
          type="button"
          onClick={() => navigate("/flashcards")}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <ArrowLeft size={16} />
          Back to flashcards
        </button>
      </section>
    );
  }

  const starredCount = cards.filter((item) => item.isStarred || item.starred).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <button
          type="button"
          onClick={() => navigate("/flashcards")}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <RotateCcw size={14} />
              Study mode
            </div>
            <h1 className="mt-4 text-3xl font-bold text-slate-950">
              {set.title || "Flashcard Set"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Card {index + 1} of {cards.length}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:w-72">
            <Metric icon={Layers} label="Cards" value={cards.length} />
            <Metric icon={Star} label="Starred" value={starredCount} />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Progress</span>
            <span className="text-slate-500">{progress}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-slate-950"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </section>

      <Flashcard flashcard={card} onToggleStar={handleToggleStar} />

      <section className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setIndex((current) => (current - 1 + cards.length) % cards.length)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50"
          aria-label="Previous card"
        >
          <ChevronLeft />
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-slate-950">
            {index + 1} / {cards.length}
          </p>
          <p className="text-xs text-slate-500">Click card to flip</p>
        </div>

        <button
          type="button"
          onClick={() => setIndex((current) => (current + 1) % cards.length)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50"
          aria-label="Next card"
        >
          <ChevronRight />
        </button>
      </section>
    </div>
  );
};

const Metric = ({ icon, label, value }) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <div className="flex items-center gap-2 text-slate-500">
      {React.createElement(icon, { size: 15 })}
      <span className="text-xs font-medium">{label}</span>
    </div>
    <p className="mt-2 text-lg font-bold text-slate-950">{value}</p>
  </div>
);

export default FlashcardPage;

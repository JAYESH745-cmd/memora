import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Calendar,
  Layers,
  Search,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Spinner from "../components/common/Spinner";
import flashcardService from "../services/flashcardservice";

const FlashcardList = () => {
  const navigate = useNavigate();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [setToDelete, setSetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSets = async () => {
    setLoading(true);
    try {
      const res = await flashcardService.getAllFlashcardSets();
      setFlashcardSets(Array.isArray(res?.data) ? res.data : []);
    } catch {
      toast.error("Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
  }, []);

  const filteredSets = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return flashcardSets;

    return flashcardSets.filter((set) =>
      [set.title, set.documentId?.title]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search))
    );
  }, [flashcardSets, query]);

  const totals = useMemo(() => {
    const cards = flashcardSets.reduce((sum, set) => sum + (set.cards?.length || 0), 0);
    const starred = flashcardSets.reduce(
      (sum, set) => sum + (set.cards?.filter((card) => card.isStarred || card.starred).length || 0),
      0
    );

    return {
      sets: flashcardSets.length,
      cards,
      starred,
    };
  }, [flashcardSets]);

  const handleDelete = async () => {
    if (!setToDelete) return;

    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(setToDelete._id);
      toast.success("Flashcard set deleted");
      fetchSets();
    } catch {
      toast.error("Failed to delete set");
    } finally {
      setDeleting(false);
      setSetToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1fr_330px]">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <Sparkles size={14} />
              Flashcard studio
            </div>
            <h1 className="mt-5 text-3xl font-bold text-slate-950 sm:text-4xl">
              Review smarter, remember longer
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Keep every generated deck organized, searchable, and ready for focused study sessions.
            </p>
            <button
              type="button"
              onClick={() => navigate("/documents")}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Generate from documents
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="border-t border-slate-200 bg-slate-950 p-6 text-white lg:border-l lg:border-t-0">
            <p className="text-sm font-medium text-slate-300">Deck overview</p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <HeroMetric label="Sets" value={totals.sets} />
              <HeroMetric label="Cards" value={totals.cards} />
              <HeroMetric label="Starred" value={totals.starred} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search flashcard sets"
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </div>
      </section>

      {filteredSets.length === 0 ? (
        <EmptyFlashcards hasQuery={!!query} onDocuments={() => navigate("/documents")} />
      ) : (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredSets.map((set) => (
            <FlashcardSetCard
              key={set._id}
              set={set}
              onOpen={() => navigate(`/flashcards/${set.documentId?._id || set.documentId}`)}
              onDelete={(e) => {
                e.stopPropagation();
                setSetToDelete(set);
              }}
            />
          ))}
        </section>
      )}

      <Modal
        isOpen={!!setToDelete}
        onClose={() => setSetToDelete(null)}
        title="Delete flashcard set?"
      >
        <p className="text-sm leading-6 text-slate-600">
          This will remove <span className="font-semibold text-slate-950">{setToDelete?.title || "this set"}</span>.
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setSetToDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const HeroMetric = ({ label, value }) => (
  <div className="rounded-lg bg-white/10 p-3">
    <p className="text-2xl font-bold">{value}</p>
    <p className="mt-1 text-xs font-medium text-slate-300">{label}</p>
  </div>
);

const FlashcardSetCard = ({ set, onOpen, onDelete }) => {
  const cards = set.cards || [];
  const starred = cards.filter((card) => card.isStarred || card.starred).length;
  const sourceTitle =
    typeof set.documentId === "object" ? set.documentId?.title : "Linked document";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex min-h-60 flex-col rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-50 text-violet-700 ring-1 ring-violet-100">
          <Brain size={23} />
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          aria-label={`Delete ${set.title || "flashcard set"}`}
        >
          <Trash2 size={17} />
        </button>
      </div>

      <div className="mt-5 flex-1">
        <h3 className="line-clamp-2 text-lg font-bold text-slate-950">
          {set.title || "Flashcard Set"}
        </h3>
        <p className="mt-2 line-clamp-1 text-sm text-slate-500">{sourceTitle}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <MiniStat icon={Layers} label="Cards" value={cards.length} />
        <MiniStat icon={Star} label="Starred" value={starred} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
          <Calendar size={14} />
          {set.createdAt ? moment(set.createdAt).fromNow() : "Recently"}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 transition group-hover:text-slate-950">
          Study
          <ArrowRight size={15} />
        </span>
      </div>
    </button>
  );
};

const MiniStat = ({ icon, label, value }) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <div className="flex items-center gap-2 text-slate-500">
      {React.createElement(icon, { size: 15 })}
      <span className="text-xs font-medium">{label}</span>
    </div>
    <p className="mt-2 text-lg font-bold text-slate-950">{value}</p>
  </div>
);

const EmptyFlashcards = ({ hasQuery, onDocuments }) => (
  <section className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
      <BookOpen size={28} />
    </div>
    <h3 className="mt-4 text-lg font-bold text-slate-950">
      {hasQuery ? "No matching flashcards" : "No flashcards yet"}
    </h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      {hasQuery
        ? "Try another search term or clear the search to see all decks."
        : "Open a document and generate a set to start reviewing."}
    </p>
    {!hasQuery && (
      <button
        type="button"
        onClick={onDocuments}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Go to documents
        <ArrowRight size={17} />
      </button>
    )}
  </section>
);

export default FlashcardList;

import React, { useState, useEffect } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Sparkles,
  Brain,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../../services/flashcardservice";
import aiService from "../../services/aiservice";
import Spinner from "../common/Spinner";
import Modal from "../common/Modal";
import Flashcard from "./Flashcard";

const FlashcardManager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);
  console.log(documentId);

  /* -------------------------------------------------- */
  /* Fetch Flashcard Sets */
  /* -------------------------------------------------- */
  const fetchFlashcardSets = async () => {
    setLoading(true);
    try {
      const res = await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(res.data);
    } catch {
      toast.error("Failed to fetch flashcard sets");
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  if (!documentId) {
    setLoading(false);
    return;
  }

  fetchFlashcardSets();
}, [documentId]);

  /* -------------------------------------------------- */
  /* Generate Flashcards */
  /* -------------------------------------------------- */
  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      await aiService.generateFlashcards(documentId);
      toast.success("Flashcards generated successfully!");
      fetchFlashcardSets();
    } catch (error) {
      toast.error(error.message || "Failed to generate flashcards");
    } finally {
      setGenerating(false);
    }
  };

  /* -------------------------------------------------- */
  /* Navigation */
  /* -------------------------------------------------- */
  const handleNextCard = () => {
    if (!selectedSet) return;
    handleReview(currentCardIndex);
    setCurrentCardIndex(
      (i) => (i + 1) % selectedSet.cards.length
    );
  };

  const handlePrevCard = () => {
    if (!selectedSet) return;
    handleReview(currentCardIndex);
    setCurrentCardIndex(
      (i) => (i - 1 + selectedSet.cards.length) % selectedSet.cards.length
    );
  };

  /* -------------------------------------------------- */
  /* Review */
  /* -------------------------------------------------- */
  const handleReview = async (index) => {
    const card = selectedSet?.cards[index];
    if (!card) return;

    try {
      await flashcardService.reviewFlashcard(card._id, index);
    } catch {
      toast.error("Failed to review flashcard");
    }
  };

  /* -------------------------------------------------- */
  /* Delete */
  /* -------------------------------------------------- */
  const handleDeleteRequest = (e, set) => {
    e.stopPropagation();
    setSetToDelete(set);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!setToDelete) return;

    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(setToDelete._id);
      toast.success("Flashcard set deleted");
      setFlashcardSets((prev) =>
        prev.filter((s) => s._id !== setToDelete._id)
      );
      setSelectedSet(null);
    } catch {
      toast.error("Failed to delete set");
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
      setSetToDelete(null);
    }
  };

  /* -------------------------------------------------- */
  /* Render Flashcard Viewer */
  /* -------------------------------------------------- */
  const renderFlashcardViewer = () => {
    const card = selectedSet.cards[currentCardIndex];

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedSet(null)}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sets
        </button>

        <Flashcard
    flashcard={card}
    onToggleStar={handleToggleStar}
  />


        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevCard}
            className="p-3 rounded-lg border hover:bg-slate-50"
          >
            <ChevronLeft />
          </button>

          <span className="text-sm text-slate-500">
            {currentCardIndex + 1} / {selectedSet.cards.length}
          </span>

          <button
            onClick={handleNextCard}
            className="p-3 rounded-lg border hover:bg-slate-50"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------- */
  /* Render Set List */
  /* -------------------------------------------------- */
  const renderSetList = () => {
    if (loading) return <Spinner />;

    if (flashcardSets.length === 0) {
      return (
        <div className="text-center py-16">
          <Brain className="mx-auto w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium">No Flashcards Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Generate flashcards from your document to start learning and reinforce your knowledge.
          </p>

          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
          >
            {generating ? "Generating..." : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Flashcards
              </>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 gap-4">
        {flashcardSets.map((set) => (
          <div
            key={set._id}
            onClick={() => {
              setSelectedSet(set);
              setCurrentCardIndex(0);
            }}
            className="cursor-pointer rounded-xl border bg-white p-5 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-medium">
                {set.title || "Flashcard Set"}
              </h4>

              <button
                onClick={(e) => handleDeleteRequest(e, set)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-500 mt-2">
              {set.cards.length} cards
            </p>

            <p className="text-xs text-slate-400 mt-2">
              Created {moment(set.createdAt).fromNow()}
            </p>
          </div>
        ))}
      </div>
    );
  };

const handleToggleStar = async (cardId) => {
  try {
    // Call backend
    await flashcardService.toggleStar(cardId);

    // Update local state immediately (optimistic UI)
    setSelectedSet((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        cards: prev.cards.map((card) =>
          card._id === cardId
            ? { ...card, isStarred: !card.isStarred }
            : card
        ),
      };
    });
  } catch {
    toast.error("Failed to update star");
  }
};


  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-xl p-6">
        {selectedSet ? renderFlashcardViewer() : renderSetList()}
      </div>

      {/* Delete Modal */}
      <Modal
  isOpen={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  title="Delete flashcard set?"
  
>
  <div className="space-y-6">
    <p className="text-sm text-slate-600">
      This will permanently delete this flashcard set and all of its cards.
    </p>

    <p className="text-sm text-red-600 font-medium">
      This action cannot be undone.
    </p>
  </div>

  <div className="mt-6 flex justify-end gap-3">
    <button
      onClick={() => setIsDeleteModalOpen(false)}
      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700
                 hover:bg-slate-100 transition"
    >
      Cancel
    </button>

    <button
      onClick={handleConfirmDelete}
      disabled={deleting}
      className={`px-4 py-2 rounded-lg text-white transition
        ${deleting
          ? "bg-red-400 cursor-not-allowed"
          : "bg-red-600 hover:bg-red-700"
        }`}
    >
      {deleting ? "Deleting…" : "Delete"}
    </button>
  </div>
</Modal>

    </>
  );
};

export default FlashcardManager;

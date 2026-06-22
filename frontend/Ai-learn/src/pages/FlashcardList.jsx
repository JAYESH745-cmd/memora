import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Brain } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../services/flashcardservice";
import Spinner from "../components/common/Spinner";
import Modal from "../components/common/Modal";

const FlashcardList = () => {
  const navigate = useNavigate();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [setToDelete, setSetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ---------------- Fetch ALL sets ---------------- */
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

  if (loading) return <Spinner />;

  if (flashcardSets.length === 0) {
    return (
      <div className="text-center py-20">
        <Brain className="mx-auto w-12 h-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium">No Flashcards Yet</h3>
        <p className="text-sm text-slate-500">
          Generate flashcards from your documents to start learning.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        {flashcardSets.map((set) => (
          <div
            key={set._id}
            onClick={() => navigate(`/flashcards/${set.documentId?._id || set.documentId}`)}
            className="cursor-pointer rounded-xl border bg-white p-5 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-medium">
                {set.title || "Flashcard Set"}
              </h4>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSetToDelete(set);
                }}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-500 mt-2">
              {set.cards?.length || 0} cards
            </p>

            <p className="text-xs text-slate-400 mt-2">
              Created {moment(set.createdAt).fromNow()}
            </p>
          </div>
        ))}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={!!setToDelete}
        onClose={() => setSetToDelete(null)}
        title="Delete flashcard set?"
      >
        <p className="text-sm text-slate-600 mb-6">
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setSetToDelete(null)}
            className="px-4 h-10 rounded-lg border"
          >
            Cancel
          </button>

          <button
            onClick={async () => {
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
            }}
            className="px-4 h-10 rounded-lg bg-red-600 text-white"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default FlashcardList;

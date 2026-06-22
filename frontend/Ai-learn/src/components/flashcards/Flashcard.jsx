import { useState } from "react";
import { Star } from "lucide-react";

const Flashcard = ({ flashcard, onToggleStar }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const difficultyColors = {
    easy: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    medium: "bg-amber-50 text-amber-700 ring-amber-100",
    hard: "bg-red-50 text-red-700 ring-red-100",
  };
  const difficult = flashcard.difficult?.toLowerCase() || "medium";

  return (
    <div style={{ perspective: "1000px" }} className="relative h-80 w-full">
      <div
        className="relative h-full w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="absolute inset-0 cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            zIndex: isFlipped ? 0 : 1,
            pointerEvents: isFlipped ? "none" : "auto",
          }}
          onClick={() => setIsFlipped(true)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar?.(flashcard._id);
            }}
            className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50"
            aria-label="Toggle star"
          >
            <Star
              className={`w-5 h-5 ${
                flashcard.starred || flashcard.isStarred
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-slate-400"
              }`}
            />
          </button>
          <span
            className={`absolute left-5 top-5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide ring-1 ${
              difficultyColors[difficult] || "bg-slate-100 text-slate-700 ring-slate-200"
            }`}
          >
            {difficult}
          </span>

          <div className="flex h-full items-center justify-center px-8 py-16 text-center">
            <h3 className="max-w-2xl text-2xl font-bold leading-9 text-slate-950">
              {flashcard.question}
            </h3>
          </div>

          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
            Click to reveal answer
          </span>
        </div>

        <div
          className="absolute inset-0 cursor-pointer rounded-lg border border-slate-800 bg-slate-950 text-white shadow-lg"
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            zIndex: isFlipped ? 1 : 0,
            pointerEvents: isFlipped ? "auto" : "none",
          }}
          onClick={() => setIsFlipped(false)}
        >
          <span
            className={`absolute left-5 top-5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide ring-1 ${
              difficultyColors[difficult] || "bg-slate-100 text-slate-700 ring-slate-200"
            }`}
          >
            {difficult}
          </span>

          <div className="flex h-full items-center justify-center px-8 py-16 text-center">
            <p className="max-w-2xl text-xl font-semibold leading-8 text-slate-100">
              {flashcard.answer}
            </p>
          </div>

          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300">
            Click to flip back
          </span>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;

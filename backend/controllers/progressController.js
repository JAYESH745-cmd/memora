import Document from '../models/document.js';
import Flashcard from '../models/flashcard.js';
import Quiz from '../models/quiz.js';

const toDayKey = (date) => {
  if (!date) return null;

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return null;

  return value.toISOString().slice(0, 10);
};

const getPreviousDayKey = (dayKey) => {
  const date = new Date(`${dayKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return toDayKey(date);
};

const calculateStudyStreak = (dates) => {
  const activityDays = new Set(dates.map(toDayKey).filter(Boolean));
  if (activityDays.size === 0) return 0;

  const todayKey = toDayKey(new Date());
  let cursor = activityDays.has(todayKey)
    ? todayKey
    : [...activityDays].sort().at(-1);

  let streak = 0;
  while (cursor && activityDays.has(cursor)) {
    streak += 1;
    cursor = getPreviousDayKey(cursor);
  }

  return streak;
};

// @desc    Get user learning statistics
// @route   GET /api/progress/dashboard
// @access  Private
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get counts
    const totalDocuments = await Document.countDocuments({ userId });
    const totalFlashcardSets = await Flashcard.countDocuments({ userId });
    const totalQuizzes = await Quiz.countDocuments({ userId });
    const completedQuizzes = await Quiz.countDocuments({
      userId,
      completedAt: { $ne: null }
    });

    // Get flashcard statistics
    const flashcardSets = await Flashcard.find({ userId });
    let totalFlashcards = 0;
    let reviewedFlashcards = 0;
    let starredFlashcards = 0;

    flashcardSets.forEach(set => {
      totalFlashcards += set.cards.length;
      reviewedFlashcards += set.cards.filter(
        c => c.reviewCount > 0
      ).length;
      starredFlashcards += set.cards.filter(
        c => c.isStarred
      ).length;
    });

    // Get quiz statistics
    const quizzes = await Quiz.find({
      userId,
      completedAt: { $ne: null }
    });

    const averageScore = quizzes.length > 0
      ? Math.round(
          quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length
        )
      : 0;

    // Recent activity
    const recentDocuments = await Document.find({ userId })
      .sort({ lastAccessed: -1 })
      .limit(5)
      .select('title fileName lastAccessed status');

    const recentQuizzes = await Quiz.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('documentId', 'title')
      .select('title score totalQuestions completedAt');

    const studyActivityDates = [
      ...recentDocuments.map(doc => doc.lastAccessed || doc.createdAt),
      ...quizzes.map(quiz => quiz.completedAt || quiz.updatedAt),
      ...flashcardSets.flatMap(set =>
        set.cards
          .map(card => card.lastRevised)
          .filter(Boolean)
      ),
    ];

    const studyStreak = calculateStudyStreak(studyActivityDates);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalDocuments,
          totalFlashcardSets,
          totalFlashcards,
          reviewedFlashcards,
          starredFlashcards,
          totalQuizzes,
          completedQuizzes,
          averageScore,
          studyStreak
        },
        recentActivity: {
          documents: recentDocuments,
          quizzes: recentQuizzes
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

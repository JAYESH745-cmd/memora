import Flashcard from "../models/flashcard.js";

export const getAllFlashcardSets=async (req,res,next)=>{
    try {
    console.log("USER:", req.user);
    const flashcardSets=await Flashcard.find({userId:req.user._id})
    .populate('documentId','title fileName')
        .sort({createdAt:-1});
        res.status(200).json({
            success:true,
            count:flashcardSets.length,
            data:flashcardSets
        })
    } catch (error) {
        next(error);
    }
}
export const getFlashcards=async (req,res,next)=>{
    try {
        const flashcards=await Flashcard.find({
            userId:req.user._id,
            documentId:req.params.documentId
        })
        .populate('documentId','title fileName')
        .sort({createdAt:-1});
        res.status(200).json({
            success:true,
            count:flashcards.length,
            data:flashcards
        })
    } catch (error) {
        next(error);
    }
}
export const reviewFlashcard=async (req,res,next)=>{
    try {
    const flashcardSet=await Flashcard.findOne({
        'cards._id':req.params.cardId,
        userId:req.user._id
    })
    if(!flashcardSet){
        return res.status(404).json({
            success:false,
            error:'Flashcard set or card not found',
        })
    }

    const cardIndex=flashcardSet.cards.findIndex(card=> card._id.toString()=== req.params.cardId);
    if(cardIndex===-1){
        return res.status(404).json({
            success:false,
            error:'Flashcard not found in set',
        })
    }

    flashcardSet.cards[cardIndex].lastRevised=new Date();
    flashcardSet.cards[cardIndex].reviewCount+=1;

    await flashcardSet.save();

    res.status(200).json({
        success:true,
        data:flashcardSet,
        message:'flashcard reviewed successfully'
    })
    } catch (error) {
        next(error);
    }
}
export const toggleStarFlashcard = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      "cards._id": req.params.cardId,
      userId: req.user._id,
    });
   

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set or card not found",
      });
    }

    const cardIndex = flashcardSet.cards.findIndex(
      (card) => card._id.toString() === req.params.cardId
    );

    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Flashcard not found in set",
      });
    }

    flashcardSet.cards[cardIndex].isStarred =
      !flashcardSet.cards[cardIndex].isStarred;

    // ✅ SAVE THE DOCUMENT (NOT THE MODEL)
    await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: flashcardSet.cards[cardIndex],
      message: `Flashcard ${
        flashcardSet.cards[cardIndex].isStarred ? "starred" : "unstarred"
      }`,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFlashcardset=async (req,res,next)=>{
    try {
     const flashcardSet=await Flashcard.findOne({
        _id:req.params.id,
        userId:req.user._id
    })
    if(!flashcardSet){
        return res.status(404).json({
            success:false,
            error:'Flashcard set not found',
        })
    }

    await flashcardSet.deleteOne();

    res.status(200).json({
        success:true,
        message:'Flashcard set deleted successfully'
    });
    } catch (error) {
        next(error);
    }
}

import Document from "../models/document.js";
import Flashcard from "../models/flashcard.js";
import Quiz from "../models/quiz.js";
import { extractTextFromPDF } from "../utils/pdfparser.js";
import { chunkText } from "../utils/textchunker.js";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import mongoose from "mongoose";

// Ensure uploads directory exists
const uploadDir = path.join("uploads", "documents");

if (!fsSync.existsSync(uploadDir)) {
    fsSync.mkdirSync(uploadDir, { recursive: true });
}

export const uploadDocument = async (req, res, next) => {
    try {
        console.log("FILE:", req.file);
        console.log("BODY:", req.body);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "Please upload a PDF file",
            });
        }

        const { title } = req.body;

        if (!title) {
            await fs.unlink(req.file.path).catch(() => {});

            return res.status(400).json({
                success: false,
                error: "Please provide a document title",
            });
        }

        // Production backend URL
        const baseUrl = "https://memora-backend-cp4z.onrender.com";

        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: req.file.path, // local path for deletion
            fileUrl: fileUrl, // public URL for frontend
            fileSize: req.file.size,
            status: "processing",
        });

        // Background PDF processing
        processPDF(document._id, req.file.path).catch((err) => {
            console.error("PDF processing error:", err);
        });

        res.status(201).json({
            success: true,
            data: document,
            message: "Document uploaded successfully. Processing in progress...",
        });

    } catch (error) {
        console.error("Upload Error:", error);

        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }

        next(error);
    }
};

const processPDF = async (documentId, filePath) => {
    try {
        const { text } = await extractTextFromPDF(filePath);

        const chunks = chunkText(text, 500, 50);

        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks: chunks,
            status: "ready",
        });

        console.log(`Document ${documentId} processed successfully`);

    } catch (error) {
        console.error("Error processing PDF:", error);

        await Document.findByIdAndUpdate(documentId, {
            status: "failed",
        });
    }
};

export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user._id),
                },
            },
            {
                $lookup: {
                    from: "flashcards",
                    localField: "_id",
                    foreignField: "documentId",
                    as: "flashcardsets",
                },
            },
            {
                $lookup: {
                    from: "quizzes",
                    localField: "_id",
                    foreignField: "documentId",
                    as: "quizzes",
                },
            },
            {
                $addFields: {
                    flashcardCount: { $size: "$flashcardsets" },
                    quizCount: { $size: "$quizzes" },
                },
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardsets: 0,
                    quizzes: 0,
                },
            },
            {
                $sort: {
                    uploadDate: -1,
                },
            },
        ]);

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents,
        });

    } catch (error) {
        next(error);
    }
};

export const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
            });
        }

        const flashcardCount = await Flashcard.countDocuments({
            documentId: document._id,
            userId: req.user._id,
        });

        const quizCount = await Quiz.countDocuments({
            documentId: document._id,
            userId: req.user._id,
        });

        document.lastAccessed = Date.now();

        await document.save();

        const documentData = document.toObject();

        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        res.status(200).json({
            success: true,
            data: documentData,
        });

    } catch (error) {
        next(error);
    }
};

export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
            });
        }

        // Delete local file if exists
        if (document.filePath) {
            await fs.unlink(document.filePath).catch(() => {});
        }

        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: "Document deleted successfully",
        });

    } catch (error) {
        next(error);
    }
};
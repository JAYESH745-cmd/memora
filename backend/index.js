import dotenv from 'dotenv'
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js'
//import errorHandler from '../middlewares/errorHandler.js'
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import FlashcardRoutes from './routes/flashcardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

const __filename=fileURLToPath(import.meta.url);
const __dirname =path.dirname(__filename);

connectDB();
const app=express();
app.use(
    cors({
        origin:"*",
        methods:["GET","POST","PUT","DELETE"],
        allowedHeaders:["Content-Type","Authorization"],
        credentials:true,
    })
);

app.use(express.json());
app.use(express.urlencoded({extended :true}));

app.use('/uploads',express.static(path.join(__dirname,'uploads')));


//Routes
app.use("/api/auth",authRoutes);
app.use("/api/documents",documentRoutes);
app.use("/api/flashcards",FlashcardRoutes);
app.use("/api/ai",aiRoutes);
app.use("/api/quiz",quizRoutes);
app.use("/api/dashboard",progressRoutes);

// backend setup
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running 🚀"
  });
});


//error handler 

app.use((req,res)=>{
    res.status(404).json({ 
        success:false,
        error:"Route not found"
    });
});

const PORT=process.env.PORT || 8000;

app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`);
});


process.on('unhandledRejection',(err)=>{
    console.error(`Error: ${err.message}`);
    process.exit(1);
});


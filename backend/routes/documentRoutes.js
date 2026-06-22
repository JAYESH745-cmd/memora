import express from 'express'
import {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
} from '../controllers/documentController.js'
import protect from '../middlewares/auth.js'
import upload from '../config/multer.js'

const router=express.Router();

const handleUpload = (req, res, next) => {
    upload.single('file')(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message || 'File upload failed',
            });
        }

        next();
    });
};

router.post('/upload',protect,handleUpload,uploadDocument)
router.get('/',protect,getDocuments)
router.get('/:id',protect,getDocument)
router.delete('/:id',protect,deleteDocument)



export default router;

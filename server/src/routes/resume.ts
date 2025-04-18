import express from 'express';
import { resumeUploader,resumeEvaluationController } from '../controllers/resume';

const router = express.Router();

// Code execution endpoint
router.post('/upload', resumeUploader);
router.post('/chat', resumeEvaluationController);

export default router;
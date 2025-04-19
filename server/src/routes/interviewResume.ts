import express from 'express';
import { resumeEvaluationController,resumeUploader } from '../controllers/interviewResumeAnalysis';

const router = express.Router();

// Analyze interview experience article
router.post('/uploadResume', resumeUploader);
router.post('/evaluateResume', resumeEvaluationController);

export default router;
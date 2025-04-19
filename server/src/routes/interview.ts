import express from 'express';
import { analyzeInterviewController } from '../controllers/interviewAnalysis';

const router = express.Router();

// Analyze interview experience article
router.post('/analyze', analyzeInterviewController);

export default router;
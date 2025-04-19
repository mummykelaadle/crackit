import { Router } from 'express';
import { extractCodingQuestionsController } from '../controllers/extractCodingQuestions';
import { extractBehavioralQuestionsController } from '../controllers/extractBehavioralQuestions';

const router = Router();

// Route for coding question extraction
router.post('/coding', extractCodingQuestionsController);

// Route for behavioral question extraction
router.post('/behavioral', extractBehavioralQuestionsController);

export default router;
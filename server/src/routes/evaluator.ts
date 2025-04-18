import express from 'express';
import { codeEvaluationController } from '../controllers/codeEvaluation';

const router = express.Router();

// Code execution endpoint
router.post('/evaluate', codeEvaluationController);

export default router;
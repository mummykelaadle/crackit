import express from 'express';
import { executeCodeController } from '../controllers/codeExecution';

const router = express.Router();

// Example route
router.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

// Code execution endpoint
router.post('/execute', executeCodeController);

export default router;
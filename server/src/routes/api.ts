import express from 'express';
import { executeCodeController } from '../controllers/codeExecution';
import { randomBytes } from 'crypto';

const router = express.Router();

// Example route
router.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

// Code execution endpoint
router.post('/execute', executeCodeController);

// Generate a random session ID
router.get('/createSessionID', (req, res) => {
  const sessionId = randomBytes(16).toString('hex');
  res.json({ sessionId });
});

export default router;
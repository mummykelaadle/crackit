import express from 'express';
import { executeCodeController } from '../controllers/codeExecution';
import { randomBytes } from 'crypto';
import multer from 'multer';
import { analyzeAudioAndCode } from '../controllers/codeEvaluation';

const router = express.Router();
const upload = multer();

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

// NOTE: The route is already implemented at /api/evaluate .This should be removed in production
// Endpoint to handle audio, code, and question data
router.post('/analyze', upload.single('audio'), async (req, res) => {
  try {
    const audio = req.file;
    const code = req.body.code;
    const question = req.body.question;

    if (!audio || !code || !question) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const feedback = await analyzeAudioAndCode(audio, code, question);
    console.log('Feedback:', feedback);
    
    res.json({ feedback });
  } catch (error) {
    console.error('Error analyzing data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
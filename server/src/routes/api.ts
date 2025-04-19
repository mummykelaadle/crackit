import express from 'express';
import { executeCodeController } from '../controllers/codeExecution';
import { randomBytes } from 'crypto';
import multer from 'multer';
import { analyzeAudioAndCode } from '../controllers/codeEvaluation';
import { getProblem } from '../controllers/problemController';
import mongoose from 'mongoose';
require('dotenv').config();


const router = express.Router();
const upload = multer();

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI is not defined in the environment variables');
}
mongoose.connect(mongoUri)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

const articleSchema = new mongoose.Schema({
  content: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { collection: "articles" });

const Article = mongoose.model("Article", articleSchema);

// Example route
router.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

// Code execution endpoint
router.post('/execute', executeCodeController);

// Problem endpoint - Get problem by ID
router.get('/problem/:id', getProblem);

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

// Route: GET /articles
router.get('/articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
   
    const formattedArticles = articles.map((article, index) => ({
      id: article._id,
      title: `Interview ${index + 1}`,
      // preview: (article.content ?? '').substring(0, 100) + "...",
      content: (article.content ?? ''),
      author: "Anonymous",
      date: article.createdAt,
      isYours: false, // you can dynamically set this based on logged-in user
    }));


    res.status(200).json(formattedArticles);
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});


export default router;
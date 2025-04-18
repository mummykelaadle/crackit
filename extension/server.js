const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// Mongoose Model
const articleSchema = new mongoose.Schema({
  content: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Article = mongoose.model('Article', articleSchema);

// Route
app.post('/capture', async (req, res) => {
  try {
    const { content } = req.body;
    const article = new Article({ content });
    await article.save();
    console.log('Article saved!');
    res.send('Article saved successfully!');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});

// Start server
app.listen(5000, () => console.log('Server running on http://localhost:5000'));

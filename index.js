const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend.onrender.com'], // replace with actual Render frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getSimilarityScore(text1, text2) {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/sentence-transformers/paraphrase-MiniLM-L6-v2',
      {
        inputs: {
          source_sentence: text1,
          sentences: [text2]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`
        }
      }
    );
    return response.data[0];
  } catch (err) {
    console.error('Hugging Face error:', err.message);
    return 0;
  }
}

app.post('/api/signup', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *',
      [email, password, role]
    );
    res.status(201).json({ message: 'User created!', user: result.rows[0] });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length > 0) {
      res.status(200).json({ message: 'Login successful!' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/profile', async (req, res) => {
  const { user_id, skills, interests, city } = req.body;
  try {
    const skillsArray = typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills;
    const interestsArray = typeof interests === 'string' ? interests.split(',').map(i => i.trim()) : interests;

    const result = await pool.query(
      'INSERT INTO profiles (user_id, skills, interests, city) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, skillsArray, interestsArray, city]
    );
    res.status(201).json({ message: 'Profile created!', profile: result.rows[0] });
  } catch (err) {
    console.error('Profile error:', err.message);
    res.status(500).json({ error: 'Profile creation failed' });
  }
});

app.get('/api/match/ai/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const userQuery = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const user = userQuery.rows[0];
    const candidatesQuery = await pool.query('SELECT * FROM profiles WHERE user_id != $1', [userId]);

    const matches = [];

    for (const candidate of candidatesQuery.rows) {
      try {
        const skillScore = await getSimilarityScore(
          `Skills: ${user.skills.join(', ')}`,
          `Skills: ${candidate.skills.join(', ')}`
        );
        const interestScore = await getSimilarityScore(
          `Interests: ${user.interests.join(', ')}`,
          `Interests: ${candidate.interests.join(', ')}`
        );
        const cityScore = user.city === candidate.city ? 1 : 0;
        const matchScore = (skillScore + interestScore + cityScore) / 3;

        matches.push({
          user_id: candidate.user_id,
          match_score: matchScore.toFixed(2),
          shared_city: cityScore === 1
        });
      } catch (matchErr) {
        console.error('Error calculating match for candidate:', candidate.user_id, matchErr.message);
      }
    }

    matches.sort((a, b) => b.match_score - a.match_score);
    res.json({ matches });
  } catch (err) {
    console.error('AI match route error:', err.message);
    res.status(500).json({ error: 'AI match route failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// ✅ CORS Setup using env whitelist
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(bodyParser.json());

// ✅ PostgreSQL Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ Hugging Face Scoring Function
async function getSimilarityScore(text1, text2) {
  const response = await axios.post(
    'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
    {
      inputs: {
        source_sentence: text1,
        sentences: [text2],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
      },
    }
  );
  return response.data[0];
}

// ✅ /api/profile Route
app.post('/api/profile', async (req, res) => {
  const { user_id, skills, interests, city } = req.body;

  if (!user_id || !skills || !interests || !city) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO profiles (user_id, skills, interests, city) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, JSON.stringify(skills), JSON.stringify(interests), city]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting profile:', err);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// ✅ /api/match/ai/:userId Route
app.get('/api/match/ai/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const { rows: allProfiles } = await pool.query('SELECT * FROM profiles');
    const targetUser = allProfiles.find(p => p.user_id == userId);

    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const scores = [];

    for (const profile of allProfiles) {
      if (profile.user_id == userId) continue;

      const input1 = `${targetUser.skills} ${targetUser.interests}`;
      const input2 = `${profile.skills} ${profile.interests}`;

      const score = await getSimilarityScore(input1, input2);
      scores.push({ ...profile, match_score: score });
    }

    scores.sort((a, b) => b.match_score - a.match_score);
    res.json(scores.slice(0, 5)); // Top 5 matches
  } catch (err) {
    console.error('Error matching:', err);
    res.status(500).json({ error: 'Matching failed' });
  }
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

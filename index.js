const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const port = 3001;

// 🔐 CORS FIX
const cors = require('cors');


// 🔧 CORS FIX FOR RENDER
const corsOptions = {
  origin: ['http://localhost:5173', 'https://my-auth-app-qdbi.onrender.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// 🔌 DB Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// 🧠 Hugging Face scoring
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
  return response.data[0]; // returns similarity score
}

// 📝 Profile creation
app.post('/api/profile', async (req, res) => {
  try {
    const { user_id, skills, interests, city } = req.body;

    const result = await pool.query(
      'INSERT INTO profiles (user_id, skills, interests, city) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, skills, interests, city]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🤝 Matchmaking logic
app.get('/api/match/ai/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const { rows: allProfiles } = await pool.query('SELECT * FROM profiles');
    const targetUser = allProfiles.find(p => p.user_id === userId);

    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const scores = [];

    for (const profile of allProfiles) {
      if (profile.user_id === userId) continue;

      const input1 = `${targetUser.skills} ${targetUser.interests}`;
      const input2 = `${profile.skills} ${profile.interests}`;

      const score = await getSimilarityScore(input1, input2);
      scores.push({ profile, score });
    }

    scores.sort((a, b) => b.score - a.score);
    const topMatches = scores.slice(0, 5).map(item => item.profile);

    res.json(topMatches);
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🟢 Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

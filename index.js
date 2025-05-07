import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import aiMatch from './utils.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS config
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json());

// Database setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // only for development; remove for production with cert
  },
});

// Routes
app.post('/api/profile', async (req, res) => {
  const { user_id, skills, interests, city } = req.body;

  if (!user_id || !skills || !interests || !city) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const query = `
      INSERT INTO profiles (user_id, skills, interests, city)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [
      user_id,
      JSON.stringify(skills),
      JSON.stringify(interests),
      city,
    ];

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting profile:', err);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

app.get('/api/match/ai/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const allUsers = await pool.query('SELECT * FROM profiles WHERE user_id != $1', [userId]);
    const currentUser = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);

    if (currentUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const matches = await aiMatch(currentUser.rows[0], allUsers.rows);
    res.json(matches);
  } catch (err) {
    console.error('Match error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.send('Server is up and running 🚀');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

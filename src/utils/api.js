// src/utils/api.js

const BASE_URL = 'https://my-auth-app-qdbi.onrender.com'; // 🔁 your Render backend URL

export const createProfile = async (data) => {
  const res = await fetch(`${BASE_URL}/api/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create profile');
  return res.json();
};

export const fetchMatches = async (userId) => {
  const res = await fetch(`${BASE_URL}/api/match/ai/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch matches');
  return res.json();
};

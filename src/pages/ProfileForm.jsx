import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient'; // adjust the path if needed

export default function ProfileForm() {
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Get current user from Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage('User not logged in.');
      return;
    }

    const body = {
      user_id: user.id,
      skills: skills.split(',').map((s) => s.trim()),
      interests: interests.split(',').map((i) => i.trim()),
      city,
    };

    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      console.log('🔗 API URL being used:', baseUrl);

      const response = await fetch(`${baseUrl}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create profile');
      }

      setMessage('✅ Profile created!');
      navigate(`/match/${user.id}`);
    } catch (err) {
      console.error('❌ Profile creation error:', err);
      setMessage('Something went wrong.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-purple-700 mb-4">
        👤 Create Your Profile
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Skills (comma separated)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="Interests (comma separated)"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
        >
          Continue ➡️
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-purple-800">{message}</p>}
    </div>
  );
}

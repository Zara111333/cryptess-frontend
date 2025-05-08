import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ProfileForm() {
  const [userId, setUserId] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        setUserId(data.user.id);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      user_id: userId, // now it's a UUID string
      skills: skills.split(',').map((s) => s.trim()),
      interests: interests.split(',').map((i) => i.trim()),
      city,
    };

    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create profile');
      }

      setMessage('Profile created!');
      navigate(`/match/${userId}`);
    } catch (err) {
      console.error('❌ Profile creation error:', err);
      setMessage('Something went wrong.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-purple-700 mb-4">👤 Create Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
  <input
  type="text"
  value={userId}
  readOnly
  placeholder="User ID loading..."
  className="w-full px-3 py-2 border rounded bg-gray-100"
/>
  <input
    type="text"
    placeholder="Skills (comma separated)"
    value={skills}
    onChange={(e) => setSkills(e.target.value)}
    required
    className="w-full px-3 py-2 border rounded"
  />
  ...
</form>
        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">
          Continue ➡️
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-purple-800">{message}</p>}
    </div>
  );
}

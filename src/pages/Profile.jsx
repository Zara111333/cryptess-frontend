import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function Profile() {
  const { id } = useParams(); // This is the user ID from the route
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const handleCreateProfile = async () => {
    try {
      const res = await fetch('https://my-auth-app-qdbi.onrender.com/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(id),
          skills: skills.split(',').map(s => s.trim()),
          interests: interests.split(',').map(i => i.trim()),
          city,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Profile created!');
        navigate(`/match/${id}`);
      } else {
        alert(data.error || 'Profile creation failed');
      }
    } catch (err) {
      console.error('Profile creation error:', err);
      alert('Something went wrong');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4 text-purple-700">Complete Your Profile</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Skills (comma separated)</label>
        <input
          type="text"
          value={skills}
          onChange={e => setSkills(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mt-1"
          placeholder="e.g. tech, education"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Interests (comma separated)</label>
        <input
          type="text"
          value={interests}
          onChange={e => setInterests(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mt-1"
          placeholder="e.g. refugees, children"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">City</label>
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mt-1"
          placeholder="e.g. Amsterdam"
        />
      </div>
      <button
        onClick={handleCreateProfile}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
      >
        Continue
      </button>
    </div>
  );
}

export default Profile;

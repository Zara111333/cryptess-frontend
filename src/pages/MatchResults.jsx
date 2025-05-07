import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function MatchResults() {
  const { userId } = useParams();
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/match/ai/${userId}`);

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to fetch matches');
        }

        const data = await response.json();
        setMatches(data);
      } catch (err) {
        console.error('Fetch matches error:', err);
        setError('Something went wrong. Please check the console.');
      }
    };

    if (userId) fetchMatches();
  }, [userId]);

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">
        💜 Match Results
      </h2>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {matches.length > 0 ? (
        <ul className="space-y-4">
          {matches.map((match) => (
            <li key={match.user_id} className="p-4 border rounded shadow-sm">
              <p><strong>User ID:</strong> {match.user_id}</p>
              <p><strong>Skills:</strong> {Array.isArray(match.skills) ? match.skills.join(', ') : match.skills}</p>
              <p><strong>Interests:</strong> {Array.isArray(match.interests) ? match.interests.join(', ') : match.interests}</p>
              <p><strong>City:</strong> {match.city}</p>
            </li>
          ))}
        </ul>
      ) : (
        !error && <p className="text-center text-gray-600">No matches found yet.</p>
      )}
    </div>
  );
}

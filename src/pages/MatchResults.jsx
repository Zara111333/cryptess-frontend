import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

function MatchResults() {
  const { id } = useParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://my-auth-app-qdbi.onrender.com/api/match/ai/${id}`)
      .then(res => res.json())
      .then(data => {
        setMatches(data.matches || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch matches:', err);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-10">
      <h2 className="text-2xl font-bold text-purple-700 mb-6">Your Matches</h2>

      {loading ? (
        <p className="text-gray-600">Loading matches...</p>
      ) : matches.length === 0 ? (
        <p className="text-gray-600">No matches found yet.</p>
      ) : (
        <ul className="space-y-4">
          {matches.map((match, index) => (
            <li key={index} className="border border-purple-200 p-4 rounded-md bg-purple-50">
              <p><strong>User ID:</strong> {match.user_id}</p>
              <p><strong>Match Score:</strong> {match.match_score}</p>
              <p><strong>Same City:</strong> {match.shared_city ? '✅' : '❌'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MatchResults;

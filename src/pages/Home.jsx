import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Cryptess</h1>
      <Link
        to="/signup"
        className="text-purple-700 underline font-medium"
      >
        Go to Sign Up
      </Link>
    </div>
  );
}


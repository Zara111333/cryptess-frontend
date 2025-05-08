import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import ProfileForm from './pages/ProfileForm.jsx';
import MatchResults from './pages/MatchResults.jsx';

export default function App() {
  return (
    <Router>
      <div className="font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<ProfileForm />} />
          <Route path="/match/:userId" element={<MatchResults />} />
        </Routes>
      </div>
    </Router>
  );
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './homepg';
import Login from './LoginPage';
import MoodTracker from './dashboard';
import Signup from './signup'; // ✅ Import Signup page
import Profile from './profile';
import Moodboard from './Moodboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />  {/* ✅ Added Signup Route */}
        <Route path='/login/dash' element={<MoodTracker />} />
        <Route path="/moodboard" element={<Moodboard />} />
      </Routes>
    </Router>
  );
};

export default App;

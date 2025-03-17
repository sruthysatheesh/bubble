import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './homepg';
import Login from './LoginPage';
import MoodTracker from './dashboard';
import Signup from './signup'; // ✅ Import Signup page
import Profile from './profile';
import Moodboard from './Moodboard';
import Calendar from './calendar';
import Friends from './Friends';
import Chat from './Chat';
import MyChats from './MyChats';
import Forum from './Forum';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} /> {/* ✅ Added Signup Route */}
        <Route path='/dashboard/:userId' element={<MoodTracker />} /> {/* Updated Dynamic Route */}
        <Route path='/moodboard' element={<Moodboard />} />
        <Route path='/profile/:userId' element={<Profile />} /> {/* Added Profile Route */}
        <Route path='/calendar/:userId' element={<Calendar />} />
        <Route path='/friends/:userId' element={<Friends />} />
        <Route path='/chat/:userId' element={<Chat />} />
        <Route path='/mychats/:userId' element={<MyChats />} />
        <Route path='/forums/:userId' element={<Forum />} />
        {/* Optional: Add a 404 route for unmatched paths */}
        <Route path='*' element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;
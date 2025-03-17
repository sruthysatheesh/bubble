import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import "./MoodTracker.css";

const MoodTracker = () => {
  const [mood, setMood] = useState("Good");
  const [note, setNote] = useState("");
  const [moods, setMoods] = useState(() => JSON.parse(localStorage.getItem("moods")) || {});
  const [message, setMessage] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (moods[today]) {
      setMood(moods[today].mood);
      setMessage(getMoodMessage(moods[today].mood));
    }
  }, [moods]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Retrieve user ID from localStorage
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("User not logged in. Please log in first.");
        navigate("/login"); // Redirect to login page
        return;
    }

    try {
        const response = await axios.post("http://localhost:5000/mood", {
            userId,
            mood,
            note,
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        alert(response.data.message);
        setMessage(getMoodMessage(mood));
    } catch (error) {
        console.error("❌ Error saving mood entry:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Failed to save mood entry");
    }
  };

  const getMoodMessage = (mood) => {
    switch (mood) {
      case "Bad":
        return "Feeling down? You're not alone! Tomorrow is a fresh start! (つ╥﹏╥)つ";
      case "Not Bad":
        return "Hang in there! You're doing great! ( ˶ˆᗜˆ˵ )";
      default:
        return "Awesome! Keep spreading positivity! ⸜(｡˃ ᵕ ˂ )⸝♡";
    }
  };

  const generateCalendar = async () => {
    // ✅ Retrieve user ID from localStorage
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("User not logged in. Please log in first.");
        navigate("/login"); // Redirect to login page
        return [];
    }

    try {
        const response = await axios.get(`http://localhost:5000/mood-entries/${userId}/${currentYear}/${currentMonth + 1}`);
        const moodEntries = response.data;

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="day empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            let moodClass = "day";

            const moodEntry = moodEntries.find((entry) => entry.entry_date === date);
            if (moodEntry) {
                moodClass += moodEntry.mood === "Good" ? " good" : moodEntry.mood === "Not Bad" ? " not-bad" : " bad";
            }

            days.push(
                <motion.div 
                    key={day} 
                    className={moodClass}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                >
                    {day}
                </motion.div>
            );
        }
        return days;
    } catch (error) {
        console.error("❌ Error fetching mood entries:", error.response?.data || error.message);
        return [];
    }
  };

  return (
    <motion.div 
      className="mood-tracker"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Sidebar */}
      <motion.div 
        className="sidebar"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2>Menu</h2>
        <ul>
          <li onClick={() => navigate("/moodboard")}>MoodBoard</li>
          <li onClick={() => {
              const userId = localStorage.getItem("userId");
              if (userId) {
                  navigate(`/calendar/${userId}`); // Use template literals to include the userId
              } else {
                  alert("User not logged in. Please log in first.");
                  navigate("/login"); // Redirect to login if userId is not found
              }
          }}>Calendar</li>

          <li onClick={() => {
              const userId = localStorage.getItem("userId");
              if (userId) {
                  navigate(`/friends/${userId}`); // Use template literals to include the userId
              } else {
                  alert("User not logged in. Please log in first.");
                  navigate("/login"); // Redirect to login if userId is not found
              }
          }}>Find Friends</li>

          <li onClick={() => {
                        const userId = localStorage.getItem("userId");
                        if (userId) {
                            navigate(`/mychats/${userId}`); // Use template literals to include the userId
                        } else {
                            alert("User not logged in. Please log in first.");
                            navigate("/login"); // Redirect to login if userId is not found
                        }
                    }}>Chats</li>

          <li onClick={() => {
                        const userId = localStorage.getItem("userId");
                        if (userId) {
                            navigate(`/forums/${userId}`); // Use template literals to include the userId
                        } else {
                            alert("User not logged in. Please log in first.");
                            navigate("/login"); // Redirect to login if userId is not found
                        }
                    }}>Forums</li>
          <li onClick={() => {
              const userId = localStorage.getItem("userId");
              if (userId) {
                  navigate(`/profile/${userId}`); // Use template literals to include the userId
              } else {
                  alert("User not logged in. Please log in first.");
                  navigate("/login"); // Redirect to login if userId is not found
              }
          }}>Your Profile</li>
          
        </ul>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="main-content"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Mood Input Section */}
        <motion.div 
          className="content"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2>Heyoo! How's your day going? </h2>
          <form onSubmit={handleSubmit}>
            <motion.select 
              value={mood} 
              onChange={(e) => setMood(e.target.value)}
              whileFocus={{ scale: 1.05 }}
            >
              <option value="Good">Good :D</option>
              <option value="Not Bad">Not Bad :|</option>
              <option value="Bad">Bad :/</option>
            </motion.select>
            <p>Go ahead and start Journaling!</p>
            <motion.textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write about your day..."
              whileFocus={{ scale: 1.05 }}
            ></motion.textarea>
            <motion.button 
              type="submit"
              whileHover={{ scale: 1.1, backgroundColor: "#4CAF50", color: "#fff" }}
              whileTap={{ scale: 0.95 }}
            >
              Submit
            </motion.button>
          </form>
          <motion.p 
            id="message"
            key={message}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {message}
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MoodTracker;
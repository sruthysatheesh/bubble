import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedMoods = { ...moods, [today]: { mood, note } };
    setMoods(updatedMoods);
    localStorage.setItem("moods", JSON.stringify(updatedMoods));
    setMessage(getMoodMessage(mood));
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

  const generateCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      let moodClass = "day";

      if (moods[date]) {
        moodClass += moods[date].mood === "Good" ? " good" : moods[date].mood === "Not Bad" ? " not-bad" : " bad";
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
  };

  return (
    <motion.div 
      className="mood-tracker"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
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

        {/* Calendar Section */}
        <motion.div 
          className="calendar-container"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h3>Your Monthly Mood Trend OwO</h3>
          <div className="calendar-header">
            <motion.button 
              onClick={() => setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1))}
              whileHover={{ scale: 1.1 }}
            >
              ◀
            </motion.button>
            <h3>{new Date(currentYear, currentMonth).toLocaleString("default", { month: "long", year: "numeric" })}</h3>
            <motion.button 
              onClick={() => setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1))}
              whileHover={{ scale: 1.1 }}
            >
              ▶
            </motion.button>
          </div>
          <div className="calendar">{generateCalendar()}</div>
        </motion.div>
      </motion.div>

      {/* Floating Emoji Button */}
      <motion.button 
        className="emoji-button" 
        onClick={() => navigate("/moodboard")}
        whileHover={{ scale: 1.2, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        (っᵔ◡ᵔ)っ(˶ᵔ ᵕ ᵔ˶) <br></br>
        MoodBoard!
      </motion.button>
    </motion.div>
  );
};

export default MoodTracker;

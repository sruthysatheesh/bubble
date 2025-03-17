import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import "./calendar.css";

const Calendar = () => {
  const { userId } = useParams();
  const [moods, setMoods] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (!userId) {
      console.error("❌ No user ID found in URL");
      return;
    }

    const fetchMoodEntries = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/mood-entries/${userId}/${currentYear}/${currentMonth + 1}`
        );
        const moodEntries = response.data;

        const moodData = {};
        moodEntries.forEach((entry) => {
          const date = entry.entry_date.split("T")[0];
          moodData[date] = { mood: entry.mood, note: entry.note };
        });

        setMoods(moodData);
      } catch (error) {
        console.error("❌ Error fetching mood entries:", error.response?.data || error.message);
      }
    };

    fetchMoodEntries();
  }, [userId, currentYear, currentMonth]);

  const generateCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const moodData = moods[date];
      let moodClass = "day";

      if (moodData) {
        switch (moodData.mood) {
          case "Good":
            moodClass += " good";
            break;
          case "Not Bad":
            moodClass += " not-bad";
            break;
          case "Bad":
            moodClass += " bad";
            break;
          default:
            break;
        }
      }

      days.push(
        <motion.div
          key={day}
          className={moodClass}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            console.log("Selected Date:", date); // Debugging log
            console.log("Mood Data for Selected Date:", moods[date]); // Debugging log
            setSelectedDate(date);
          }}
        >
          {day}
        </motion.div>
      );
    }
    return days;
  };

  return (
    <div className="parent-container">
      {/* Calendar Container */}
      <motion.div
        className="calendar-container"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2>Your Monthly Mood Trend OwO</h2>
        <div className="calendar-header">
          <motion.button
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear((prev) => prev - 1);
              } else {
                setCurrentMonth((prev) => prev - 1);
              }
            }}
            whileHover={{ scale: 1.1 }}
          >
            ◀
          </motion.button>
          <h3>
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <motion.button
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear((prev) => prev + 1);
              } else {
                setCurrentMonth((prev) => prev + 1);
              }
            }}
            whileHover={{ scale: 1.1 }}
          >
            ▶
          </motion.button>
        </div>
        <div className="calendar">{generateCalendar()}</div>
      </motion.div>

      {/* Details Container */}
      <motion.div
        className="details-container"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {selectedDate && moods[selectedDate] ? (
          <>
            <h3>Details for {selectedDate}</h3>
            <p>
              <strong>Mood:</strong> {moods[selectedDate].mood}
            </p>
            <p>
              <strong>Note:</strong> {moods[selectedDate].note || "No note entered"}
            </p>
            <button onClick={() => setSelectedDate(null)}>Close</button>
          </>
        ) : (
          <p>Select a date to view details.</p>
        )}
      </motion.div>
    </div>
  );
};

export default Calendar;
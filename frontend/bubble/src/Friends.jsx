import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import "./Friends.css";

const Friends = () => {
  const [matchedUsers, setMatchedUsers] = useState([]); // State to store matched users
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to handle errors
  const navigate = useNavigate();

  // Fetch matched users with similar or overcome problems
  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("User not logged in. Please log in first.");
      navigate("/login");
      return;
    }

    const fetchMatchedUsers = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/users/match/${userId}`);
        setMatchedUsers(response.data);
      } catch (error) {
        console.error("❌ Error fetching matched users:", error.response?.data || error.message);
        setError("Failed to fetch matched users");
      } finally {
        setLoading(false);
      }
    };

    fetchMatchedUsers();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <motion.div 
      className="friends-container"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <h2>Find Friends with Similar Experiences</h2>
      <div className="friends-list">
        {matchedUsers.length > 0 ? (
          matchedUsers.map((user) => (
            <motion.div 
              key={user.id} 
              className="friend-card"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <h3>{user.username}</h3>
              <p><strong>Bio:</strong> {user.bio || "No bio provided"}</p>
              <p><strong>Interests:</strong> {user.interests || "No interests provided"}</p>
              <p><strong>Problems:</strong> {user.userproblems || "No problems shared"}</p>
              <p><strong>Overcome Problems:</strong> {user.overcomed_problems || "No overcome problems shared"}</p>
              <button onClick={() => navigate(`/profile/${user.id}`)}>View Profile</button>
            </motion.div>
          ))
        ) : (
          <p>No users found with similar problems.</p>
        )}
      </div>
    </motion.div>
  );
};

export default Friends;
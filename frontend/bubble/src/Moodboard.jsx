import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Moodboard.css";

const Moodboard = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch users with matching problems from backend
    fetch("/api/matching-users") // Update with your API endpoint
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  return (
    <div className="moodboard">
      <h2>Find Friends with Similar Experiences </h2>
      <div className="user-list">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="user-card">
              <h3>{user.username}</h3>
              <p>Problem: {user.problem}</p>
              <p>Status: {user.status}</p>
            </div>
          ))
        ) : (
          <p>No matching users found.</p>
        )}
      </div>
      <button className="back-button" onClick={() => navigate("/")}>🔙</button>
    </div>
  );
};

export default Moodboard;

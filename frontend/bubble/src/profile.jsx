import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ Add useNavigate
import axios from "axios";
import "./Profile.css";

const Profile = () => {
  const { userId } = useParams(); // ✅ Extract user ID from the URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // ✅ Use navigate for redirection

  useEffect(() => {
    if (!userId) {
      console.error("❌ No user ID found in URL");
      setError("No user ID found in URL");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/profile/${userId}`);
        if (response.data) {
          setUser(response.data);
        } else {
          setError("User not found");
        }
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
        setError("Failed to fetch profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="profile-container">
      <h1>{user.username}'s Profile</h1>
      <div className="profile-details">
        <p><strong>Email:</strong> {user.email || "Not provided"}</p>
        <p><strong>Bio:</strong> {user.bio || "Not provided"}</p>
        <p><strong>Mood:</strong> {user.mood || "Not set"}</p>
        <p><strong>Streak:</strong> {user.streak || "0"}</p>
        <p><strong>Badges:</strong> {user.badges || "None"}</p>
        <p><strong>Interests:</strong> {user.interests || "None"}</p>
        <p><strong>Problems:</strong> {user.userproblems || "None"}</p>
        <p><strong>Overcome Problems:</strong> {user.overcomed_problems || "None"}</p>
      </div>

      {/* Chat Button */}
      <button 
        className="chat-button"
        onClick={() => navigate(`/chat/${userId}`)} // Navigate to the chat page
      >
        Chat with {user.username}
      </button>
    </div>
  );
};

export default Profile;
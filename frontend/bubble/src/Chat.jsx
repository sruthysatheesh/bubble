import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import * as jwtDecode from "jwt-decode"; // Correct import
import "./Chat.css";

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to refresh the access token
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      console.error("❌ No refresh token found. Please log in.");
      setError("No refresh token found. Please log in.");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      navigate("/login"); // Redirect to login
      return null;
    }

    try {
      const response = await axios.post("http://localhost:5000/refresh-token", { refreshToken });
      localStorage.setItem("token", response.data.accessToken); // Save the new access token
      console.log("New access token saved:", response.data.accessToken);
      return response.data.accessToken;
    } catch (error) {
      console.error("❌ Error refreshing token:", error.response?.data || error.message);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setError("Session expired. Please log in again.");
      navigate("/login"); // Redirect to login
      return null;
    }
  };

  // Fetch chat messages
  useEffect(() => {
    const fetchChatMessages = async () => {
      const token = localStorage.getItem("token");

      // Check if the token exists
      if (!token) {
        console.error("❌ No token found. Please log in.");
        setError("No token found. Please log in.");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        navigate("/login"); // Redirect to login
        setLoading(false);
        return;
      }

      console.log("Token retrieved from localStorage:", token);

      // Validate the token format
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.error("❌ Invalid token format.");
        setError("Invalid token format. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        navigate("/login"); // Redirect to login
        setLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode.jwtDecode(token); // Decode the token
        if (decodedToken.exp * 1000 < Date.now()) {
          // Token is expired, try to refresh it
          const newAccessToken = await refreshAccessToken();
          if (!newAccessToken) {
            setLoading(false);
            return;
          }
        }

        const response = await axios.get(`http://localhost:5000/chat/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setMessages(response.data);
      } catch (error) {
        console.error("❌ Error fetching chat messages:", error.response?.data || error.message);
        setError("Failed to fetch chat messages");
      } finally {
        setLoading(false);
      }
    };

    fetchChatMessages();
  }, [userId, navigate]);

  // Send a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/chat/${userId}`,
        { message: newMessage },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessages([...messages, response.data]);
      setNewMessage("");
    } catch (error) {
      console.error("❌ Error sending message:", error.response?.data || error.message);
      alert("Failed to send message");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="chat-container">
      <h2>Chat with User</h2>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <p><strong>{msg.sender}:</strong> {msg.text}</p>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
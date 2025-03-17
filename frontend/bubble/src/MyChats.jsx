import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyChats = ({ currentUserId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`/api/messages?userId=${currentUserId}`);
        setChats(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [currentUserId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>My Chats</h1>
      {chats.length > 0 ? (
        <ul>
          {chats.map((chat) => (
            <li key={chat.id}>
              <strong>{chat.sender_id === currentUserId ? 'You' : `User ${chat.sender_id}`}:</strong>
              <p>{chat.text}</p>
              <small>{new Date(chat.timestamp).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p>No chats found.</p>
      )}
    </div>
  );
};

export default MyChats;
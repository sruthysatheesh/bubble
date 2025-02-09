import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";  // ✅ Get user ID from URL
import axios from "axios";

const Profile = () => {
    const { id } = useParams();  // ✅ Extract user ID from the URL
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            console.error("❌ No user ID found in URL");
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/profile/${id}`);
                setUser(response.data);
                setLoading(false);
            } catch (error) {
                console.error("❌ Error fetching profile:", error);
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (!user) return <p>User not found</p>;

    return (
        <div>
            <h1>{user.username}'s Profile</h1>
            <p>Email: {user.email}</p>
            <p>Mood: {user.mood}</p>
            <p>Streak: {user.streak}</p>
            <p>Badges: {user.badges}</p>
        </div>
    );
};

export default Profile;

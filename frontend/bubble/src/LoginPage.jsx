import './LoginPage.css';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [shake, setShake] = useState(false);

    const handleUser = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:5000/login", { username, password });
            console.log("Login response:", res.data); // Debug the response

            if (res.data.user) {
                const userId = res.data.user.id;

                // ✅ Store user data in localStorage
                localStorage.setItem("token", res.data.token); // Ensure this matches the backend response
                localStorage.setItem("userId", userId);
                localStorage.setItem("username", res.data.user.username);

                setMessage("Login successful");

                // ✅ Redirect to dashboard with dynamic userId
                navigate(`/dashboard/${userId}`); // Pass userId dynamically
            } else {
                setMessage("Login failed! No user data received.");
                setShake(true); // Trigger shake effect on failure
                setTimeout(() => setShake(false), 500);
            }
        } catch (err) {
            console.error("❌ Login Error:", err.response ? err.response.data : err.message);
            setMessage("Invalid credentials");
            setShake(true); // Trigger shake effect on failure
            setTimeout(() => setShake(false), 500);
        }
    };

    return (
        <motion.div 
            className="bosk"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <motion.h1 
                className="login-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                LOGIN {message}
            </motion.h1>

            <motion.form 
                onSubmit={handleUser}
                className={`login-form ${shake ? "shake" : ""}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="uname">
                    <label>Username</label>
                    <motion.input 
                        onChange={(e) => setUsername(e.target.value)}
                        type="text"
                        value={username}
                        required
                        whileFocus={{ scale: 1.05 }}
                    />
                </div>
                <div className="pw">
                    <label>Password</label>
                    <motion.input 
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        value={password}
                        required
                        whileFocus={{ scale: 1.05 }}
                    />
                </div>

                <motion.button 
                    type="submit"
                    whileHover={{ scale: 1.1, backgroundColor: "#4CAF50", color: "#fff" }}
                    whileTap={{ scale: 0.95 }}
                >
                    Login
                </motion.button>
            </motion.form>

            <motion.p 
                className="signup-link"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                Don't have an account? <Link to="/signup">Sign up here</Link>
            </motion.p>
        </motion.div>
    );
}

export default Login;
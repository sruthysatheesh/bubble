import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

const interestsList = ["Anxiety", "Depression", "Stress", "Loneliness", "Self-Improvement"];
const problemsList = ["Financial Issues", "Relationship Problems", "Health Issues", "Career Stress", "Loss of a Loved One"];

function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [problemsOvercome, setProblemsOvercome] = useState([]);
    const navigate = useNavigate();

    const handleSelectChange = (event, setState) => {
        const values = Array.from(event.target.selectedOptions, (option) => option.value);
        setState(values);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/signup", {
                username,
                password,
                interests: selectedInterests,
                userproblems: selectedProblems,
                overcomed_problems: problemsOvercome,
            });
            alert(response.data.message);
            navigate("/login");
        } catch (error) {
            console.error("❌ Signup error:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Signup failed");
        }
    };

    return (
        <div className="signup-wrapper">
            <div className="signup-container">
                <h2>Sign Up</h2>
                <form onSubmit={handleSignup}>
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    
                    <h4>Select Your Interests:</h4>
                    <select multiple value={selectedInterests} onChange={(e) => handleSelectChange(e, setSelectedInterests)}>
                        {interestsList.map((interest) => (
                            <option key={interest} value={interest}>{interest}</option>
                        ))}
                    </select>
                    
                    <h4>What Problems Are You Facing?</h4>
                    <select multiple value={selectedProblems} onChange={(e) => handleSelectChange(e, setSelectedProblems)}>
                        {problemsList.map((problem) => (
                            <option key={problem} value={problem}>{problem}</option>
                        ))}
                    </select>
                    
                    <h4>Problems You've Overcome:</h4>
                    <select multiple value={problemsOvercome} onChange={(e) => handleSelectChange(e, setProblemsOvercome)}>
                        {problemsList.map((problem) => (
                            <option key={problem} value={problem}>{problem}</option>
                        ))}
                    </select>
                    
                    <button type="submit">Sign Up</button>
                </form>
            </div>
        </div>
    );
}

export default Signup;

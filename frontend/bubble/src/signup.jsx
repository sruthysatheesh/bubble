import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

const interestsList = ["Anxiety", "Depression", "Stress", "Loneliness", "Self-Improvement"];
const problemsList = ["Financial Issues", "Relationship Problems", "Health Issues", "Career Stress", "Loss of a Loved One"];

function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [problemsOvercome, setProblemsOvercome] = useState([]);
    const [error, setError] = useState(""); // Error message state
    const navigate = useNavigate();

    const handleSelectChange = (value, setState, state) => {
        if (state.includes(value)) {
            setState(state.filter((item) => item !== value)); // Deselect
        } else {
            setState([...state, value]); // Select
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        if (!username || !password) {
            setError("Username and password are required.");
            return;
        }
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
            setError(error.response?.data?.message || "Signup failed. Please try again.");
        }
    };

    const clearSelections = (setState) => {
        setState([]);
    };

    return (
        <div className="signup-wrapper">
            <div className="signup-container">
                <h2>Sign Up</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSignup}>
                    {/* Left Column */}
                    <div className="form-row">
                        {/* Username Field */}
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="form-row">
                        {/* Interests Dropdown */}
                        <div className="form-group">
                            <label>
                                Select Your Interests ({selectedInterests.length} selected)
                            </label>
                            <div className="custom-dropdown">
                                {interestsList.map((interest) => (
                                    <div
                                        key={interest}
                                        className={`dropdown-option ${
                                            selectedInterests.includes(interest) ? "selected" : ""
                                        }`}
                                        onClick={() =>
                                            handleSelectChange(interest, setSelectedInterests, selectedInterests)
                                        }
                                    >
                                        {interest}
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="clear-button"
                                onClick={() => clearSelections(setSelectedInterests)}
                            >
                                Clear Selections
                            </button>
                        </div>

                        {/* Problems Dropdown */}
                        <div className="form-group">
                            <label>
                                What Problems Are You Facing? ({selectedProblems.length} selected)
                            </label>
                            <div className="custom-dropdown">
                                {problemsList.map((problem) => (
                                    <div
                                        key={problem}
                                        className={`dropdown-option ${
                                            selectedProblems.includes(problem) ? "selected" : ""
                                        }`}
                                        onClick={() =>
                                            handleSelectChange(problem, setSelectedProblems, selectedProblems)
                                        }
                                    >
                                        {problem}
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="clear-button"
                                onClick={() => clearSelections(setSelectedProblems)}
                            >
                                Clear Selections
                            </button>
                        </div>

                        {/* Problems Overcome Dropdown */}
                        <div className="form-group">
                            <label>
                                Problems You've Overcome ({problemsOvercome.length} selected)
                            </label>
                            <div className="custom-dropdown">
                                {problemsList.map((problem) => (
                                    <div
                                        key={problem}
                                        className={`dropdown-option ${
                                            problemsOvercome.includes(problem) ? "selected" : ""
                                        }`}
                                        onClick={() =>
                                            handleSelectChange(problem, setProblemsOvercome, problemsOvercome)
                                        }
                                    >
                                        {problem}
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="clear-button"
                                onClick={() => clearSelections(setProblemsOvercome)}
                            >
                                Clear Selections
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="submit-button">
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Signup;
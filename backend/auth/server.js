const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend to call the backend

// Create MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "helloworld",
    database: "tinker",
});

db.connect((err) => {
    if (err) throw err;
    console.log("✅ MySQL connected!");
});

// 🔹 Sign-Up Route
app.post("/signup", (req, res) => {
    console.log("🔹 Signup request received with data:", req.body);

    const { username, password, interests, userproblems, overcomed_problems } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    // Convert arrays to comma-separated strings for MySQL storage
    const interestsStr = interests.join(", ");
    const problemsStr = userproblems.join(", ");
    const problemsOvercomeStr = overcomed_problems.join(", ");

    const sql = "INSERT INTO users (username, password, interests, userproblems, overcomed_problems) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [username, password, interestsStr, problemsStr, problemsOvercomeStr], (err, result) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ message: "Signup failed", error: err.message });
        }
        console.log("✅ User registered successfully:", result);
        res.json({ message: "Signup successful", userId: result.insertId });
    });
});

// 🔹 Login Route
app.post("/login", (req, res) => {
    console.log("🔹 Login request received:", req.body);
    const { username, password } = req.body;

    if (!username || !password) {
        console.log("❌ Missing username or password");
        return res.status(400).json({ message: "Username and password required" });
    }

    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ message: "Database error", error: err.message });
        }

        if (results.length === 0) {
            console.log(`❌ User not found: ${username}`);
            return res.status(404).json({ message: "User not found" });
        }

        const user = results[0];

        if (password.trim() !== user.password.trim()) {
            console.log("❌ Password mismatch");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        console.log("✅ Login successful");
        const token = jwt.sign({ id: user.id, username: user.username }, "your_secret_key", { expiresIn: "1h" });

        res.json({
            message: "Login successful",
            token,
            user: { id: user.id, username: user.username }
        });
    });
});

// 🔹 Get Profile Route
app.get("/profile/:id", (req, res) => {
    const userId = req.params.id;

    console.log(`🔹 Fetching profile for user ID: ${userId}`);

    const sql = "SELECT id, username, email, bio, profile_pic, mood, streak, badges, userproblems, overcomed_problems FROM users WHERE id = ?";

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ message: "Database error", error: err.message });
        }

        if (results.length === 0) {
            console.log(`❌ User with ID ${userId} not found.`);
            return res.status(404).json({ message: "User not found" });
        }

        console.log("✅ Profile data retrieved:", results[0]);
        res.json(results[0]);
    });
});

// 🔹 Fetch Users with Similar or Overcome Problems
app.get("/users/match/:userId", (req, res) => {
    const userId = req.params.userId;

    console.log(`🔹 Fetching users with similar problems for user ID: ${userId}`);

    // Fetch current user's problems and overcome problems
    const userQuery = "SELECT * FROM users WHERE id = ?";

    db.query(userQuery, [userId], (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ message: "Database error", error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const { userproblems, overcomed_problems } = results[0];

        // Convert problems from strings to arrays
        const userProblemsArray = userproblems ? userproblems.split(", ") : [];
        const overcomeProblemsArray = overcomed_problems ? overcomed_problems.split(", ") : [];

        // Query to fetch users with similar problems
        const matchQuery = `
            SELECT id, username, bio, profile_pic FROM users
            WHERE id != ? 
            AND (
                userproblems REGEXP ? 
                OR overcomed_problems REGEXP ?
            )
        `;

        const problemRegex = userProblemsArray.join("|"); // Converts array into regex pattern
        const overcomeRegex = overcomeProblemsArray.join("|");

        db.query(matchQuery, [userId, problemRegex, overcomeRegex], (err, matchedUsers) => {
            if (err) {
                console.error("❌ Error fetching matched users:", err);
                return res.status(500).json({ message: "Error fetching users", error: err.message });
            }

            console.log("✅ Matched users:", matchedUsers);
            res.json(matchedUsers);
        });
    });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

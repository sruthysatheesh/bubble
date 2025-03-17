const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const authenticate = require("./middleware/authenticate"); // Import the middleware

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

    // Generate JWT token and redirect to the dashboard
    const token = jwt.sign({ id: user.id, username: user.username }, "your_secret_key", { expiresIn: "1h" });
    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username },
      redirectUrl: `/dashboard/${user.id}`, // Add redirect URL
    });
  });
});

// 🔹 Save Mood Entry
app.post("/mood", (req, res) => {
  const { userId, mood, note } = req.body;

  console.log("🔹 Saving mood entry with data:", { userId, mood, note });

  if (!userId || !mood) {
    console.log("❌ Missing required fields: userId or mood");
    return res.status(400).json({ message: "User ID and mood are required" });
  }

  const entryDate = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  const sql = `
    INSERT INTO mood_entries (user_id, mood, note, entry_date)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [userId, mood, note, entryDate], (err, result) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ message: "Failed to save mood entry", error: err.message });
    }

    console.log("✅ Mood entry saved:", result);
    res.json({ message: "Mood entry saved successfully", entryId: result.insertId });
  });
});

// 🔹 Get Mood Entries for a Specific User and Month
app.get("/mood-entries/:userId/:year/:month", (req, res) => {
  const { userId, year, month } = req.params;

  if (!userId || !year || !month) {
    return res.status(400).json({ message: "User ID, year, and month are required" });
  }

  const sql = `
    SELECT id, mood, note, entry_date
    FROM mood_entries
    WHERE user_id = ?
    AND YEAR(entry_date) = ?
    AND MONTH(entry_date) = ?
  `;

  db.query(sql, [userId, year, month], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ message: "Failed to fetch mood entries", error: err.message });
    }

    console.log("✅ Mood entries fetched:", results);
    res.json(results);
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
      SELECT id, username, bio, profile_pic, interests, userproblems, overcomed_problems 
      FROM users
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

// 🔹 Dashboard Route
app.get("/dashboard/:userId", (req, res) => {
  const userId = req.params.userId;

  console.log(`🔹 Fetching dashboard data for user ID: ${userId}`);

  // Fetch user data from the database
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

    const user = results[0];

    // Redirect to the dashboard with user data
    res.json({
      message: "Dashboard data retrieved successfully",
      user,
    });
  });
});

// 🔹 Fetch Chat Messages
app.get("/chat/:userId", authenticate, (req, res) => {
  const userId = req.params.userId;

  console.log(`🔹 Fetching chat messages for user ID: ${userId}`);

  const sql = "SELECT * FROM messages WHERE receiver_id = ? OR sender_id = ? ORDER BY timestamp ASC";

  db.query(sql, [userId, userId], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ message: "Database error", error: err.message });
    }

    console.log("✅ Chat messages fetched:", results);
    res.json(results);
  });
});

// 🔹 Fetch All Messages for a User
app.get("/api/messages", async (req, res) => {
  const { userId } = req.query;

  try {
    const query = `
      SELECT * FROM messages
      WHERE sender_id = ? OR receiver_id = ?
      ORDER BY timestamp DESC
    `;
    const [messages] = await db.promise().query(query, [userId, userId]);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Create a Forum Post
// 🔹 Create a Forum Post
app.post("/forum/post", authenticate, (req, res) => {
    const { userId, topic, content } = req.body;
  
    if (!userId || !topic || !content) {
      return res.status(400).json({ message: "User ID, topic, and content are required" });
    }
  
    const sql = `
      INSERT INTO forum_posts (user_id, topic, content)
      VALUES (?, ?, ?)
    `;
  
    db.query(sql, [userId, topic, content], (err, result) => {
      if (err) {
        console.error("❌ Database error:", err);
        return res.status(500).json({ message: "Failed to create forum post", error: err.message });
      }
  
      console.log("✅ Forum post created:", result);
      res.json({ message: "Forum post created successfully", postId: result.insertId });
    });
  });

  // 🔹 Fetch Forum Posts by Topic
app.get("/forum/posts/:topic", (req, res) => {
    const { topic } = req.params;
  
    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }
  
    const sql = `
      SELECT fp.id, fp.topic, fp.content, fp.created_at, u.username, u.profile_pic
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      WHERE fp.topic = ?
      ORDER BY fp.created_at DESC
    `;
  
    db.query(sql, [topic], (err, results) => {
      if (err) {
        console.error("❌ Database error:", err);
        return res.status(500).json({ message: "Failed to fetch forum posts", error: err.message });
      }
  
      console.log("✅ Forum posts fetched:", results);
      res.json(results);
    });
  });

  // 🔹 Add a Comment to a Forum Post
app.post("/forum/post/comment", authenticate, (req, res) => {
    const { postId, userId, comment } = req.body;
  
    if (!postId || !userId || !comment) {
      return res.status(400).json({ message: "Post ID, user ID, and comment are required" });
    }
  
    const sql = `
      INSERT INTO forum_comments (post_id, user_id, comment)
      VALUES (?, ?, ?)
    `;
  
    db.query(sql, [postId, userId, comment], (err, result) => {
      if (err) {
        console.error("❌ Database error:", err);
        return res.status(500).json({ message: "Failed to add comment", error: err.message });
      }
  
      console.log("✅ Comment added:", result);
      res.json({ message: "Comment added successfully", commentId: result.insertId });
    });
  });

  // 🔹 Fetch Comments for a Forum Post
app.get("/forum/post/comments/:postId", (req, res) => {
    const { postId } = req.params;
  
    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }
  
    const sql = `
      SELECT fc.id, fc.comment, fc.created_at, u.username, u.profile_pic
      FROM forum_comments fc
      JOIN users u ON fc.user_id = u.id
      WHERE fc.post_id = ?
      ORDER BY fc.created_at ASC
    `;
  
    db.query(sql, [postId], (err, results) => {
      if (err) {
        console.error("❌ Database error:", err);
        return res.status(500).json({ message: "Failed to fetch comments", error: err.message });
      }
  
      console.log("✅ Comments fetched:", results);
      res.json(results);
    });
  });

// 🔹 Send Chat Message
app.post("/chat/:userId", authenticate, (req, res) => {
  const userId = req.params.userId;
  const { message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ message: "User ID and message are required" });
  }

  const senderId = req.user.id; // Get the sender ID from the authenticated user
  const sql = "INSERT INTO messages (sender_id, receiver_id, text) VALUES (?, ?, ?)";

  db.query(sql, [senderId, userId, message], (err, result) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ message: "Failed to send message", error: err.message });
    }

    console.log("✅ Message sent:", result);
    res.json({ sender: senderId, text: message });
  });
});

// 🔹 Update Profile Route
app.put("/profile/:userId", (req, res) => {
  const userId = req.params.userId;
  const { email, bio, interests, userproblems, overcomed_problems } = req.body;

  console.log(`🔹 Updating profile for user ID: ${userId}`);

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const sql = `
    UPDATE users
    SET email = ?, bio = ?, interests = ?, userproblems = ?, overcomed_problems = ?
    WHERE id = ?
  `;

  db.query(sql, [email, bio, interests, userproblems, overcomed_problems, userId], (err, result) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ message: "Failed to update profile", error: err.message });
    }

    if (result.affectedRows === 0) {
      console.log(`❌ User with ID ${userId} not found.`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Profile updated successfully:", result);
    res.json({ message: "Profile updated successfully" });
  });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const authenticate = require("./middleware/authenticate");
require('dotenv').config();

const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db;

async function connectToMongoDB() {
  try {
    await client.connect();
    db = client.db("tinker");
    console.log("✅ MongoDB connected!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

connectToMongoDB();

// 🔹 Sign-Up Route
app.post("/signup", async (req, res) => {
  console.log("🔹 Signup request received with data:", req.body);

  const { username, password, interests, userproblems, overcomed_problems } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const usersCollection = db.collection("users");
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const newUser = {
      username,
      password,
      interests: interests || [],
      userproblems: userproblems || [],
      overcomed_problems: overcomed_problems || [],
      createdAt: new Date(),
      streak: 0,
      badges: [],
      mood: null,
      bio: "",
      profile_pic: ""
    };

    const result = await usersCollection.insertOne(newUser);
    console.log("✅ User registered successfully:", result.insertedId);
    
    res.json({ 
      message: "Signup successful", 
      userId: result.insertedId 
    });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

// 🔹 Login Route
app.post("/login", async (req, res) => {
  console.log("🔹 Login request received:", req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    console.log("❌ Missing username or password");
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ username });

    if (!user) {
      console.log(`❌ User not found: ${username}`);
      return res.status(404).json({ message: "User not found" });
    }

    if (password.trim() !== user.password.trim()) {
      console.log("❌ Password mismatch");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("✅ Login successful");

    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, "your_secret_key", { expiresIn: "1h" });
    
    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username },
      redirectUrl: `/dashboard/${user._id}`,
    });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// 🔹 Save Mood Entry
app.post("/mood", async (req, res) => {
  const { userId, mood, note } = req.body;

  console.log("🔹 Saving mood entry with data:", { userId, mood, note });

  if (!userId || !mood) {
    console.log("❌ Missing required fields: userId or mood");
    return res.status(400).json({ message: "User ID and mood are required" });
  }

  try {
    const moodEntriesCollection = db.collection("moodEntries");
    const entryDate = new Date();

    const newEntry = {
      user_id: new ObjectId(userId),
      mood,
      note: note || "",
      entry_date: entryDate,
      createdAt: new Date()
    };

    const result = await moodEntriesCollection.insertOne(newEntry);
    console.log("✅ Mood entry saved:", result.insertedId);

    // Update user's current mood
    const usersCollection = db.collection("users");
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { mood } }
    );

    res.json({ 
      message: "Mood entry saved successfully", 
      entryId: result.insertedId 
    });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ message: "Failed to save mood entry", error: err.message });
  }
});

// 🔹 Get Mood Entries for a Specific User and Month
app.get("/mood-entries/:userId/:year/:month", async (req, res) => {
  const { userId, year, month } = req.params;

  if (!userId || !year || !month) {
    return res.status(400).json({ message: "User ID, year, and month are required" });
  }

  try {
    const moodEntriesCollection = db.collection("moodEntries");
    
    // Create start and end dates for the month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    
    const entries = await moodEntriesCollection.find({
      user_id: new ObjectId(userId),
      entry_date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ entry_date: 1 }).toArray();

    console.log("✅ Mood entries fetched:", entries.length);
    res.json(entries);
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ message: "Failed to fetch mood entries", error: err.message });
  }
});

// 🔹 Get Profile Route
app.get("/profile/:id", async (req, res) => {
  const userId = req.params.id;

  console.log(`🔹 Fetching profile for user ID: ${userId}`);

  try {
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ 
      _id: new ObjectId(userId) 
    }, {
      projection: {
        password: 0 // Exclude password from the response
      }
    });

    if (!user) {
      console.log(`❌ User with ID ${userId} not found.`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Profile data retrieved:", user);
    res.json(user);
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// 🔹 Fetch Users with Similar or Overcome Problems
app.get("/users/match/:userId", async (req, res) => {
  const userId = req.params.userId;

  console.log(`🔹 Fetching users with similar problems for user ID: ${userId}`);

  try {
    const usersCollection = db.collection("users");
    
    // First get the current user's data
    const currentUser = await usersCollection.findOne({ 
      _id: new ObjectId(userId) 
    });

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProblems = currentUser.userproblems || [];
    const overcomeProblems = currentUser.overcomed_problems || [];

    // Find users who have at least one matching problem
    const matchedUsers = await usersCollection.find({
      _id: { $ne: new ObjectId(userId) },
      $or: [
        { userproblems: { $in: userProblems } },
        { overcomed_problems: { $in: overcomeProblems } }
      ]
    }).project({
      password: 0,
      email: 0
    }).toArray();

    console.log("✅ Matched users:", matchedUsers.length);
    res.json(matchedUsers);
  } catch (err) {
    console.error("❌ Error fetching matched users:", err);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

// 🔹 Dashboard Route
app.get("/dashboard/:userId", async (req, res) => {
  const userId = req.params.userId;

  console.log(`🔹 Fetching dashboard data for user ID: ${userId}`);

  try {
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ 
      _id: new ObjectId(userId) 
    }, {
      projection: {
        password: 0 // Exclude password from the response
      }
    });

    if (!user) {
      console.log(`❌ User with ID ${userId} not found.`);
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Dashboard data retrieved successfully",
      user,
    });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// 🔹 Fetch Chat Messages
app.get("/chat/:userId", authenticate, async (req, res) => {
  const userId = req.params.userId;

  console.log(`🔹 Fetching chat messages for user ID: ${userId}`);

  try {
    const messagesCollection = db.collection("messages");
    const messages = await messagesCollection.find({
      $or: [
        { receiver_id: new ObjectId(userId) },
        { sender_id: new ObjectId(userId) }
      ]
    }).sort({ timestamp: 1 }).toArray();

    console.log("✅ Chat messages fetched:", messages.length);
    res.json(messages);
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// 🔹 Fetch All Messages for a User
app.get("/api/messages", async (req, res) => {
  const { userId } = req.query;

  try {
    const messagesCollection = db.collection("messages");
    const messages = await messagesCollection.find({
      $or: [
        { sender_id: new ObjectId(userId) },
        { receiver_id: new ObjectId(userId) }
      ]
    }).sort({ timestamp: -1 }).toArray();

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Create a Forum Post
app.post("/forum/post", authenticate, async (req, res) => {
  const { userId, topic, content } = req.body;

  if (!userId || !topic || !content) {
    return res.status(400).json({ message: "User ID, topic, and content are required" });
  }

  try {
    const forumPostsCollection = db.collection("forumPosts");
    
    const newPost = {
      user_id: new ObjectId(userId),
      topic,
      content,
      created_at: new Date(),
      updated_at: new Date(),
      comments: []
    };

    const result = await forumPostsCollection.insertOne(newPost);
    console.log("✅ Forum post created:", result.insertedId);
    
    res.json({ 
      message: "Forum post created successfully", 
      postId: result.insertedId 
    });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ message: "Failed to create forum post", error: err.message });
  }
});

// 🔹 Fetch Forum Posts by Topic
app.get("/forum/posts/:topic", async (req, res) => {
  const { topic } = req.params;

  if (!topic) {
    return res.status(400).json({ message: "Topic is required" });
  }

  try {
    const forumPostsCollection = db.collection("forumPosts");
    const usersCollection = db.collection("users");
    
    // Find posts by topic and join with users collection
    const posts = await forumPostsCollection.aggregate([
      { $match: { topic } },
      { $sort: { created_at: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          id: "$_id",
          topic: 1,
          content: 1,
          created_at: 1,
          "username": "$user.username",
          "profile_pic": "$user.profile_pic"
        }
      }
    ]).toArray();

    console.log("✅ Forum posts fetched:", posts.length);
    res.json(posts);
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ message: "Failed to fetch forum posts", error: err.message });
  }
});

// 🔹 Add a Comment to a Forum Post
app.post("/forum/post/comment", authenticate, async (req, res) => {
  const { postId, userId, comment } = req.body;

  if (!postId || !userId || !comment) {
    return res.status(400).json({ message: "Post ID, user ID, and comment are required" });
  }

  try {
    const forumPostsCollection = db.collection("forumPosts");
    
    const newComment = {
      _id: new ObjectId(),
      user_id: new ObjectId(userId),
      comment,
      created_at: new Date()
    };

    const result = await forumPostsCollection.updateOne(
      { _id: new ObjectId(postId) },
      { $push: { comments: newComment } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    console.log("✅ Comment added:", newComment._id);
    res.json({ 
      message: "Comment added successfully", 
      commentId: newComment._id 
    });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ message: "Failed to add comment", error: err.message });
  }
});

// 🔹 Fetch Comments for a Forum Post
app.get("/forum/post/comments/:postId", async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  try {
    const forumPostsCollection = db.collection("forumPosts");
    const usersCollection = db.collection("users");
    
    // Get the post with its comments and user info for each comment
    const post = await forumPostsCollection.aggregate([
      { $match: { _id: new ObjectId(postId) } },
      { $unwind: "$comments" },
      {
        $lookup: {
          from: "users",
          localField: "comments.user_id",
          foreignField: "_id",
          as: "commentUser"
        }
      },
      { $unwind: "$commentUser" },
      {
        $group: {
          _id: "$_id",
          comments: {
            $push: {
              id: "$comments._id",
              comment: "$comments.comment",
              created_at: "$comments.created_at",
              username: "$commentUser.username",
              profile_pic: "$commentUser.profile_pic"
            }
          }
        }
      },
      {
        $project: {
          comments: {
            $sortArray: {
              input: "$comments",
              sortBy: { created_at: 1 }
            }
          }
        }
      }
    ]).toArray();

    if (post.length === 0 || !post[0].comments) {
      return res.json([]);
    }

    console.log("✅ Comments fetched:", post[0].comments.length);
    res.json(post[0].comments);
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ message: "Failed to fetch comments", error: err.message });
  }
});

// 🔹 Send Chat Message
app.post("/chat/:userId", authenticate, async (req, res) => {
  const userId = req.params.userId;
  const { message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ message: "User ID and message are required" });
  }

  try {
    const messagesCollection = db.collection("messages");
    const senderId = req.user.id; // From authentication middleware

    const newMessage = {
      sender_id: new ObjectId(senderId),
      receiver_id: new ObjectId(userId),
      text: message,
      timestamp: new Date(),
      read: false
    };

    const result = await messagesCollection.insertOne(newMessage);
    console.log("✅ Message sent:", result.insertedId);
    
    res.json({ 
      sender: senderId, 
      text: message,
      timestamp: newMessage.timestamp
    });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ message: "Failed to send message", error: err.message });
  }
});

// 🔹 Update Profile Route
app.put("/profile/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { email, bio, interests, userproblems, overcomed_problems } = req.body;

  console.log(`🔹 Updating profile for user ID: ${userId}`);

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const usersCollection = db.collection("users");
    
    const updateData = {};
    if (email) updateData.email = email;
    if (bio) updateData.bio = bio;
    if (interests) updateData.interests = interests;
    if (userproblems) updateData.userproblems = userproblems;
    if (overcomed_problems) updateData.overcomed_problems = overcomed_problems;
    
    updateData.updatedAt = new Date();

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      console.log(`❌ User with ID ${userId} not found.`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Profile updated successfully:", result.modifiedCount);
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Close MongoDB connection on process termination
process.on('SIGINT', async () => {
  await client.close();
  process.exit();
});
const express = require("express");
const router = express.Router();
const userModel = require("../models/user.model");

// GET user profile
router.get("/profile/:id", (req, res) => {
    const userId = req.params.id;
    userModel.getUserProfile(userId, (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(user);
    });
});

// POST update mood and streak
router.post("/profile/update-mood", (req, res) => {
    const { userId, mood, streak } = req.body;
    userModel.updateMood(userId, mood, streak, (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Mood and streak updated!" });
    });
});

// POST update badges
router.post("/profile/update-badges", (req, res) => {
    const { userId, badges } = req.body;
    userModel.updateBadges(userId, badges, (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Badges updated!" });
    });
});

module.exports = router;

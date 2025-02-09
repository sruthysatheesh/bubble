const db = require("../config/db.config");

// Get user profile (including mood, streak, and badges)
exports.getUserProfile = (userId, callback) => {
    db.query("SELECT username, profile_picture, bio, mood, streak, badges FROM users WHERE id = ?", [userId], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result[0]);
    });
};

// Update mood and streak
exports.updateMood = (userId, mood, streak, callback) => {
    db.query("UPDATE users SET mood = ?, streak = ? WHERE id = ?", [mood, streak, userId], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

// Update badges
exports.updateBadges = (userId, badges, callback) => {
    db.query("UPDATE users SET badges = ? WHERE id = ?", [JSON.stringify(badges), userId], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const router = express.Router();

/**
 * ✅ Fetch User Preferences (Fixed)
 */
router.post("/preferences", authMiddleware, async (req, res) => {
  try {
    console.log("🔍 Fetching preferences for user:", req.user.id);

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Ensure preferences always return a valid object
    res.json({ preferences: user.preferences || { categories: [], sources: [], country: "us" } });
  } catch (error) {
    console.error("❌ Error fetching preferences:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/preferences", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ preferences: user.preferences });
  } catch (error) {
    console.error("❌ Error fetching preferences:", error.message);
    res.status(500).json({ message: "Failed to retrieve preferences" });
  }
});


/**
 * ✅ Update User Preferences (Fixed)
 */
router.put("/preferences", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from JWT
    const { categories, country, sources } = req.body;

    // ✅ Update user document in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { preferences: { categories, country, sources } },
      { new: true, upsert: true }
    );

    res.json({ message: "Preferences updated successfully", preferences: updatedUser.preferences });
  } catch (error) {
    console.error("❌ Error updating preferences:", error.message);
    res.status(500).json({ message: "Server error while updating preferences" });
  }
});


module.exports = router;

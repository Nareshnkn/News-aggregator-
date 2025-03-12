const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Bookmark = require("../models/Bookmark");

// 🔹 Get user's bookmarked articles
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookmarks = await Bookmark.find({ userId });
    res.json({ bookmarkedArticles: bookmarks });
  } catch (error) {
    console.error("❌ Error fetching bookmarks:", error);
    res.status(500).json({ error: "Failed to fetch bookmarks." });
  }
});

// 🔹 Add a new bookmark (Prevent Duplicates)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { articleId, title, description, url, image } = req.body;
    const userId = req.user.id;

    // 🔍 Validate request data
    if (!articleId || !title || !url) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // ✅ Prevent duplicate bookmarks
    const existingBookmark = await Bookmark.findOne({ userId, articleId });
    if (existingBookmark) {
      return res.status(400).json({ error: "Article already bookmarked." });
    }

    // 🆕 Save new bookmark
    const newBookmark = new Bookmark({ userId, articleId, title, description, url, image });
    await newBookmark.save();

    // ✅ Fetch updated bookmarks list
    const bookmarks = await Bookmark.find({ userId });

    res.json({ message: "Article bookmarked!", savedArticles: bookmarks });
  } catch (error) {
    console.error("❌ Error saving bookmark:", error);
    res.status(500).json({ error: "Failed to save bookmark." });
  }
});

// 🔹 Remove a bookmark (Fix for URLs)
router.delete("/:articleId", authMiddleware, async (req, res) => {
  try {
    const articleId = decodeURIComponent(req.params.articleId); // ✅ Decode the URL
    const userId = req.user.id;

    console.log(`🗑️ Request to remove bookmark: ${articleId} by user ${userId}`);

    // 🔍 Check if the bookmark exists
    const bookmark = await Bookmark.findOne({ userId, articleId });
    if (!bookmark) {
      return res.status(404).json({ error: "Bookmark not found." });
    }

    // 🗑️ Delete the bookmark
    await Bookmark.findOneAndDelete({ userId, articleId });

    // ✅ Fetch updated bookmarks after deletion
    const updatedBookmarks = await Bookmark.find({ userId });

    res.json({ message: "Bookmark removed!", bookmarkedArticles: updatedBookmarks });
  } catch (error) {
    console.error("❌ Error removing bookmark:", error);
    res.status(500).json({ error: "Failed to remove bookmark." });
  }
});

module.exports = router;

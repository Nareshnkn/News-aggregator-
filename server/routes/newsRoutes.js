const express = require("express");
const axios = require("axios");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();
const API_KEY = process.env.NEWS_API_KEY;

/**
 * ✅ Fetch General News (Publicly Accessible)
 */
router.get("/", async (req, res) => {
  try {
    console.log("🌍 Fetching general news...");

    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`
    );

    if (!response.data.articles || response.data.articles.length === 0) {
      return res.status(404).json({ message: "No news articles found." });
    }

    const articles = response.data.articles.map((article) => ({
      articleId: article.url,
      title: article.title || "No Title Available",
      description: article.description || "No Description Available",
      url: article.url,
      image: article.urlToImage || "https://via.placeholder.com/300x200?text=No+Image",
    }));

    res.json({ articles });
  } catch (error) {
    console.error("❌ Error fetching general news:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch news", error: error.message });
  }
});

/**
 * ✅ Fetch Personalized News (Fixed Category Handling & Better Logging)
 */
router.get("/personalized", authMiddleware, async (req, res) => {
  try {
    console.log("🔍 Fetching personalized news for user:", req.user.id);

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { preferences } = user;
    if (!preferences) return res.status(400).json({ message: "No preferences set" });

    let { categories = [], sources = [], country = "us" } = preferences;

    if (!country || typeof country !== "string") country = "us";

    let query = `https://newsapi.org/v2/top-headlines?apiKey=${API_KEY}`;

    if (sources.length > 0) {
      query += `&sources=${sources.join(",")}`;
    } else {
      if (categories.length > 0) query += `&category=${categories.join(",")}`; 
      if (country) query += `&country=${country}`;
    }

    console.log("🔗 News API Query:", query);

    const response = await axios.get(query);

    if (!response.data.articles || response.data.articles.length === 0) {
      return res.status(404).json({ message: "No personalized news found." });
    }

    const articles = response.data.articles.map((article) => ({
      articleId: article.url,
      title: article.title || "No Title Available",
      description: article.description || "No Description Available",
      url: article.url,
      image: article.urlToImage || "https://via.placeholder.com/300x200?text=No+Image",
    }));

    res.json({ articles });
  } catch (error) {
    console.error("❌ Error fetching personalized news:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch personalized news", error: error.message });
  }
});

/**
 * ✅ Search News API (Improved Logging & Error Handling)
 */
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required." });
    }

    console.log(`🔎 Searching news for: ${query}`);

    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${API_KEY}`
    );

    if (!response.data.articles || response.data.articles.length === 0) {
      return res.status(404).json({ message: "No search results found." });
    }

    const articles = response.data.articles.map((article) => ({
      articleId: article.url,
      title: article.title || "No Title Available",
      description: article.description || "No Description Available",
      url: article.url,
      image: article.urlToImage || "https://via.placeholder.com/300x200?text=No+Image",
    }));

    console.log("🔍 Search Results - Sample Article:", articles[0]);

    res.json({ articles });
  } catch (error) {
    console.error("❌ Error searching news:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to search news", error: error.message });
  }
});

module.exports = router;

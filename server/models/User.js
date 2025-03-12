const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: function () {
        return !this.googleId && !this.githubId;
      },
    },
    email: { type: String, required: true, unique: true },

    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.githubId;
      },
      select: false,
    },

    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
    avatar: { type: String },

    preferences: {
      categories: [{ type: String, default: [] }],
      sources: [{ type: String, default: [] }],
      country: { type: String, default: "us" },
    },

    savedArticles: [
      {
        articleId: { type: String, required: true },
        title: { type: String, required: true },
        url: { type: String, required: true },
        source: String,
        image: String,
        publishedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

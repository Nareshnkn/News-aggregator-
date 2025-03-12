const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback", // ✅ Environment-based URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email provided by Google"), null);
        }

        let user = await User.findOne({ email });

        if (!user) {
          console.log("🆕 Creating new user...");

          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email,
            avatar: profile.photos?.[0]?.value || "",
            username: profile.displayName.replace(/\s+/g, "").toLowerCase(), // ✅ Auto-generate username
          });

          await user.save();
          console.log("✅ New user saved:", user.email);
        } else {
          console.log("✅ User already exists. Logging in...");
        }

        // ✅ Generate JWT token for the user
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

        // ✅ Attach token to the user object
        return done(null, { user, token });
      } catch (error) {
        console.error("❌ Error in Google OAuth:", error);
        return done(error, null);
      }
    }
  )
);

// ✅ Serialize & Deserialize User (Fixed)
passport.serializeUser((user, done) => {
  done(null, user.user._id); // ✅ Store only user ID
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-password");
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

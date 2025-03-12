import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  // ✅ Load user & token from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // ✅ Check if token is expired
      const tokenExpiry = parsedUser.exp * 1000; // Convert expiry to milliseconds
      if (Date.now() > tokenExpiry) {
        console.warn("🚨 Token expired. Logging out...");
        logout();
      } else {
        // ✅ Set Axios authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      }
    }
  }, []);

  // ✅ Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      const loggedInUser = response.data;
      setUser(loggedInUser);

      // ✅ Store token separately for easy access
      localStorage.setItem("token", loggedInUser.token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      // ✅ Set Axios authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${loggedInUser.token}`;

      return { success: true };
    } catch (error) {
      console.error("❌ Login Error:", error.response?.data?.message);
      return {
        success: false,
        message: error.response?.data?.message || "Invalid credentials. Please try again.",
      };
    }
  };

  // ✅ Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // ❌ Remove Axios default header
    delete axios.defaults.headers.common["Authorization"];

    // 🔹 Redirect to login
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom Hook to Use Authentication Context
export const useAuth = () => useContext(AuthContext);

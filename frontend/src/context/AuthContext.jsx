import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);

      // Refresh user from backend to ensure we have the latest `isOnboarded` and profile data
      (async () => {
        try {
          const token = parsed.token;
          if (!token) return;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const res = await axios.get("/api/users/profile", config);
          if (res.data) {
            localStorage.setItem("user", JSON.stringify(res.data));
            setUser(res.data);
          }
        } catch (err) {
          // If refresh fails, keep the stored user and do not block the app
          console.warn("Failed to refresh user profile on startup:", err.message || err);
        }
      })();
    }
    setLoading(false);
  }, []);

  // Login Function
  const login = async (email, password) => {
    // Change port to 5000 if needed
    const response = await axios.post("/api/users/login", {
      email,
      password,
    });

    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
      setUser(response.data);
    }

    // ⚠️ IMPORTANT: We return the data so the Login page can check if profile is complete
    return response.data;
  };

  // Register Function
  const register = async (name, email, password) => {
    const response = await axios.post("/api/users", {
      name,
      email,
      password,
    });

    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
      setUser(response.data);
    }

    // Return the created user data so the Signup page can act on it (e.g., navigate to onboarding)
    return response.data;
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
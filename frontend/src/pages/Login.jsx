import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion"; 
import { GoogleLogin } from '@react-oauth/google'; 
import axios from "axios"; 

import AuthContext from "../context/AuthContext";
import Logo from "../components/Logo"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, setUser } = useContext(AuthContext); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await login(email, password);
      await checkOnboarding(userData);
    } catch (err) {
      setError("Invalid email or password.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/google-login`, {
        token: credentialResponse.credential,
      });

      const userData = res.data;
      localStorage.setItem("user", JSON.stringify(userData));
      
      if (typeof setUser === "function") setUser(userData);
      
      await checkOnboarding(userData);

    } catch (err) {
      console.error("Google Login Backend Error", err);
      setError("Google Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkOnboarding = async (user) => {
    if (user?.isNewUser) {
      navigate("/onboarding");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div style={{ minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="card" 
        style={{ width: "100%", maxWidth: "420px", padding: "40px", borderTop: "5px solid var(--primary)" }}
      >
        
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ display: "inline-block", marginBottom: "15px" }}>
            <Logo />
          </div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "5px" }}>Welcome Back</h2>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>Enter your details to access your workout plan.</p>
        </div>

        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            style={{ background: "#FEF2F2", color: "#EF4444", padding: "12px", borderRadius: "8px", fontSize: "0.9rem", marginBottom: "20px", textAlign: "center", border: "1px solid #FECACA" }}
          >
            ⚠️ {error}
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit}>
          
          <div className="input-group">
            <span className="input-icon">✉️</span>
            <input 
              className="input-with-icon"
              type="email" 
              placeholder="Email Address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input 
              className="input-with-icon"
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ paddingRight: "45px" }}
            />
            <span 
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: "absolute", 
                right: "15px", 
                top: "50%", 
                transform: "translateY(-50%)", 
                cursor: "pointer", 
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                opacity: 0.6 
              }}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: "100%", 
              padding: "14px", 
              fontSize: "1rem", 
              marginTop: "10px",
              // LOADING STYLE FIX:
              background: loading ? "#9CA3AF" : "var(--primary)", 
              color: "white", 
              border: "none", 
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.3s ease"
            }}
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", margin: "25px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }}></div>
          <span style={{ padding: "0 10px", color: "#9CA3AF", fontSize: "0.9rem" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }}></div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Login Failed")}
            theme="filled_blue"
            shape="pill"
            text="signin_with"
            width="320"
          />
        </div>

        <div style={{ marginTop: "25px", textAlign: "center", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
          Don't have an account? <Link to="/signup" className="auth-link">Create one</Link>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
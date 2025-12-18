import { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Logo from "../components/Logo";
import AuthContext from "../context/AuthContext";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onboardingData = location.state?.onboardingData;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const { register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!passwordRegex.test(password)) {
      setError("Password too weak. Needs 8+ chars, 1 Upper, 1 Number, 1 Special.");
      return;
    }

    setLoading(true);
    try {
      const newUser = await register(name, email, password);
      if (newUser) {
        navigate("/onboarding");
      } else {
        alert("Account created! Please log in.");
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="card" 
        style={{ width: "100%", maxWidth: "420px", padding: "40px", borderTop: "5px solid var(--accent)" }} 
      >
        
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ display: "inline-block", marginBottom: "15px" }}>
            <Logo />
          </div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "5px" }}>Create Account</h2>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>Start your fitness journey today.</p>
        </div>

        {onboardingData && (
          <motion.div 
            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            style={{ marginBottom: "20px", background: "#EFF6FF", padding: "12px", borderRadius: "8px", fontSize: "0.9rem", color: "#1E40AF", border: "1px solid #BFDBFE", display: "flex", gap: "10px", alignItems: "center" }}
          >
            <span>✅</span>
            <div>
               <strong>Custom Plan Ready!</strong>
               <div style={{fontSize: "0.8rem"}}>We saved your {onboardingData.goal} routine.</div>
            </div>
          </motion.div>
        )}

        {error && (
          <div style={{ background: "#FEF2F2", color: "#EF4444", padding: "12px", borderRadius: "8px", fontSize: "0.9rem", marginBottom: "20px", textAlign: "center", border: "1px solid #FECACA" }}>
            ⚠️ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          
          <div className="input-group">
            <span className="input-icon">👤</span>
            <input className="input-with-icon" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="input-group">
            <span className="input-icon">✉️</span>
            <input className="input-with-icon" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          
          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input 
              className="input-with-icon"
              type={showPassword ? "text" : "password"} 
              placeholder="Create Password" 
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
              background: loading ? "#9CA3AF" : "var(--accent)", 
              color: "white", 
              border: "none", 
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.3s ease"
            }}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <div style={{ marginTop: "25px", textAlign: "center", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
          Already have an account? <Link to="/login" className="auth-link">Log In</Link>
        </div>

      </motion.div>
    </div>
  );
};

export default Signup;
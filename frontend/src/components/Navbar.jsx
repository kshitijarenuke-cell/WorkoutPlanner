import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import ThemeContext from "../context/ThemeContext"; 
import LanguageContext from "../context/LanguageContext"; 
import Logo from "./Logo"; 

const Navbar = () => {
  // --- 1. HOOKS ---
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext); 
  const { t } = useContext(LanguageContext);
  const location = useLocation(); 
  const navigate = useNavigate();

  // Manage which dropdown is open: 'tracking', 'profile', or null
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const trackingRef = useRef(null);
  const profileRef = useRef(null);

  // --- 2. CLOSE DROPDOWNS ON CLICK OUTSIDE ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If clicking outside Tracking Dropdown
      if (trackingRef.current && !trackingRef.current.contains(event.target)) {
        if (activeDropdown === 'tracking') setActiveDropdown(null);
      }
      // If clicking outside Profile Dropdown
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        if (activeDropdown === 'profile') setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  // --- 3. HELPER FUNCTIONS ---
  const userAvatar = user?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  
  const handleLogout = () => { 
    logout(); 
    navigate("/login"); 
  };

  const closeAll = () => setActiveDropdown(null);

  const toggleMobile = () => setMobileOpen(v => !v);

  // Styling for dropdown items
  const dropdownItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "12px 15px",
    textDecoration: "none",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "background 0.2s",
    borderBottom: "1px solid var(--border)",
    background: "transparent",
    border: "none",
    textAlign: "left"
  };

  const dropdownContainerStyle = {
    position: "absolute",
    top: "50px",
    borderRadius: "12px",
    width: "200px",
    overflow: "hidden",
    background: darkMode ? "#1F2937" : "#FFFFFF",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    border: "1px solid var(--border)",
    zIndex: 1001,
    display: "flex",
    flexDirection: "column"
  };

  // --- 4. HIDE NAVBAR ON AUTH PAGES ---
  if (["/", "/login", "/signup", "/onboarding"].includes(location.pathname)) {
    return null;
  }

  // --- 5. RENDER ---
  return (
    <nav className="nav" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 30px", position: "relative" }}>
      
      {/* LEFT: LOGO */}
      <Link to="/dashboard" onClick={() => { closeAll(); setMobileOpen(false); }} style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
        <Logo />
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "1.5rem", letterSpacing: "-0.5px" }}>FitTrack</h2>
      </Link>

      {/* RIGHT: NAVIGATION & PROFILE */}
      <div>
        {/* Mobile Menu Toggle */}
        <button aria-label="Open Menu" className="nav-mobile-toggle" onClick={toggleMobile}>
          {mobileOpen ? '✖' : '☰'}
        </button>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
            
            {/* --- MAIN NAVIGATION LINKS --- */}
            <div className="nav-links" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              
              {/* 1. Dashboard */}
              <Link to="/dashboard" onClick={closeAll} style={{ textDecoration: "none", color: "var(--text-secondary)", fontWeight: "500" }}>
                {t('dashboard')}
              </Link>

              {/* 2. TRACKING DROPDOWN (Renamed from Calendar) */}
              <div style={{ position: "relative" }} ref={trackingRef}>
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'tracking' ? null : 'tracking')}
                  style={{ 
                    background: "transparent", border: "none", cursor: "pointer", 
                    color: activeDropdown === 'tracking' ? "var(--primary)" : "var(--text-secondary)", 
                    fontWeight: "500", fontSize: "1rem", display: "flex", alignItems: "center", gap: "5px" 
                  }}
                >
                  Tracking ▾
                </button>

                {activeDropdown === 'tracking' && (
                  <div style={{ ...dropdownContainerStyle, left: "-40px" }}> {/* Align slightly left */}
                    
                    {/* Calendar Link */}
                    <Link to="/calendar" onClick={closeAll} style={dropdownItemStyle}>
                      <span style={{ fontSize: "1.2rem" }}>📅</span> Calendar
                    </Link>

                    {/* Nutrition Link */}
                    <Link to="/nutrition" onClick={closeAll} style={dropdownItemStyle}>
                      <span style={{ fontSize: "1.2rem" }}>🥗</span> Nutrition Calc
                    </Link>

                  </div>
                )}
              </div>

              {/* 3. Create */}
              <Link to="/create" onClick={closeAll} style={{ textDecoration: "none", color: "var(--text-secondary)", fontWeight: "500" }}>
                {t('create')}
              </Link>

              {/* 4. AI Coach */}
              <Link to="/ai-coach" onClick={closeAll} style={{ textDecoration: "none", color: "var(--text-secondary)", fontWeight: "500" }}>
                {t('ai_coach')}
              </Link>
            </div>

            {/* Mobile menu rendered when toggled */}
            {mobileOpen && (
              <div className="mobile-menu">
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '12px 10px' }}>Dashboard</Link>
                <Link to="/calendar" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '12px 10px' }}>Calendar</Link>
                <Link to="/create" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '12px 10px' }}>Create</Link>
                <Link to="/ai-coach" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '12px 10px' }}>AI Coach</Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '12px 10px' }}>Profile</Link>
              </div>
            )}

            {/* --- PROFILE DROPDOWN --- */}
            <div style={{ position: "relative" }} ref={profileRef}>
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
                style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", padding: "5px" }}
              >
                <span style={{ fontWeight: "bold", fontSize: "1.5rem", color: "var(--text-primary)" }}>{user?.name?.split(" ")[0] || ""}</span>
                <img src={userAvatar} alt="Profile" style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid var(--primary)", objectFit: "cover" }} />
              </button>

              {activeDropdown === 'profile' && (
                <div style={{ ...dropdownContainerStyle, right: 0, width: "220px" }}>
                  
                  {/* Profile Link */}
                  <Link to="/profile" onClick={closeAll} style={dropdownItemStyle}>
                    👤 {t('profile')}
                  </Link>

                  {/* Theme Toggle */}
                  <button onClick={toggleTheme} style={dropdownItemStyle}>
                    {darkMode ? "☀️ " + t('light_mode') : "🌙 " + t('dark_mode')}
                  </button>
                  
                  {/* Logout */}
                  <button 
                    onClick={handleLogout} 
                    style={{ ...dropdownItemStyle, color: "#EF4444", fontWeight: "bold", borderBottom: "none" }}
                  >
                    🚪 {t('logout')}
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
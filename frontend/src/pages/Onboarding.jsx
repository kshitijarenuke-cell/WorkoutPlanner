import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";

const Onboarding = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect away if the user is already onboarded (prevents existing users from accessing this page)
  useEffect(() => {
    if (user?.isOnboarded) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false); // Added loading state
  
  // 1. Initial State
  const [formData, setFormData] = useState({
    gender: "",
    age: "",
    weight: "",
    height: "", 
    activity: "", 
    goal: "",    
    place: ""    
  });

  // Local state for Feet & Inches
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");

  // Auto-convert to CM
  useEffect(() => {
    if (feet || inches) {
      const ft = parseFloat(feet) || 0;
      const inc = parseFloat(inches) || 0;
      const totalCm = Math.round((ft * 30.48) + (inc * 2.54));
      setFormData((prev) => ({ ...prev, height: totalCm }));
    }
  }, [feet, inches]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelect = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // --- VALIDATION ---
  const validateStep1 = () => {
    if (!formData.gender) return "Please select a gender.";
    if (!formData.age) return "Please enter your age.";
    if (!formData.weight) return "Please enter your weight.";
    if (!formData.height || formData.height === 0) return "Please enter your height.";
    return null;
  };

  const handleNext = () => {
    if (step === 1) {
        const error = validateStep1();
        if (error) { alert(error); return; }
    }
    if (step === 2 && !formData.activity) { alert("Please select an activity level."); return; }
    if (step === 3 && !formData.goal) { alert("Please select a goal."); return; }
    
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  // --- 🚀 NEW UPDATED SUBMIT FUNCTION ---
  const handleSubmit = async () => {
    if (!formData.place) {
      alert("Please select where you train.");
      return;
    }

    setLoading(true); // Disable button while processing

    try {
      // Prefer token from context but fall back to localStorage (handles Google flow)
      const token = user?.token || JSON.parse(localStorage.getItem("user"))?.token;
      if (!token) {
        alert("Authentication token missing. Please login again.");
        navigate('/login');
        return;
      }
      

      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // 1. Prepare Payload (Mapping your fields to Backend expectations)
      const payload = {
        age: parseInt(formData.age),
        weight: parseInt(formData.weight),
        height: parseInt(formData.height),
        gender: formData.gender,
        goal: formData.goal,
        fitnessLevel: formData.activity, // Mapping 'activity' to 'fitnessLevel'
        equipment: formData.place        // Mapping 'place' to 'equipment'
      };

      console.log("🚀 Sending Payload:", payload);

      // 2. SINGLE Call to generate everything
      await axios.post("/api/workouts/generate-onboarding", payload, config);
      
      // 3. Update Local Storage so app knows user details (mark as onboarded)
      const updatedUser = { ...user, ...payload, isOnboarded: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Update context so the rest of the app sees the change immediately
      if (typeof setUser === "function") setUser(updatedUser);

      console.log("✅ Success! Redirecting...");
      navigate("/dashboard");

    } catch (error) {
      console.error("❌ Onboarding Error:", error);
      
      // Better Error Handling
      if (error.response) {
        if (error.response.status === 404) {
            alert("Error 404: The backend route is missing. Did you update workoutRoutes.js?");
        } else {
            alert(`Server Error: ${error.response.data.message || "Unknown error"}`);
        }
      } else {
        alert("Network Error: Is the backend server running?");
      }
    } finally {
      setLoading(false);
    }
  };

  // Button Component (Your Original Component)
  const SelectionButton = ({ field, value, icon, label }) => {
    const isSelected = formData[field] === value;
    return (
      <div 
        onClick={() => handleSelect(field, value)}
        style={{
            border: isSelected ? "2px solid #2563EB" : "2px solid #2D3748",
            background: isSelected ? "rgba(37, 99, 235, 0.1)" : "transparent",
            padding: "20px",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "15px",
            transition: "all 0.2s"
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>{icon}</span>
        <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "white" }}>{label}</span>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", padding: "30px" }}>
      
      {/* Progress Bar */}
      <div style={{ width: "100%", height: "4px", background: "#2D3748", borderRadius: "2px", marginBottom: "40px" }}>
        <div style={{ width: `${(step / 4) * 100}%`, height: "100%", background: "#3B82F6", transition: "width 0.3s" }}></div>
      </div>

      {/* STEP 1: BASIC STATS */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 style={{ marginBottom: "30px", fontSize: "1.8rem", color: "white" }}>Tell us about yourself</h2>
          
          <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", color: "#A0AEC0" }}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#A0AEC0" }}>Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} style={inputStyle} placeholder="25" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#A0AEC0" }}>Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} style={inputStyle} placeholder="70" />
            </div>
          </div>

          <label style={{ display: "block", marginBottom: "8px", color: "#A0AEC0" }}>Height</label>
          <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
             <div style={{ flex: 1 }}>
                <input type="number" placeholder="Feet" value={feet} onChange={(e) => setFeet(e.target.value)} style={inputStyle} />
             </div>
             <div style={{ flex: 1 }}>
                <input type="number" placeholder="Inches" value={inches} onChange={(e) => setInches(e.target.value)} style={inputStyle} />
             </div>
          </div>
          
          {formData.height ? (
            <p style={{color: "#48BB78", fontSize: "0.9rem", marginTop: "-20px", marginBottom: "20px"}}>
              Height calculated: {formData.height} cm
            </p>
          ) : null}

          <button onClick={handleNext} style={primaryBtnStyle}>Next Step</button>
        </motion.div>
      )}

      {/* STEP 2: ACTIVITY LEVEL */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 style={{ marginBottom: "10px", color: "white" }}>How active are you?</h2>
          <p style={{ color: "#A0AEC0", marginBottom: "30px" }}>This helps us calculate your calorie needs.</p>
          
          <SelectionButton field="activity" value="Sedentary" icon="🛋️" label="Sedentary (Little/No exercise)" />
          <SelectionButton field="activity" value="Light" icon="🚶" label="Lightly Active (1-3 days/week)" />
          <SelectionButton field="activity" value="Moderate" icon="🏃" label="Moderately Active (3-5 days/week)" />
          <SelectionButton field="activity" value="Active" icon="🔥" label="Very Active (6-7 days/week)" />

          <div style={{ display: "flex", gap: "15px", marginTop: "30px" }}>
            <button onClick={prevStep} style={secondaryBtnStyle}>Back</button>
            <button onClick={handleNext} style={primaryBtnStyle}>Next</button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: MAIN GOAL */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 style={{ marginBottom: "30px", color: "white" }}>What is your main goal?</h2>
          <SelectionButton field="goal" value="Muscle Gain" icon="💪" label="Muscle Gain" />
          <SelectionButton field="goal" value="Weight Loss" icon="🔥" label="Weight Loss" />
          <SelectionButton field="goal" value="General Fitness" icon="❤️" label="General Fitness" />

          <div style={{ display: "flex", gap: "15px", marginTop: "30px" }}>
            <button onClick={prevStep} style={secondaryBtnStyle}>Back</button>
            <button onClick={handleNext} style={primaryBtnStyle}>Next</button>
          </div>
        </motion.div>
      )}

      {/* STEP 4: WORKOUT PLACE */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 style={{ marginBottom: "30px", color: "white" }}>Where do you train?</h2>
          <SelectionButton field="place" value="Gym" icon="🏋️‍♀️" label="Gym" />
          <SelectionButton field="place" value="Home" icon="🏠" label="Home" />

          <div style={{ display: "flex", gap: "15px", marginTop: "30px" }}>
            <button onClick={prevStep} style={secondaryBtnStyle}>Back</button>
            <button 
              onClick={handleSubmit} 
              disabled={loading}
              style={{ ...primaryBtnStyle, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Generating..." : "Generate Plan 🚀"}
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
};

// --- STYLES ---
const inputStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    background: "#2D3748",
    border: "1px solid #4A5568",
    color: "white",
    fontSize: "1rem",
    outline: "none"
};

const primaryBtnStyle = {
    flex: 1,
    padding: "15px",
    background: "#3B82F6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer"
};

const secondaryBtnStyle = {
    flex: 1,
    padding: "15px",
    background: "transparent",
    color: "#A0AEC0",
    border: "1px solid #4A5568",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer"
};

export default Onboarding;
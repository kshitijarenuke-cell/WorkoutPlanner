import { useState } from "react";
import { motion } from "framer-motion";

const MacroCalculator = () => {
  const [formData, setFormData] = useState({
    gender: "male",
    age: "",
    weight: "",
    height: "",
    activity: "1.2",
    goal: "maintain",
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateMacros = (e) => {
    e.preventDefault();
    const { gender, age, weight, height, activity, goal } = formData;
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    const act = parseFloat(activity);

    if (!w || !h || !a) {
      alert("Please fill in all fields correctly.");
      return;
    }

    let bmr;
    if (gender === "male") {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    const tdee = bmr * act;
    let targetCalories = tdee;
    if (goal === "lose") targetCalories -= 500;
    if (goal === "gain") targetCalories += 400;

    const protein = Math.round((targetCalories * 0.3) / 4);
    const carbs = Math.round((targetCalories * 0.35) / 4);
    const fats = Math.round((targetCalories * 0.35) / 9);

    setResult({
      calories: Math.round(targetCalories),
      protein,
      carbs,
      fats,
      goalType: goal
    });
  };

  // --- STYLES ---
  // Force labels to be dark gray so they show up on the white card
  const labelStyle = {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#374151" // <--- FIXED: Dark Gray color
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    background: "#F3F4F6", // Light gray background for inputs
    color: "#111827",       // Dark text inside inputs
    fontSize: "1rem",
    outline: "none"
  };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
      
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
             <span style={{ fontSize: "2.5rem" }}>🥗</span>
             <h1 style={{ fontSize: "2.5rem", color: "#3B82F6", margin: 0 }}>Nutrition Calculator</h1>
        </div>
        <p style={{ color: "gray", fontSize: "1.1rem" }}>Discover exactly what you need to eat to reach your goals.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }}>
        
        {/* LEFT COLUMN: FORM */}
        <motion.form 
          initial={{ x: -50, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
          onSubmit={calculateMacros} 
          style={{ 
            background: "white", 
            padding: "30px", 
            borderRadius: "20px",
            // This ensures the card stays white even in dark mode
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)" 
          }}
        >
          <h3 style={{ marginBottom: "20px", color: "#111827" }}>Your Stats</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={labelStyle}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} style={inputStyle} placeholder="25" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={labelStyle}>Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} style={inputStyle} placeholder="70" />
            </div>
            <div>
              <label style={labelStyle}>Height (cm)</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange} style={inputStyle} placeholder="175" />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Activity Level</label>
            <select name="activity" value={formData.activity} onChange={handleChange} style={inputStyle}>
              <option value="1.2">Sedentary (Office job, no exercise)</option>
              <option value="1.375">Lightly Active (1-3 days/week)</option>
              <option value="1.55">Moderately Active (3-5 days/week)</option>
              <option value="1.725">Very Active (6-7 days/week)</option>
            </select>
          </div>

          <div style={{ marginBottom: "30px" }}>
            <label style={labelStyle}>Main Goal</label>
            <select name="goal" value={formData.goal} onChange={handleChange} style={inputStyle}>
              <option value="lose">🔥 Lose Fat</option>
              <option value="maintain">⚖️ Maintain Weight</option>
              <option value="gain">💪 Build Muscle</option>
            </select>
          </div>

          <button type="submit" style={{ width: "100%", padding: "14px", background: "#3B82F6", color: "white", borderRadius: "10px", fontSize: "1.1rem", fontWeight: "bold", border: "none", cursor: "pointer", transition: "0.2s" }}>
            Calculate Plan
          </button>
        </motion.form>

        {/* RIGHT COLUMN: RESULTS */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
          {result ? (
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} 
               animate={{ scale: 1, opacity: 1 }}
               style={{ background: "#F0F9FF", padding: "40px", borderRadius: "20px", border: "1px solid #BAE6FD" }}
             >
               <h2 style={{ textAlign: "center", marginBottom: "10px", color: "#0C4A6E" }}>Daily Targets</h2>
               <div style={{ textAlign: "center", fontSize: "3.5rem", fontWeight: "800", color: "#0284C7", lineHeight: "1" }}>
                 {result.calories} <span style={{ fontSize: "1.2rem", color: "#64748B", fontWeight: "600" }}>kcal</span>
               </div>
               
               <div style={{ marginTop: "40px", display: "grid", gap: "20px" }}>
                 {/* Protein Card */}
                 <div style={{ background: "white", padding: "15px 20px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <span style={{ fontSize: "1.5rem" }}>🥩</span>
                        <div>
                            <strong style={{ color: "#334155" }}>Protein</strong>
                            <div style={{ fontSize: "0.85rem", color: "gray" }}>Muscle Repair</div>
                        </div>
                    </div>
                    <strong style={{ fontSize: "1.4rem", color: "#3B82F6" }}>{result.protein}g</strong>
                 </div>

                 {/* Carbs Card */}
                 <div style={{ background: "white", padding: "15px 20px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <span style={{ fontSize: "1.5rem" }}>🍞</span>
                        <div>
                            <strong style={{ color: "#334155" }}>Carbs</strong>
                            <div style={{ fontSize: "0.85rem", color: "gray" }}>Energy</div>
                        </div>
                    </div>
                    <strong style={{ fontSize: "1.4rem", color: "#EAB308" }}>{result.carbs}g</strong>
                 </div>

                 {/* Fats Card */}
                 <div style={{ background: "white", padding: "15px 20px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <span style={{ fontSize: "1.5rem" }}>🥑</span>
                        <div>
                            <strong style={{ color: "#334155" }}>Fats</strong>
                            <div style={{ fontSize: "0.85rem", color: "gray" }}>Hormone Health</div>
                        </div>
                    </div>
                    <strong style={{ fontSize: "1.4rem", color: "#EC4899" }}>{result.fats}g</strong>
                 </div>
               </div>
             </motion.div>
          ) : (
            <div style={{ textAlign: "center", color: "gray", padding: "60px 40px", background: "rgba(255,255,255,0.1)", borderRadius: "20px", border: "2px dashed rgba(255,255,255,0.2)" }}>
              <div style={{ background: "white", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto", fontSize: "2.5rem", boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}>
                🥗
              </div>
              <h3 style={{ color: "#9CA3AF" }}>Ready to Calculate?</h3>
              <p style={{ color: "#6B7280" }}>Enter your details on the left to generate your personalized nutrition plan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MacroCalculator;
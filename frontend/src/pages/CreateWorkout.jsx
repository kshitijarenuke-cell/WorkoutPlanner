import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { commonExercises, workoutTemplates, commonRoutines } from "../data/exerciseList";
import { getDailyMealPlan } from "../utils/mealGenerator"; 

const CreateWorkout = () => {
  const navigate = useNavigate();
  
  // Helper to get local date YYYY-MM-DD
  const getLocalDateString = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().split("T")[0];
  };

  const [name, setName] = useState("");
  const [type, setType] = useState("Strength");
  const [scheduleDate, setScheduleDate] = useState(getLocalDateString());
  const [exercises, setExercises] = useState([{ name: "", sets: "", reps: "" }]);
  
  // Autocomplete States
  const [routineSuggestions, setRoutineSuggestions] = useState([]);
  const [exerciseSuggestions, setExerciseSuggestions] = useState([]);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(null);
  const [todaysDiet, setTodaysDiet] = useState(null);

  useEffect(() => {
    let goal = "Balanced";
    if (type === "Strength") goal = "Muscle Gain";
    else if (type === "Cardio") goal = "Fat Loss";
    else if (type === "Yoga") goal = "Balanced";

    const plan = getDailyMealPlan(goal);
    setTodaysDiet(plan);
  }, [type]); 

  // --- 1. ROUTINE NAME AUTOCOMPLETE ---
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (value.length > 0) {
      const matches = commonRoutines.filter(r => r.toLowerCase().includes(value.toLowerCase()));
      setRoutineSuggestions(matches);
    } else {
      setRoutineSuggestions([]);
    }
  };

  const selectRoutineName = (suggestion) => {
    setName(suggestion);
    setRoutineSuggestions([]);
    
    // Auto-fill exercises
    if (workoutTemplates[suggestion]) {
      if (window.confirm(`Auto-fill exercises for ${suggestion}?`)) {
        setExercises(workoutTemplates[suggestion].map(ex => ({ ...ex })));
        
        // Smart Type Selection
        if(suggestion.includes("HIIT") || suggestion.includes("Cardio")) setType("Cardio");
        else setType("Strength");
      }
    }
  };

  // --- 2. EXERCISE NAME AUTOCOMPLETE ---
  const handleExerciseChange = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
    
    if (field === "name") {
      setActiveExerciseIndex(index);
      if (value.length > 0) {
        const matches = commonExercises.filter(ex => ex.toLowerCase().includes(value.toLowerCase()));
        setExerciseSuggestions(matches.slice(0, 5));
      } else {
        setExerciseSuggestions([]);
      }
    }
  };

  const selectExerciseSuggestion = (index, suggestion) => {
    const updated = [...exercises];
    updated[index].name = suggestion;
    setExercises(updated);
    setExerciseSuggestions([]);
    setActiveExerciseIndex(null);
  };

  const addExerciseField = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("Please login");

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const res = await axios.post("/api/workouts", { name, type, exercises }, config);
      const newWorkoutId = res.data._id;

      await axios.post("/api/workouts/schedule", {
          workoutId: newWorkoutId,
          date: scheduleDate
      }, config);

      alert("Workout Created & Scheduled!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error creating workout");
    }
  };

  // --- STYLES ---
  const dropdownStyle = { 
    position: "absolute", 
    top: "100%", 
    left: 0, 
    width: "100%", 
    background: "white", // White background
    border: "1px solid #ddd", 
    zIndex: 10, 
    listStyle: "none", 
    padding: 0, 
    margin: 0,
    borderRadius: "0 0 8px 8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
  };

  // FIXED: Force text color to BLACK so it shows on white background
  const itemStyle = { 
    padding: "12px", 
    cursor: "pointer", 
    borderBottom: "1px solid #eee",
    color: "#000000", // <--- BLACK TEXT
    fontSize: "0.95rem",
    textAlign: "left"
  };

  return (
    <div className="card" style={{ maxWidth: "600px", margin: "20px auto", paddingBottom: "50px" }}>
      <h2 style={{ color: "#3B82F6" }}>Create & Schedule Routine</h2>
      
      <form onSubmit={handleSubmit} autoComplete="off">
        {/* Routine Name Input with Autocomplete */}
        <div style={{ position: "relative", marginBottom: "15px" }}>
          <label>Routine Name:</label>
          <input 
            type="text" 
            placeholder="e.g., Leg Day" 
            value={name} 
            onChange={handleNameChange} 
            required 
            autoComplete="off"
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
          {routineSuggestions.length > 0 && (
            <ul style={dropdownStyle}>
              {routineSuggestions.map((s, i) => (
                <li 
                    key={i} 
                    onClick={() => selectRoutineName(s)} 
                    style={itemStyle}
                    onMouseEnter={(e) => e.target.style.background = "#f0f0f0"}
                    onMouseLeave={(e) => e.target.style.background = "white"}
                >
                  ⚡ {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Date Picker */}
        <div style={{ marginBottom: "15px" }}>
            <label>Schedule For:</label>
            <input 
                type="date" 
                value={scheduleDate} 
                onChange={(e) => setScheduleDate(e.target.value)} 
                required
                style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
        </div>

        <label>Type (Affects Diet Plan):</label>
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "15px" }}>
          <option value="Strength">Strength (Muscle Gain)</option>
          <option value="Cardio">Cardio (Fat Loss)</option>
          <option value="Yoga">Yoga (Balanced)</option>
        </select>

        <h3>Exercises</h3>
        {exercises.map((ex, i) => (
          <div key={i} style={{ display: "flex", gap: "5px", marginBottom: "10px", position: "relative" }}>
            <div style={{ flex: 2 }}>
              <input type="text" placeholder="Exercise" value={ex.name} onChange={(e) => handleExerciseChange(i, "name", e.target.value)} required autoComplete="off" style={{ width: "100%", padding: "10px" }} />
              
              {/* Exercise Dropdown */}
              {activeExerciseIndex === i && exerciseSuggestions.length > 0 && (
                <ul style={{ ...dropdownStyle, top: "45px" }}>
                  {exerciseSuggestions.map((s, j) => (
                    <li 
                        key={j} 
                        onClick={() => selectExerciseSuggestion(i, s)} 
                        style={itemStyle}
                        onMouseEnter={(e) => e.target.style.background = "#f0f0f0"}
                        onMouseLeave={(e) => e.target.style.background = "white"}
                    >
                        {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <input type="number" placeholder="Sets" value={ex.sets} onChange={(e) => handleExerciseChange(i, "sets", e.target.value)} style={{ flex: 1, padding: "10px" }} />
            <input type="number" placeholder="Reps" value={ex.reps} onChange={(e) => handleExerciseChange(i, "reps", e.target.value)} style={{ flex: 1, padding: "10px" }} />
          </div>
        ))}

        <button type="button" onClick={addExerciseField} style={{ background: "#10B981", margin: "10px 0", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer" }}>+ Add Another Exercise</button>
        
        {/* Diet Display */}
        {todaysDiet && (
          <div style={{ marginTop: "20px", marginBottom: "20px", padding: "20px", background: "#F3F4F6", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
            <h3 style={{ marginTop: 0, color: "#4B5563", fontSize: "1.2rem" }}>🥗 Daily Fuel: {todaysDiet.goal}</h3>
            <div style={{ display: "grid", gap: "10px", fontSize: "0.95rem", color: "black" }}>
              <div><strong>🍳 Breakfast:</strong> {todaysDiet.breakfast}</div>
              <div><strong>🍗 Lunch:</strong> {todaysDiet.lunch}</div>
              <div><strong>🥜 Snack:</strong> {todaysDiet.snack}</div>
              <div><strong>🥗 Dinner:</strong> {todaysDiet.dinner}</div>
            </div>
          </div>
        )}

        <button type="submit" style={{ width: "100%", padding: "12px", background: "#3B82F6", color: "white", border: "none", borderRadius: "5px", fontSize: "1rem", cursor: "pointer" }}>Save & Schedule</button>
      </form>
    </div>
  );
};

export default CreateWorkout;
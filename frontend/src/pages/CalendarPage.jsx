import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; 
import axios from "axios";

const CalendarPage = () => {
  const [date, setDate] = useState(new Date()); 
  const [viewDate, setViewDate] = useState(new Date()); 
  const [schedules, setSchedules] = useState([]);
  const [workouts, setWorkouts] = useState([]); 
  const [selectedWorkout, setSelectedWorkout] = useState("");
  
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user ? user.token : null;
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const formatDate = (d) => {
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - (offset * 60 * 1000));
    return local.toISOString().split('T')[0];
  };

  const selectedDateStr = formatDate(date);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schRes, workRes] = await Promise.all([
        axios.get("/api/workouts/schedule", config),
        axios.get("/api/workouts", config)
      ]);
      setSchedules(Array.isArray(schRes.data) ? schRes.data : []);
      setWorkouts(Array.isArray(workRes.data) ? workRes.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSchedule = async () => {
    if (!selectedWorkout) return alert("Select a routine first");
    try {
      await axios.post("/api/workouts/schedule", {
        workoutId: selectedWorkout,
        date: selectedDateStr
      }, config);
      alert("Scheduled!");
      setSelectedWorkout("");
      fetchData();
    } catch (err) {
      alert("Failed to schedule");
    }
  };

  // --- NEW: Google Calendar Export Function ---
  const addToGoogleCalendar = (schedule) => {
    const { workout, date } = schedule;
    
    // 1. Calculate Start Date (YYYYMMDD)
    const eventDate = new Date(date);
    const startStr = eventDate.toISOString().replace(/-|:|\.\d\d\d/g, "").split("T")[0];
    
    // 2. Calculate End Date (Start + 1 Day for All-Day events)
    const nextDay = new Date(eventDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const endStr = nextDay.toISOString().replace(/-|:|\.\d\d\d/g, "").split("T")[0];

    // 3. Prepare Title and Details
    const title = encodeURIComponent(`Gym: ${workout.name}`);
    const detailsText = `Type: ${workout.type}\n\nPlan:\n` + 
      workout.exercises.map(ex => `- ${ex.name}: ${ex.sets}x${ex.reps}`).join("\n");
    const details = encodeURIComponent(detailsText);

    // 4. Open Google Calendar URL
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}`;
    window.open(url, '_blank');
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dStr = formatDate(date);
      const hasWorkout = schedules.some(s => s.date.startsWith(dStr));
      const isCompleted = schedules.some(s => s.date.startsWith(dStr) && (s.isCompleted || s.completed));
      
      if (hasWorkout) {
        return (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "5px" }}>
             <div style={{ 
              height: "6px", width: "6px", borderRadius: "50%", 
              backgroundColor: isCompleted ? "#10B981" : "#3B82F6" 
            }}></div>
          </div>
        );
      }
    }
  };

  // Filter workouts for the view
  const daysWorkouts = schedules.filter(s => s.date.startsWith(selectedDateStr));

  return (
    <div className="container calendar-layout" style={{ maxWidth: "1100px", margin: "0 auto", alignItems: "start" }}>
      
      {/* LEFT: CALENDAR */}
      <div className="card" style={{ padding: "30px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
        <h2 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "10px", textTransform: "capitalize" }}>
          📅 {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>

        <Calendar 
          onChange={setDate} 
          value={date}
          onActiveStartDateChange={({ activeStartDate }) => setViewDate(activeStartDate)}
          tileContent={tileContent}
          className="custom-calendar"
          showNavigation={true}
        />
      </div>

      {/* RIGHT: DETAILS PANEL */}
      <div className="card" style={{ padding: "30px", minHeight: "500px", display: "flex", flexDirection: "column" }}>
        
        {/* HEADER */}
        <h2 style={{ marginTop: 0, fontSize: "1.8rem", borderBottom: "2px solid #F3F4F6", paddingBottom: "15px", marginBottom: "20px" }}>
          {date.toDateString()}
        </h2>

        {/* ACTIVITY LOG */}
        <div style={{ flex: 1 }}>
          <h4 style={{ color: "#6B7280", marginTop: 0 }}>Activity Log:</h4>
          
          {daysWorkouts.length > 0 ? (
            daysWorkouts.map(s => (
              <div key={s._id} style={{ 
                background: (s.isCompleted || s.completed) ? "#ECFDF5" : "#EFF6FF", 
                padding: "20px", 
                borderRadius: "12px", 
                marginBottom: "15px",
                borderLeft: `5px solid ${(s.isCompleted || s.completed) ? "#10B981" : "#3B82F6"}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#1F2937" }}>{s.workout.name}</h3>
                    <span style={{ fontSize: "0.9rem", color: "#4B5563" }}>Type: {s.workout.type}</span>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
                    {(s.isCompleted || s.completed) && <span style={{ color: "#059669", fontWeight: "bold", fontSize: "0.8rem" }}>✅ COMPLETED</span>}
                    
                    {/* --- NEW BUTTON: Add to Google Calendar --- */}
                    
                  </div>
                </div>
                
                <ul style={{ margin: 0, paddingLeft: "20px", color: "#374151" }}>
                  {s.workout.exercises.map((ex, i) => (
                    <li key={i}>{ex.name} - {ex.sets}x{ex.reps}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p style={{ color: "#9CA3AF", fontStyle: "italic" }}>No workouts recorded for this day.</p>
          )}
        </div>
<button 
                      onClick={() => addToGoogleCalendar(s)}
                      style={{ 
                        background: "white", 
                        border: "2px solid #114af6ff", 
                        borderRadius: "5px", 
                        padding: "5px 10px", 
                        cursor: "pointer", 
                        fontSize: "1.00rem",
                        color: "#070707ff",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px"
                      }}
                      title="Add to Google Calendar"
                    >
                      📅 Sync to Google
                    </button>
        {/* BOTTOM: QUICK ADD FORM */}
        <div style={{ marginTop: "70px" }}>
          </div>

      </div>
    </div>
  );
};

export default CalendarPage;
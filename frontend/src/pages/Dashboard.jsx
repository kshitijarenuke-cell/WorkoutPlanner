import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; 

import StatsSummary from "../components/StatsSummary";
import WorkoutChart from "../components/WorkoutChart";
import WorkoutPieChart from "../components/WorkoutPieChart";

const BADGES = [
  { id: 1, name: "First Step", icon: "👟", desc: "Complete your first workout", type: "count", threshold: 1 },
  { id: 2, name: "On Fire", icon: "🔥", desc: "Achieve a 3-day streak", type: "streak", threshold: 3 },
  { id: 3, name: "Iron Will", icon: "💪", desc: "Complete 10 total workouts", type: "count", threshold: 10 },
  { id: 4, name: "Weekend Warrior", icon: "🌴", desc: "Workout on a Saturday or Sunday", type: "special" },
];

const Dashboard = () => {
  // 1. Initialize State
  const [schedules, setSchedules] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user ? user.token : null;
  
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // 2. Fetch Data
  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const workoutRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/workouts`, config);
      setWorkouts(Array.isArray(workoutRes.data) ? workoutRes.data : []);

      const scheduleRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/workouts/schedule`, config);
      setSchedules(Array.isArray(scheduleRes.data) ? scheduleRes.data : []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      // Prevent crash by setting empty arrays on error
      setWorkouts([]);
      setSchedules([]);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [token, navigate, fetchData]);

  // 3. Handlers
  const handleComplete = async (scheduleId) => {
    try {
      // Optimistic update for instant UI feedback
      setSchedules((prev) =>
        prev.map((s) => (s._id === scheduleId ? { ...s, isCompleted: true } : s))
      );
      await axios.put(`${import.meta.env.VITE_API_URL}/api/workouts/schedule/${scheduleId}`, {}, config);
      await fetchData(); // Refresh data to be sure
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating status");
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/workouts/schedule/${scheduleId}`, config);
      await fetchData();
    } catch (err) {
      console.error("Failed to delete schedule", err);
      alert("Error deleting schedule.");
    }
  };

  // 4. BADGE LOGIC (Restored from missing code)
  const calculateBadges = () => {
    if (!Array.isArray(schedules)) return BADGES;

    const completedSchedules = schedules.filter(s => s.isCompleted);
    const totalCompleted = completedSchedules.length;

    // Streak Logic
    let streakCount = 0;
    let lastDate = null;
    // Sort completed dates to find streaks
    const datesAsc = [...new Set(completedSchedules.map(s => s.date))].sort();
    
    datesAsc.forEach(dateStr => {
        const d = new Date(dateStr);
        if (!lastDate) {
            streakCount = 1;
        } else {
            const diffTime = Math.abs(d - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            if (diffDays === 1) streakCount++;
            else if (diffDays > 1) streakCount = 1; // Reset if gap > 1 day
        }
        lastDate = d;
    });

    const hasWeekend = completedSchedules.some(s => {
        const day = new Date(s.date).getDay();
        return day === 0 || day === 6; // 0=Sun, 6=Sat
    });

    return BADGES.map(badge => {
        let isUnlocked = false;
        if (badge.type === "count") isUnlocked = totalCompleted >= badge.threshold;
        if (badge.type === "streak") isUnlocked = streakCount >= badge.threshold;
        if (badge.type === "special") isUnlocked = hasWeekend;
        return { ...badge, isUnlocked };
    });
  };

  const myBadges = calculateBadges();
  
  // 5. DATE HELPER (Fixes "Today" not showing issue)
  const isSameDay = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const safeSchedules = Array.isArray(schedules) ? schedules : [];
  
  // Find today's workout using the robust isSameDay helper
  const allTodaysWorkouts = safeSchedules.filter((s) => isSameDay(s.date, new Date()));
  const todaysWorkout = allTodaysWorkouts.find((s) => !s.isCompleted) || allTodaysWorkouts[0];

  // Helper for upcoming (Simple date comparison works for future dates)
  const upcomingSchedules = safeSchedules
    .filter(s => new Date(s.date) > new Date())
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="container" style={{ paddingBottom: "100px" }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: "30px" }}>
        <h1>Welcome back, {user?.name?.split(" ")[0] || ''}!</h1>
        <p style={{ color: "#6B7280" }}>Here is your daily activity summary.</p>
      </div>

      {/* STATS */}
      <div style={{ marginBottom: "40px" }}>
        <StatsSummary schedules={safeSchedules} />
      </div>

      {/* BADGES */}
      <div className="card" style={{ padding: "25px", borderRadius: "16px", marginBottom: "40px" }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "1.2rem" }}>🏆 Your Achievements</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            {myBadges.map((badge) => (
                <div key={badge.id} style={{
                    border: badge.isUnlocked ? "2px solid #FCD34D" : "1px solid #E5E7EB",
                    background: badge.isUnlocked ? "#FFFBEB" : "#F9FAFB",
                    borderRadius: "12px",
                    padding: "15px",
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    opacity: badge.isUnlocked ? 1 : 0.6
                }}>
                    <div style={{ fontSize: "2rem", filter: badge.isUnlocked ? "none" : "grayscale(100%)" }}>
                        {badge.icon}
                    </div>
                    <div>
                        <div style={{ fontWeight: "bold", color: badge.isUnlocked ? "#92400E" : "#6B7280" }}>
                            {badge.name}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>{badge.desc}</div>
                    </div>
                    {badge.isUnlocked && <div style={{ marginLeft: "auto", color: "#F59E0B" }}>✔</div>}
                </div>
            ))}
        </div>
      </div>

      {/* 🔥 TODAY'S MISSION CARD */}
      <div className="card" style={{ border: "2px solid var(--primary)", borderRadius: "16px", padding: "25px", marginBottom: "40px" }}>
        <h2 style={{ marginTop: 0 }}>🔥 Today’s Mission</h2>
        
        {todaysWorkout ? (
          todaysWorkout.isCompleted ? (
            <div style={{ background: "#D1FAE5", padding: "20px", borderRadius: "12px", textAlign: "center", fontWeight: "bold", color: "#065F46" }}>
              ✅ Workout Completed!
            </div>
          ) : (
            <>
              <h3 style={{ color: "var(--primary)" }}>{todaysWorkout.workout.name}</h3>
              <div style={{ background: "#384b71ff", padding: "20px", borderRadius: "12px", marginBottom: "20px" }}>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {todaysWorkout.workout.exercises.map((ex, i) => (
                    <li key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i !== todaysWorkout.workout.exercises.length - 1 ? "1px solid #E5E7EB" : "none" }}>
                      <strong style={{color: "white"}}>{ex.name}</strong>
                      <span style={{color: "#D1D5DB"}}>{ex.sets} x {ex.reps}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => handleComplete(todaysWorkout._id)} style={{ width: "100%", padding: "14px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                Mark as Completed
              </button>
            </>
          )
        ) : (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <p style={{ color: "#6B7280", fontSize: "1.1rem", marginBottom: "10px" }}>
              Rest day! No workout scheduled for today.
            </p>
            <Link to="/create" style={{ color: "var(--primary)", fontWeight: "700", textDecoration: "underline", fontSize: "1.05rem", cursor: "pointer" }}>
              Schedule now?
            </Link>
          </div>
        )}
      </div>

      {/* CHARTS */}
      <div className="charts-grid" style={{ marginBottom: "40px", alignItems: "stretch" }}>
        {/* ✅ FIX: Wrap charts in card-like containers with explicitly defined height to prevent crashes */}
        <div className="card" style={{ padding: "20px", borderRadius: "16px", minHeight: "350px" }}>
          <h3 style={{marginBottom: "20px"}}>Workout Frequency</h3>
          <div style={{ height: "300px", width: "100%" }}>
            <WorkoutChart schedules={safeSchedules} />
          </div>
        </div>

        <div className="card" style={{ padding: "20px", borderRadius: "16px", minHeight: "350px" }}>
          <h3 style={{marginBottom: "20px"}}>Workout Types</h3>
           <div style={{ height: "300px", width: "100%" }}>
            <WorkoutPieChart schedules={safeSchedules} />
          </div>
        </div>
      </div>

      {/* UPCOMING */}
      <div className="card" style={{ padding: "25px", borderRadius: "16px" }}>
        <h3 style={{ margin: "0 0 25px 0", borderBottom: "1px solid #eee", paddingBottom: "15px", fontSize: "1.2rem" }}>📅 Upcoming Schedule</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {upcomingSchedules.map((s) => (
              <div key={s._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "#F9FAFB", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "#6B7280", fontWeight: "600", marginBottom: "6px", textTransform: "uppercase" }}>
                    {new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ color: "#1F2937", fontWeight: "bold", fontSize: "1.1rem" }}>{s.workout.name}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ padding: "6px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold", background: s.isCompleted ? "#D1FAE5" : "#FEF3C7", color: s.isCompleted ? "#065F46" : "#92400E", border: s.isCompleted ? "1px solid #10B981" : "1px solid #F59E0B" }}>
                      {s.isCompleted ? "Done" : "Pending"}
                  </span>
                  <button onClick={() => handleDelete(s._id)} style={{ background: "white", border: "1px solid #EF4444", color: "#EF4444", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" }}>🗑️</button>
                </div>
              </div>
          ))}
          {upcomingSchedules.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px", color: "#9CA3AF" }}>No upcoming workouts scheduled.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
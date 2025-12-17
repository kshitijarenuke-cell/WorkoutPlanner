import React from 'react';

const StatsSummary = ({ schedules }) => {
  // 1. Filter only completed workouts
  const completedWorkouts = schedules.filter(s => s.completed);

  // 2. Calculate Total Workouts
  const totalCompleted = completedWorkouts.length;

  // 3. Calculate Streak Logic
  const calculateStreak = () => {
    if (completedWorkouts.length === 0) return 0;

    // Get unique dates of completed workouts, sorted newest first
    const uniqueDates = [...new Set(
      completedWorkouts
        .map(s => s.date.split('T')[0]) // Extract YYYY-MM-DD
        .sort((a, b) => new Date(b) - new Date(a)) // Sort Descending
    )];

    // If no workouts, streak is 0
    if (uniqueDates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if the streak is alive (must have worked out Today or Yesterday)
    const lastWorkout = uniqueDates[0];
    if (lastWorkout !== today && lastWorkout !== yesterdayStr) {
      return 0; // Streak broken
    }

    let streak = 1;
    // Iterate backwards checking for consecutive days
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = new Date(uniqueDates[i]);
      const previous = new Date(uniqueDates[i+1]);

      // Calculate difference in time
      const diffTime = Math.abs(current - previous);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        streak++;
      } else {
        break; // Gap found, stop counting
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
      
      {/* Card 1: Streak */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: "15px", background: "linear-gradient(135deg, #FFF 0%, #FFF7ED 100%)", border: "1px solid #FFEDD5" }}>
        <div style={{ fontSize: "2.5rem" }}>🔥</div>
        <div>
          <h2 style={{ margin: 0, fontSize: "2rem", color: "#EA580C" }}>{currentStreak}</h2>
          <p style={{ margin: 0, color: "#9A3412", fontWeight: "bold" }}>Day Streak</p>
        </div>
      </div>

      {/* Card 2: Total Workouts */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: "15px", background: "linear-gradient(135deg, #FFF 0%, #EFF6FF 100%)", border: "1px solid #DBEAFE" }}>
        <div style={{ fontSize: "2.5rem" }}>🏆</div>
        <div>
          <h2 style={{ margin: 0, fontSize: "2rem", color: "#2563EB" }}>{totalCompleted}</h2>
          <p style={{ margin: 0, color: "#1E40AF", fontWeight: "bold" }}>Total Workouts</p>
        </div>
      </div>

    </div>
  );
};

export default StatsSummary;
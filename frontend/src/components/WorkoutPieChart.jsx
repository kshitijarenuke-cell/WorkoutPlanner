import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WorkoutPieChart = ({ schedules }) => {
  // 1. Filter only completed workouts
  const completed = schedules.filter(s => s.completed);

  // 2. Group by Type (Strength, Cardio, etc.)
  // Result looks like: { "Strength": 5, "Cardio": 2 }
  const counts = completed.reduce((acc, curr) => {
    const type = curr.workout.type || "Other";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // 3. Format data for Recharts
  const data = Object.keys(counts).map(key => ({
    name: key,
    value: counts[key]
  }));

  // Define colors for the slices
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']; // Blue, Green, Yellow, Red

  return (
    <div className="card" style={{ height: "300px" }}>
      <h3>Workout Focus</h3>
      <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "10px" }}>
        Distribution by exercise type
      </p>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60} // Makes it a "Donut" chart (looks modern)
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p style={{ textAlign: "center", marginTop: "50px", color: "#999" }}>
          No completed workouts yet.
        </p>
      )}
    </div>
  );
};

export default WorkoutPieChart;
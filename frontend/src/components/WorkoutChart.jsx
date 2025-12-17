import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const WorkoutChart = ({ schedules }) => {
  // Safety check
  const safeSchedules = Array.isArray(schedules) ? schedules : [];

  // --- 1. RESTORED LOGIC START ---
  
  // Helper to get the last 7 days
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]); 
    }
    return dates;
  };

  // Process data for the chart
  const last7Days = getLast7Days();
  
  const chartData = last7Days.map(date => {
    const count = safeSchedules.filter(s => 
      s.date.startsWith(date) && (s.isCompleted || s.completed)
    ).length;

    const displayDate = date.substring(5); // e.g., "12-10"

    return {
      name: displayDate, 
      workouts: count
    };
  });
  // --- RESTORED LOGIC END ---

  return (
    <div className="card" style={{ height: "350px", display: "flex", flexDirection: "column" }}>
      <h3 style={{ margin: "0 0 10px 0" }}>📊 Weekly Consistency</h3>
      <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "20px" }}>
        Completed workouts in the last 7 days
      </p>
      
      {/* The Container with strict height */}
      <div style={{ flex: 1, width: "100%", minHeight: "200px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6B7280' }} 
              dy={10} 
            />
            <YAxis 
              allowDecimals={false} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6B7280' }} 
            />
            <Tooltip 
              cursor={{ fill: '#F3F4F6' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            />
            <Bar 
              dataKey="workouts" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]} 
              barSize={30} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WorkoutChart;
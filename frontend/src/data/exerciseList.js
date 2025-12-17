// 1. LIST FOR AUTOCOMPLETE (Individual Exercises)
export const commonExercises = [
  "Bench Press", "Squat", "Deadlift", "Overhead Press",
  "Pull Ups", "Dumbbell Rows", "Lunges", "Leg Press", 
  "Tricep Dips", "Bicep Curls", "Lateral Raises", "Plank", 
  "Pushups", "Bodyweight Squats", "Burpees", "Glute Bridges",
  "Mountain Climbers", "Russian Twists", "Jump Rope",
  "Hammer Curls", "Skullcrushers", "Leg Extensions", "Calf Raises"
];

// 2. SMART TEMPLATES (Friendly Names)
export const workoutTemplates = {
  // --- STRENGTH & MUSCLE ---
  "Chest Day": [
    { name: "Bench Press", sets: 4, reps: 10 },
    { name: "Incline Dumbbell Press", sets: 3, reps: 10 },
    { name: "Pushups", sets: 3, reps: 15 },
    { name: "Tricep Dips", sets: 3, reps: 12 }
  ],
  "Leg Day": [
    { name: "Squats", sets: 4, reps: 10 },
    { name: "Lunges", sets: 3, reps: 12 },
    { name: "Leg Press", sets: 3, reps: 12 },
    { name: "Calf Raises", sets: 4, reps: 15 }
  ],
  "Arm Day": [
    { name: "Bicep Curls", sets: 4, reps: 12 },
    { name: "Tricep Dips", sets: 4, reps: 12 },
    { name: "Hammer Curls", sets: 3, reps: 12 },
    { name: "Skullcrushers", sets: 3, reps: 10 }
  ],
  "Back & Biceps": [
    { name: "Pull Ups", sets: 3, reps: 8 },
    { name: "Dumbbell Rows", sets: 3, reps: 10 },
    { name: "Lat Pulldowns", sets: 3, reps: 12 },
    { name: "Bicep Curls", sets: 3, reps: 12 }
  ],
  "Shoulder Day": [
    { name: "Overhead Press", sets: 4, reps: 10 },
    { name: "Lateral Raises", sets: 3, reps: 15 },
    { name: "Front Raises", sets: 3, reps: 12 },
    { name: "Face Pulls", sets: 3, reps: 15 }
  ],

  // --- CARDIO & FAT LOSS ---
  "Full Body HIIT": [
    { name: "Burpees", sets: 3, reps: 15 },
    { name: "Mountain Climbers", sets: 3, reps: 30 },
    { name: "Jump Squats", sets: 4, reps: 15 },
    { name: "Plank", sets: 3, reps: 45 } // 45 seconds
  ],
  "Cardio Blast": [
    { name: "Jumping Jacks", sets: 3, reps: 50 },
    { name: "High Knees", sets: 3, reps: 40 },
    { name: "Jump Rope", sets: 3, reps: 50 },
    { name: "Burpees", sets: 3, reps: 10 }
  ],

  // --- BEGINNER ---
  "Full Body Beginner": [
    { name: "Bodyweight Squats", sets: 3, reps: 12 },
    { name: "Pushups", sets: 3, reps: 10 },
    { name: "Lunges", sets: 3, reps: 10 },
    { name: "Plank", sets: 3, reps: 30 }
  ]
};

// Export keys for the dropdown
export const commonRoutines = Object.keys(workoutTemplates);
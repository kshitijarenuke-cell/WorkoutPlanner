const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Import your existing functions + ADD 'generateWorkout'
const { 
    createWorkout, 
    getWorkouts, 
    scheduleWorkout, 
    getSchedule, 
    completeSchedule,
    deleteSchedule,
    generateWorkout // 👈 ADD THIS IMPORT
} = require('../controllers/workoutController');

// --- Routes ---
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const Workout = require('../models/Workout');

// 0. GENERATE (Connects to Onboarding)
// 👇 ADD THIS NEW ROUTE
router.post('/generate', protect, generateWorkout); 

// 1. Workout Templates (Create & View)
router.post('/', protect, createWorkout);
router.get('/', protect, getWorkouts);

// 2. Scheduling (Add to calendar & View calendar)
router.post('/schedule', protect, scheduleWorkout);
router.get('/schedule', protect, getSchedule);
// Get a single schedule by id (debugging helper)
router.get('/schedule/:id', protect, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate('workout');
    if (!schedule) return res.status(404).json({ message: 'Not found' });
    res.json(schedule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch schedule' });
  }
});

// 3. Actions (Mark Complete & Delete)
router.put('/schedule/:id', protect, completeSchedule); 
router.delete('/schedule/:id', protect, deleteSchedule); 


// backend/routes/workoutRoutes.js

// --- NEW: GENERATE ONBOARDING PLAN ---
router.post('/generate-onboarding', protect, async (req, res) => {
  const { age, weight, goal, fitnessLevel, equipment } = req.body;
  const userId = req.user._id;

  try {
    // 1. Update User Profile with Onboarding Data
    await User.findByIdAndUpdate(userId, {
      age, weight, goal, fitnessLevel, equipment,
      isOnboarded: true
    });

    // 2. Define Logic: Select Exercises based on Goal
    let workoutName = "First Day Kickoff";
    let exercises = [];

    if (goal === "Weight Loss") {
      workoutName = "Fat Burner Starter";
      exercises = [
        { name: "Jumping Jacks", sets: 3, reps: 30 },
        { name: "Burpees", sets: 3, reps: 10 },
        { name: "Mountain Climbers", sets: 3, reps: 20 },
        { name: "High Knees", sets: 3, reps: 30 }
      ];
    } else if (goal === "Muscle Gain") {
      workoutName = "Full Body Strength";
      exercises = [
        { name: "Push-ups", sets: 3, reps: 12 },
        { name: "Bodyweight Squats", sets: 4, reps: 15 },
        { name: "Lunges", sets: 3, reps: 12 },
        { name: "Plank", sets: 3, reps: "45 sec" }
      ];
    } else if (goal === "Endurance") {
      workoutName = "Stamina Builder";
      exercises = [
        { name: "Run / Jog", sets: 1, reps: "15 min" },
        { name: "Jump Rope", sets: 3, reps: "1 min" },
        { name: "Box Jumps", sets: 3, reps: 12 }
      ];
    } else {
      // Default / Flexibility
      workoutName = "Mobility & Flow";
      exercises = [
        { name: "Yoga Flow", sets: 1, reps: "10 min" },
        { name: "Cat-Cow Stretch", sets: 3, reps: 10 },
        { name: "Child's Pose", sets: 3, reps: "30 sec" }
      ];
    }

    // 3. Create the Schedule for TODAY
    // Get distinct YYYY-MM-DD for local time
    const dateObj = new Date();
    const offset = dateObj.getTimezoneOffset();
    const localDate = new Date(dateObj.getTime() - (offset * 60 * 1000));
    const todayStr = localDate.toISOString().split('T')[0];

    // Check if a plan already exists for today to avoid duplicates
    const existing = await Schedule.findOne({ user: userId, date: todayStr });
    
    if (!existing) {
      // Create the Workout document first
      const newWorkout = await Workout.create({
          user: userId,
          name: workoutName,
          type: goal || 'General',
          exercises: exercises
      });

      await Schedule.create({
        user: userId,
        date: todayStr,
        workout: newWorkout._id,
        isCompleted: false
      });
    }

    res.status(201).json({ message: "Plan generated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate plan" });
  }
});


module.exports = router;
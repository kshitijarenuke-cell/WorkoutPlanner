const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Schedule = require('../models/Schedule'); 

// @desc    Create a new workout template
// @route   POST /api/workouts
const createWorkout = asyncHandler(async (req, res) => {
    const { name, type, exercises } = req.body;
    const workout = await Workout.create({
        user: req.user.id,
        name,
        type,
        exercises
    });
    res.status(201).json(workout);
});

// @desc    Get all workout templates
// @route   GET /api/workouts
const getWorkouts = asyncHandler(async (req, res) => {
    const workouts = await Workout.find({ user: req.user.id });
    res.status(200).json(workouts);
});

// @desc    Schedule a workout for a specific date
// @route   POST /api/workouts/schedule
const scheduleWorkout = asyncHandler(async (req, res) => {
    const { workoutId, date } = req.body;
    
    // Create the schedule with 'isCompleted' default false
    const schedule = await Schedule.create({
        user: req.user.id,
        workout: workoutId,
        date: new Date(date),
        isCompleted: false 
    });
    res.status(201).json(schedule);
});

// @desc    Get scheduled workouts (Calendar)
// @route   GET /api/workouts/schedule
const getSchedule = asyncHandler(async (req, res) => {
    const { date } = req.query;
    let query = { user: req.user.id };
    
    if (date) {
        const start = new Date(date);
        start.setHours(0,0,0,0);
        const end = new Date(date);
        end.setHours(23,59,59,999);
        query.date = { $gte: start, $lte: end };
    }

    const schedule = await Schedule.find(query).populate('workout');
    res.status(200).json(schedule);
});

// @desc    Mark schedule as complete
// @route   PUT /api/workouts/schedule/:id
const completeSchedule = asyncHandler(async (req, res) => {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
        res.status(404);
        throw new Error('Schedule not found');
    }
    // Toggle the 'isCompleted' field
    schedule.isCompleted = !schedule.isCompleted; 
    await schedule.save();
    res.status(200).json(schedule);
});

// @desc    Delete a scheduled workout
// @route   DELETE /api/workouts/schedule/:id
const deleteSchedule = asyncHandler(async (req, res) => {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
        res.status(404);
        throw new Error('Schedule not found');
    }

    // Ensure the authenticated user owns this schedule
    if (schedule.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to delete this schedule');
    }

    // Log deletion for debugging
    console.log(`User ${req.user.id} requested delete for schedule ${req.params.id}`);

    // Use findByIdAndDelete for a clean removal and return the deleted id
    const deleted = await Schedule.findByIdAndDelete(req.params.id);
    if (!deleted) {
        res.status(500);
        throw new Error('Failed to delete schedule');
    }

    console.log(`Schedule ${req.params.id} deleted by user ${req.user.id}`);
    res.status(200).json({ id: req.params.id, message: 'Schedule deleted' });
});

// @desc    Generate a workout plan
// @route   POST /api/workouts/generate
const generateWorkout = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Workout generation endpoint" });
});

module.exports = {
    createWorkout,
    getWorkouts,
    scheduleWorkout,
    getSchedule,
    completeSchedule,
    deleteSchedule,
    generateWorkout
};
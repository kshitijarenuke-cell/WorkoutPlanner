const mongoose = require('mongoose');

const workoutSchema = mongoose.Schema({
    
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
         ref: 'User' 
        },
   
        name: { 
        type: String, 
        required: true 
    }, 
    // e.g., "Leg Day"
   
    type: {
         type: String,
          required: true 
        }, 
        // Strength, Cardio, etc.
   
        exercises: [{
        name: String,
        sets: Number,
        reps: String,
        duration: Number // in minutes (optional)
    }]
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);
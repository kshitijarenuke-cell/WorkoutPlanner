const mongoose = require('mongoose');

const scheduleSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    workout: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Workout'
    },
    date: {
        type: Date,
        required: true
    },
    // 👇 THIS WAS MISSING! Mongoose ignored your saves without this.
    isCompleted: { 
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
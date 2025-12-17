const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
         required: true 
        },
    email: { 
        type: String,
         required: true, 
         unique: true 
        },
    password: { 
        type: String, 
        required: true 
    },
    avatar: {
         type: String, 
         default: "https://api.dicebear.com/7.x/avataaars/svg?seed= Felix"
         },
    role: { 
        type: String,
         default: 'user' 
        },
    isOnboarded: {
        type: Boolean,
        default: false
    }

}, { timestamps: true 

});


module.exports = mongoose.model('User', userSchema);
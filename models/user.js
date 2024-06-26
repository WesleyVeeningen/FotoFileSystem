const mongoose = require('mongoose');

// Define user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
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
    token: {
        type: String,
        required: false
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false
    }
});

// Create User model
const User = mongoose.model('User', userSchema);

module.exports = User;

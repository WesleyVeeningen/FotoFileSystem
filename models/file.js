// models/file.js
const mongoose = require('mongoose');

// Define the file schema
const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    originDate: {
        type: Date,
        default: Date
    },
    folder: {
        type: String,
        ref: 'folders'
    },
    user: {
        type: String,
        ref: 'users'
    }
});

// Create the file model
const File = mongoose.model('File', fileSchema);

module.exports = File;

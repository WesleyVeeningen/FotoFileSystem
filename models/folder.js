const mongoose = require('mongoose');

// Define the schema for the Folder model
const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    user: {
        type: String,
        ref: 'users'
    }
});

// Create the Folder model using the schema
const Folder = mongoose.model('Folder', folderSchema);

// Export the Folder model
module.exports = Folder;

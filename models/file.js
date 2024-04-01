const mongoose = require('mongoose');

// Define the file schema
/**
 * Represents the schema for a file in the file system.
 *
 * @typedef {Object} FileSchema
 * @property {string} name - The name of the file.
 * @property {string} fileType - The type of the file.
 * @property {number} size - The size of the file in bytes.
 * @property {Date} createdAt - The date when the file schema was created.
 * @property {Date} uploadDate - The date when the file was uploaded.
 * @property {Date} originDate - The original date of the file.
 * @property {mongoose.Schema.Types.ObjectId} user - The reference to the user who owns the file.
 */
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
        ref: 'Folder'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Create the file model
const File = mongoose.model('File', fileSchema);

module.exports = File;
const mongoose = require('mongoose');


const personenSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const Personen = mongoose.model('Personen', personenSchema);

module.exports = Personen;

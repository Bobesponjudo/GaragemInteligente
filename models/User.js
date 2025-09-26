// --- START OF FILE models/User.js ---
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Garante que não haja emails duplicados
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);
// --- END OF FILE models/User.js ---
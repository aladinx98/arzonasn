const mongoose = require('mongoose');

const AddSchema = new mongoose.Schema({
    walletAddress: { type: String, required: true },
    refferralAddress: { type: String, required: true },
});

module.exports = mongoose.model('Add', AddSchema);

const mongoose = require('mongoose');

const addRamountSchema = new mongoose.Schema({
    walletAddress: { type: String, required: true },
    amount: { type: String, required: true },
    refferralAddress: { type: String, required: true },
    level: { type: String, required: true },
});

module.exports = mongoose.model('addRamount', addRamountSchema);

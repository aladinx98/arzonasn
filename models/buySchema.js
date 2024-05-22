const mongoose = require('mongoose');

const buySchema = new mongoose.Schema({
    userId: { type: Number },
    email: { type: String },
    buyAmount: { type: String},
    balARZ: { type: String},
    referral: { type: String },
    createdAt: { type: Date, default: Date.now }
});

buySchema.index({ userId: 0 }, { unique: false });

module.exports = mongoose.model('Buy', buySchema);

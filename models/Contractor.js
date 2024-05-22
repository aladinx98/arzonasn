const mongoose = require('mongoose');

const contractorSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    otp: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    referredBy: Number,
    walletAddress: String,
    referralAddress: String,
    status: { type: String, default: 'inactive' }
});

contractorSchema.pre('save', function (next) {
    if (!this.userId) {
        this.userId = Math.floor(100000 + Math.random() * 900000);
    }
    next();
});

// Method to update connected wallet address
contractorSchema.methods.connectWallet = function(walletAddress) {
    this.walletAddress = walletAddress;
    return this.save();
};

module.exports = mongoose.model('Contractor', contractorSchema);

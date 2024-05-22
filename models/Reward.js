const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  walletaddress: String,
  referraladdress: String,
  Ramount: Number,
  level: Number,
});

module.exports = mongoose.model('Reward', rewardSchema);
const express = require('express');
const router = express.Router();
const Contractor = require('../models/Contractor');
const Reward = require('../models/Reward');

router.post('/rewardadd', async (req, res) => {
    const { walletaddress, amount } = req.body;
    const where = { isDeleted: false };
  
    try {
      const walletaddressRefaralGetData = await Contractor.find(where);
  
      const rewardPercentages = [
        40, 20, 10, 5, 2.5, 1.25, 1.25, 1.25, 1.25, 1.25,
        1.25, 1.25, 1.25, 1.25, 1.25, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1
      ];
  
      let currentWalletAddress = walletaddress;
      let baseAmount = amount * 20 / 100;
  
      for (let level = 0; level < rewardPercentages.length; level++) {
        let referralAddress = null;
  
        for (let record of walletaddressRefaralGetData) {
          if (record.walletaddress === currentWalletAddress) {
            referralAddress = record.referraladdress;
            break;
          }
        }
  
        if (!referralAddress) {
          console.log(`No referral address found for level ${level + 1}`);
          break;
        }
  
        const rewardAmount = (baseAmount * rewardPercentages[level] / 100);
  
        const rewardData = {
          walletaddress: currentWalletAddress,
          referraladdress: referralAddress,
          Ramount: rewardAmount,
          level: level + 1
        };
  
        console.log(`Level ${level + 1} Reward Data`, rewardData);
  
        // Save the reward data to the database
        await Reward.create(rewardData);
  
        currentWalletAddress = referralAddress;
      }
  
      res.json({ messages: "Rewards added successfully" });
    } catch (error) {
      res.status(500).json({ messages: "Error adding rewards", error: error.message });
    }
  });

module.exports = router;
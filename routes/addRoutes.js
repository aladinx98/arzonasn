const express = require('express');
const Add = require('../models/add');
const addRamount = require('../models/addRamount');
const router = express.Router();

/*************************** addContractor ***************************/
router.post('/add', async (req, res) => {
    const { walletAddress, refferralAddress } = req.body;

    try {
        const newAdd = new Add({ walletAddress, refferralAddress });
        await newAdd.save();
        res.status(201).json(newAdd);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/listRamout', async (req, res) => {
    const walletAddress = req.body.walletAddress;
    const data = await addRamount.find({refferralAddress:walletAddress});
    console.log(data)
    try{
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/addReward', async (req, res) => {
    const walletAddress = req.body.walletAddress;
    const amount = req.body.amount;

    try {
        const walletaddressRefaralGetData = await Add.find();

        const rewardPercentages = [
            40, 20, 10, 5, 2.5, 1.25, 1.25, 1.25, 1.25, 1.25,
            1.25, 1.25, 1.25, 1.25, 1.25, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1
        ];

        let currentWalletAddress = walletAddress;
        let baseAmount = amount * 20 / 100;
        let messages = [];

        for (let level = 0; level < rewardPercentages.length; level++) {
            let referralAddress = null;

            for (let record of walletaddressRefaralGetData) {
                if (record.walletAddress === currentWalletAddress) {
                    referralAddress = record.refferralAddress;
                    break;
                }
            }

            if (!referralAddress) {
                messages.push(`No referral address found for level ${level + 1}, skipping this level`);
                break;
            }

            const rewardAmount = (baseAmount * rewardPercentages[level] / 100);

            const rewardData = await addRamount.create({
                walletAddress: currentWalletAddress,
                refferralAddress: referralAddress,
                amount: rewardAmount,
                level: level + 1
            });

            console.log(`Level ${level + 1} Reward Data`, rewardData);
            messages.push(`Level ${level + 1}: Deposit and Ramount added successfully`);

            currentWalletAddress = referralAddress;
        }

        res.status(201).json({ messages: messages.join('\n') });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});








module.exports = router;

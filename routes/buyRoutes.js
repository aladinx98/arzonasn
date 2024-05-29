// buyRoutes.js
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongoose').Types;
const Buy = require('../models/buySchema');
const User = require('../models/Contractor');
const authUser = require("../middleware/authUser");


router.post('/buys', async (req, res) => {
    try {
        const { userId, email, buyAmount, balARZ, referral, walletAddress } = req.body;

        // Create a new buy transaction
        const newBuy = new Buy({ userId, email, buyAmount, balARZ, referral, walletAddress });
        await newBuy.save();
        res.status(201).json({ message: 'Buy transaction created successfully', buy: newBuy });
    } catch (err) {
        console.error('Error creating buy transaction:', err);
        res.status(500).json({ error: 'Failed to create buy transaction' });
    }
});

router.post('/buyss', async (req, res) => {
    const walletAddress = req.body.walletAddress;
    const data = await Buy.find({walletAddress:walletAddress});
    console.log(data)
    try{
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;

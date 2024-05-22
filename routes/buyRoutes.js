// buyRoutes.js
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongoose').Types;
const Buy = require('../models/buySchema');
const User = require('../models/Contractor');
const authUser = require("../middleware/authUser");

// Route to create a new buy transaction
// router.post('/buys', async (req, res) => {
//     try {
//         const { userId, email, buyAmount, balARZ, referral } = req.body;
//         const newBuy = new Buy({ userId, email, buyAmount, balARZ, referral });
//         await newBuy.save();

//         res.status(201).json({ message: 'Buy transaction created successfully', buy: newBuy });
//     } catch (err) {
//         console.error('Error creating buy transaction:', err);
//         res.status(500).json({ error: 'Failed to create buy transaction' });
//     }
// });

router.post('/buys', async (req, res) => {
    try {
        const { userId, email, buyAmount, balARZ, referral } = req.body;

        // Create a new buy transaction
        const newBuy = new Buy({ userId, email, buyAmount, balARZ, referral });
        await newBuy.save();

        // Update the user document with the buy amount and balARZ
        // await User.findOneAndUpdate(
        //     { userId: userId }, // Assuming userId is unique in the user collection
        //     { $inc: { buyAmount: buyAmount, balARZ: balARZ } }, // Increment buyAmount and balARZ
        //     { new: true } // Return the updated user document
        // );

        res.status(201).json({ message: 'Buy transaction created successfully', buy: newBuy });
    } catch (err) {
        console.error('Error creating buy transaction:', err);
        res.status(500).json({ error: 'Failed to create buy transaction' });
    }
});



// Route to get all buy transactions
router.get('/buys', async (req, res) => {
    try {
        const buys = await Buy.find();
        res.status(200).json(buys);
    } catch (err) {
        console.error('Error fetching buy transactions:', err);
        res.status(500).json({ error: 'Failed to fetch buy transactions' });
    }
});

// Route to get a single buy transaction by userId
router.get('/buys/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const buy = await Buy.findOne({userId: userId});
        if (!buy) {
            return res.status(404).json({ message: 'Buy transaction not found' });
        }
        res.status(200).json(buy);
    } catch (err) {
        console.error('Error fetching buy transaction:', err);
        res.status(500).json({ error: 'Failed to fetch buy transaction' });
    }
});


// Route to update a buy transaction by userId
router.put('/buys/:userId', async (req, res) => {
    try {
        const { username, email, buyAmount, referral } = req.body;
        const updatedBuy = await Buy.findOneAndUpdate({ userId: req.params.userId }, 
            { username, email, buyAmount, referral }, { new: true });
        if (!updatedBuy) {
            return res.status(404).json({ message: 'Buy transaction not found' });
        }
        res.status(200).json({ message: 'Buy transaction updated successfully', buy: updatedBuy });
    } catch (err) {
        console.error('Error updating buy transaction:', err);
        res.status(500).json({ error: 'Failed to update buy transaction' });
    }
});

// Route to delete a buy transaction by userId
router.delete('/buys/:userId', async (req, res) => {
    try {
        const deletedBuy = await Buy.findOneAndDelete({ userId: req.params.userId });
        if (!deletedBuy) {
            return res.status(404).json({ message: 'Buy transaction not found' });
        }
        res.status(200).json({ message: 'Buy transaction deleted successfully', buy: deletedBuy });
    } catch (err) {
        console.error('Error deleting buy transaction:', err);
        res.status(500).json({ error: 'Failed to delete buy transaction' });
    }
});

module.exports = router;

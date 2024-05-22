const express = require('express');
const router = express.Router();
const contractorController = require('../controllers/contractorController');

router.post('/addContractor', contractorController.addContractor);
router.post('/rewardadd', contractorController.rewardadd);
router.get('/rewardList/:walletaddress', contractorController.rewardList);

module.exports = router;

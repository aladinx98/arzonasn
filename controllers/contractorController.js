const dbService = require('../services/dbService'); // Assume you have a dbService to interact with the database

// Handler to add a contractor
const addContractor = async (req, res) => {
  const walletaddress = req.body.walletaddress;
  const referraladdress = req.body.referraladdress;

  try {
    let UserAdd = await dbService.createOneRecord("contractorModel", req.body);
    console.log("UserAdd:", UserAdd);

    if (UserAdd && UserAdd.insertedId) {
      res.json({ messages: "User added successfully" });
    } else {
      res.json({ messages: "User not added" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handler to add a reward
const rewardadd = async (req, res) => {
  const walletaddress = req.body.walletaddress;
  const amount = req.body.amount;

  const where = {
    isDeleted: false
  };

  try {
    const walletaddressRefaralGetData = await dbService.findAllRecords("contractorModel", where);
    console.log("walletaddressRefaralGetData", walletaddressRefaralGetData);

    const rewardPercentages = [
      40, 20, 10, 5, 2.5, 1.25, 1.25, 1.25, 1.25, 1.25,
      1.25, 1.25, 1.25, 1.25, 1.25, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1
    ];

    let currentWalletAddress = walletaddress;
    let baseAmount = amount * 20 / 100; // Use the correct variable name
    let messages = [];

    console.log(`Initial Wallet Address: ${currentWalletAddress}`);
    console.log(`Initial Amount: ${amount}`);
    console.log(`Base Amount for Calculation: ${baseAmount}`);

    // Check if the initial wallet address exists in the data
    const initialRecord = walletaddressRefaralGetData.find(record => record.walletaddress === currentWalletAddress);
    if (!initialRecord) {
      messages.push(`Initial wallet address ${currentWalletAddress} not found in the system.`);
      return res.json({ messages: messages.join('\n') });
    }

    for (let level = 0; level < rewardPercentages.length; level++) {
      let referralAddress = null;

      for (let record of walletaddressRefaralGetData) {
        if (record.walletaddress === currentWalletAddress) {
          referralAddress = record.referraladdress;
          break;
        }
      }

      if (!referralAddress) {
        messages.push(`No referral address found for level ${level + 1} (current wallet address: ${currentWalletAddress}), skipping this level`);
        break;
      }

      const rewardAmount = (baseAmount * rewardPercentages[level] / 100);

      const rewardData = {
        walletaddress: currentWalletAddress,
        referraladdress: referralAddress,
        Ramount: rewardAmount,
        level: level + 1
      };

      console.log(`Level ${level + 1} Reward Data:`, rewardData);

      // Save the reward data to the database
      const data = await dbService.createOneRecord("rewardaddModel", rewardData);
      console.log("Data saved to rewardaddModel:", data);

      if (data && data.insertedId) {
        messages.push(`Level ${level + 1}: Deposit and Ramount added successfully`);
      } else {
        messages.push(`Level ${level + 1}: Deposit not added`);
      }

      currentWalletAddress = referralAddress;
    }

    res.json({ messages: messages.join('\n') });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handler to list rewards
const rewardList = async (req, res) => {
  const walletaddress = req.params.walletaddress;

  try {
    const rewards = await dbService.findAllRecords("rewardaddModel", { walletaddress });
    res.json(rewards);
  } catch (error) {
    res.status (500).json({ error: error.message });
  }
};

module.exports = {
  addContractor,
  rewardadd,
  rewardList
};

const express = require("express");
const User = require("../models/Contractor");
const Adds = require('../models/add');
var ejs = require("ejs");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const authUser = require("../middleware/authUser");
const nodemailer = require("nodemailer");
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const router = express.Router();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.PASSWORD,
//   },
//   tls: {
//     rejectUnauthorized: false
//   }
// });


const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

router.post("/sendOTP", async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Verification OTP",
    text: `Your OTP for registration is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

router.post("/verifyOTP", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email, otp });
    if (user) {
      user.otp = null;
      await user.save();
      res.status(200).json({ message: "OTP verified successfully" });
      ejs.renderFile(
        __dirname + '/verify.ejs',
        {
          name: 'info@arzonachain.com',
          username: user.username,
          userid: user.userId,
        },
        async function (err, mail) {
          if (err) {
            console.error('Error rendering EJS template:', err);
            return res.status(500).send('Server error');
          }

          // Send OTP to the user's email
          const mailOptions = {
            from: "info@arzonachain.com",
            to: email,
            subject: 'Your account created successfully',
            html: mail,
          };

          await transporter.sendMail(mailOptions);
        }
      );
    } else {
      res.status(401).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});


router.post('/signup', async (req, res) => {
  const { username, email, referredBy, password } = req.body;

  try {
    // Generate OTP and hash the password
    const otp = Math.floor(100000 + Math.random() * 900000);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Find the referred user
    let referralAddress = '';
    if (referredBy) {
      const referredUser = await User.findOne({ userId: referredBy });
      if (referredUser) {
        referralAddress = referredUser.walletAddress;
      } else {
        return res.status(400).json({ error: 'Referred user not found' });
      }
    }

    // Render OTP email using EJS template
    ejs.renderFile(
      __dirname + '/otp.ejs',
      {
        name: 'info@arzonachain.com',
        action_url: otp,
        username: username,
      },
      async function (err, mail) {
        if (err) {
          console.error('Error rendering EJS template:', err);
          return res.status(500).send('Server error');
        }

        // Send OTP to the user's email
        const mailOptions = {
          from: "info@arzonachain.com",
          to: email,
          subject: 'Verification OTP',
          html: mail,
        };

        await transporter.sendMail(mailOptions);

        // Create and save the new user
        const newUser = new User({
          username,
          email,
          referralAddress,
          referredBy,
          password: hashedPassword,
          otp,
        });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully', userId: newUser.userId });
      }
    );
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.get("/user", authUser, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});


router.post("/connectWallet", authUser, async (req, res) => {
  const { walletAddress, refferralAddress, status } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ message: "Wallet address is required" });
  }

  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingUser = await User.findOne({ walletAddress });
    if (existingUser) {
      return res.status(400).json({ message: "Wallet address is already in use by another user" });
    }

    user.status = status;
    user.walletAddress = walletAddress;
    await user.save();

    // console.log(`User updated: ${JSON.stringify(user)}`);

    await Adds.create({ walletAddress, refferralAddress });

    // console.log(`Added to Adds: walletAddress=${walletAddress}, referralAddress=${refferralAddress}`);

    res.json({ message: "Wallet address updated successfully" });
  } catch (error) {
    console.error('Error updating wallet address:', error);
    res.status(500).json({ message: "Error updating wallet address", error: error.message });
  }
});


router.post("/login-with-userid", async (req, res) => {
  const { userId, password } = req.body;

  try {
    // Find user by userId
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }
    // Return token and message
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ message: "OTP sent successfully", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { userId } = req.body;

  try {
    // Find user by userId
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    ejs.renderFile(
      __dirname + '/forget.ejs',
      {
<<<<<<< HEAD
        name: 'info@arzonachain.com',
=======
        name: 'arzonateam@gmail.com',
>>>>>>> a05ce8e087a7750345897b9964f660a078cfe134
        action_url: otp,
        userId: userId,
      },
      async function (err, mail) {
        if (err) {
          console.error('Error rendering EJS template:', err);
          return res.status(500).send('Server error');
        }


        // Send OTP to user's email
        const mailOptions = {
<<<<<<< HEAD
          from: "info@arzonachain.com",
=======
          from: process.env.EMAIL,
>>>>>>> a05ce8e087a7750345897b9964f660a078cfe134
          to: user.email,
          subject: 'Forget Password Mail',
          html: mail
        };

        await transporter.sendMail(mailOptions);

        // Store OTP in the user document
        user.otp = otp;
        await user.save();
        // Return success message
        res.status(200).json({ message: 'OTP sent successfully' });
      }
    );

  } catch (error) {
    console.error('Error sending OTP for password reset:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/reset-password', async (req, res) => {
  const { userId, otp, newPassword } = req.body;

  try {
    // Find user by userId and OTP
    const user = await User.findOne({ userId, otp });

    if (!user) {
      return res.status(404).json({ error: 'User not found or invalid OTP' });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password
    user.password = hashedPassword;
    // Clear the OTP after password reset
    user.otp = null;
    await user.save();

    // Return success message
    res.status(200).json({ message: 'Password reset successful' });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

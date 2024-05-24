const express = require("express");
const User = require("../models/Contractor");
var ejs = require("ejs");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const authUser = require("../middleware/authUser");
const nodemailer = require("nodemailer");
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
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
          name: 'arzonateam@gmail.com',
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
            from: process.env.EMAIL,
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

//   router.post('/signup', async (req, res) => {
//     const { username, email, referredBy, password } = req.body;

//     try {
//         const otp = Math.floor(100000 + Math.random() * 900000);
//         const saltRounds = 10;
//         const hashedPassword = await bcrypt.hash(password, saltRounds);
//         const mailOptions = {
//             from: process.env.EMAIL,
//             to: email,
//             subject: 'Verification OTP',
//             text: `Your OTP for registration is: ${otp}`
//         };
//         await transporter.sendMail(mailOptions);
//         const newUser = new User({ username, email, referredBy, password: hashedPassword, otp });
//         await newUser.save();

//         res.status(201).json({ message: 'User created successfully', userId: newUser.userId });
//     } catch (err) {
//         console.error('Error creating user:', err);
//         res.status(500).json({ error: 'Failed to create user' });
//     }
// });

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
        name: 'arzonateam@gmail.com',
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
          from: process.env.EMAIL,
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
    const userId = req.userId; // Assuming authUser middleware sets req.userId
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

//   router.get('/users', async (req, res) => {
//     try {
//         const users = await User.find().select('-password -otp');
//         res.status(200).json(users);
//     } catch (error) {
//         console.error('Error fetching users data:', error);
//         res.status(500).json({ error: 'Failed to fetch users data' });
//     }
// });

router.post("/connectWallet", authUser, async (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ message: "Wallet address is required" });
  }

  try {
    // Find the user by their ID
    const user = await User.findById(req.userId); // Assuming authUser middleware sets req.userId

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user already has a wallet address
    if (user.walletAddress) {
      return res
        .status(400)
        .json({ message: "Wallet address has already been connected" });
    }

    // Update the user's wallet address
    user.walletAddress = walletAddress;
    await user.save();

    res.json({ message: "Wallet address updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating wallet address", error: error.message });
  }
});

router.post("/user/updateStatus", async (req, res) => {
  const { walletAddress, status } = req.body;

  try {
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.status = status;
    await user.save();

    res.send("Status updated successfully");
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (user) {
//       const match = await bcrypt.compare(password, user.password);
//       if (match) {
//         const token = jwt.sign({ userId: user._id }, JWT_ACCESS_SECRET, {
//           expiresIn: "1h",
//         });
//         res.status(200).json({ message: "Login successful", token });
//       } else {
//         res.status(401).json({ error: "Invalid username or password" });
//       }
//     } else {
//       res.status(401).json({ error: "Invalid username or password" });
//     }
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

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

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Send OTP to user's email
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Verification OTP",
      text: `Your OTP for login is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    // Store OTP in the database
    user.otp = otp;
    await user.save();

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

    // Send OTP to user's email
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Verification OTP for Password Reset',
      text: `Your OTP for password reset is: ${otp}`
    };

    await transporter.sendMail(mailOptions);

    // Store OTP in the user document
    user.otp = otp;
    await user.save();

    // Return success message
    res.status(200).json({ message: 'OTP sent successfully' });

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
// app.post('/logout', (req, res) => {
//     res.json({ message: 'Logout successful' });
//   });

// router.post("/reset-password", async (req, res) => {
//   const otp = Math.floor(Math.random() * 9000 + 1000);
//   const { email } = req.body;

//   if (!email) {
//     return res.status(403).json({
//       message: "Please fill all the fields",
//     });
//   }

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(403).json({
//         message: "User with this email does not exist",
//       });
//     } else {
//       user.otp = otp;
//       await user.save();
//       const mailData = {
//         from: process.env.EMAIL,
//         to: req.body.email,
//         subject: "Verification code for password reset",
//         text: null,
//         html: `<span>Your Verification code is ${otp}</span>`,
//       };

//       // Render the EJS template
//       ejs.renderFile(
//         __dirname + "/otp.ejs",
//         {
//           name: "donotreply.v4x.org",
//           action_url: otp,
//         },
//         async function (err, mail) {
//           if (err) {
//             console.error("Error rendering EJS template:", err);
//             return res.status(500).send("Server error");
//           }

//           // Send the email with the EJS template as HTML
//           const mailOptions = {
//             from: process.env.EMAIL,
//             to: req.body.email,
//             subject: "Verification code",
//             html: mail,
//           };

//           transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//               console.error("Error sending email:", error);
//               return res.status(500).send("Server error");
//             }
//             res.json({ message: "Otp has been sent successfully !" });
//           });
//         }
//       );
//     }
//   } catch (error) {
//     console.error("Error resetting password:", error);
//     res.status(500).send("Server error");
//   }
// });

// router.put("/verify-reset-otp", async (req, res) => {
//   try {
//     let salt = 10;
//     let hash_password = await bcrypt.hash(req.body.password, salt);
//     let IsValid = await User.findOne({
//       $and: [{ email: req.body.email }, { otp: req.body.otp }],
//     });
//     if (IsValid) {
//       await User.findOneAndUpdate(
//         { email: req.body.email },
//         { password: hash_password },
//         {
//           returnOriginal: false,
//         }
//       );
//       res
//         .status(200)
//         .json({ message: "You password have been changed successfully !" });
//     } else {
//       res.status(401).json({ message: "Wrong Otp !" });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

module.exports = router;

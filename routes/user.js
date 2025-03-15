const express = require("express");
const Router = express.Router();
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const User = require("../models/User");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/checkAuth");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

Router.post("/signup", async (req, res) => {
  try {
    const existing_User = await User.findOne({ email: req.body.email });
    if (existing_User  !== null)
    {
      return res.status(400).json({ error:true ,reason: "Email already exists" });
    }
   
     const hashCode = await bcrypt.hash(req.body.password, 10);
     const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      channelName: req.body.channelName,
      email: req.body.email,
      phone: req.body.phone,
      password: hashCode,
   
    });

    const user = await newUser.save();
    res.status(200).json({error:false, newUser: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
      error: err,
    });
  }
});

Router.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    const users = await User.find({ email: req.body.email });
    console.log(users);
    if (users.length == 0) {
      return res.status(400).json({ error:true, reason: "Email is not registered" });
    }

    const isValid = await bcrypt.compare(req.body.password, users[0].password );

    if (!isValid) {
      return res.status(400).json({ error:true, reason: "Incorrect password" });
    }

    const token = jwt.sign(
      {
        _id: users[0]._id,
        channelName: users[0].channelName,
        email: users[0].email,
        phone: users[0].phone,
        logoId: users[0].logoId,
      },
      'rishab secret key',
      { expiresIn: '365d' } 
    );
    
    res.status(200).json({
      error:false, 
      _id: users[0]._id,
      channelName: users[0].channelName,
      email: users[0].email,
      phone: users[0].phone,
      logoId: users[0].logoId,
      logoUrl: users[0].logoUrl,
      subscribers: users[0].subscribers,
      subscribedChannels: users[0].subscribedChannels,
      token: token,
    });
    
    
    
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
      error: err,
    });
  }
});

// Subscribe api
Router.put('/subscribe/:userBId', checkAuth, async (req, res) => {
  try {
    // Extract and verify token
    const token = req.headers.authorization.split(" ")[1];
    const userA = await jwt.verify(token, "rishab secret key");
    console.log(userA);

    // Find userB (the user to be subscribed to)
    const userB = await User.findById(req.params.userBId);
    console.log(userB);

    // Check if already subscribed
    if (userB.subscribedBy.includes(userA._id)) {
      return res.status(400).json({
        error:true, reason: 'You are already subscribed to this user',
      });
    }

    // Update userB's subscriber count and subscribedBy list
    userB.subscribers += 1;
    userB.subscribedBy.push(userA._id);
    await userB.save();

    // Update userA's subscribedChannels list
    const userAfullInformation = await User.findById(userA._id);
    userAfullInformation.subscribedChannels.push(userB._id);
    await userAfullInformation.save();

    // Send success response
    res.status(200).json({
      error:false,
      msg: 'Subscribed',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

// APi for Unsubscribe Channel 
Router.put('/unsubscribe/:userBId', checkAuth, async (req, res) => {
  try {
    // Extract and verify token
    const token = req.headers.authorization.split(" ")[1];
    const userA = await jwt.verify(token, "rishab secret key");
    console.log(userA);

    // Find userB (the user to unsubscribe from)
    const userB = await User.findById(req.params.userBId);
    console.log(userB);

    // Check if userA is actually subscribed to userB
    if (!userB.subscribedBy.includes(userA._id)) {
      return res.status(400).json({
        error:true, reason: 'You are not subscribed to this user',
      });
    }

    // Remove userA from userB's subscribedBy list and decrease subscriber count
    userB.subscribers -= 1;
    userB.subscribedBy = userB.subscribedBy.filter(id => id.toString() !== userA._id.toString());
    await userB.save();

    // Remove userB from userA's subscribedChannels list
    const userAfullInformation = await User.findById(userA._id);
    userAfullInformation.subscribedChannels = userAfullInformation.subscribedChannels.filter(
      id => id.toString() !== userB._id.toString()
    );
    await userAfullInformation.save();

    // Send success response
    res.status(200).json({
      error:false,
      msg: 'Unsubscribed successfully',
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});







module.exports = Router;

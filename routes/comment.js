const express = require('express');
const Router = express.Router();
const Comment = require('../models/Comment');
const mongoose = require('mongoose'); 
const jwt = require('jsonwebtoken');
const checkAuth = require("../middleware/checkAuth");



Router.post('/new-comment/:videoId',checkAuth, async (req, res) => {
  try {
    // Extract token
    console.log("Hello");
    const token = req.headers.authorization.split(" ")[1];
    const verifiedUser = jwt.verify(token, "rishab secret key"); 
    console.log(verifiedUser);

    // Create a new comment
    const newComment = new Comment({
      _id: new mongoose.Types.ObjectId,
      videoId: req.params.videoId,
      userId: verifiedUser._id,
      commentText: req.body.commentText
    });

    // Save the comment
    await newComment.save(); 

    // Send success response
    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({error:true,  reason: err.message });
  }
});

// Get all comments for any video
Router.get('/:videoId', async (req, res) => {
  try {
    const comments = await Comment.find({ videoId: req.params.videoId }).populate('userId','channelName logoUrl');
    res.status(200).json({ error:false,commentList: comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


// update the comments 
Router.put('/:commentId', checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const verifiedUser = jwt.verify(token, 'rishab secret key');
    console.log(verifiedUser);

    const comment = await Comment.findById(req.params.commentId);
    console.log(comment);

    if (comment.userId != verifiedUser._id) { 
      return res.status(403).json({ message: 'Invalid User' });
    }

    comment.commentText = req.body.commentText;
    await comment.save();
    
    res.status(200).json({error:false, message: 'Comment updated successfully', comment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'You are not authorized to perform this action' });
  }
});

// Delete comment
Router.delete('/:commentId', checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const verifiedUser = jwt.verify(token, 'rishab secret key');
    console.log(verifiedUser);

    const comment = await Comment.findById(req.params.commentId);
    console.log(comment);

    if (comment.userId != verifiedUser._id) { 
      return res.status(403).json({ message: 'Invalid User' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    
    res.status(200).json({error:false, message: 'Comment deleted successfully' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'You are not authorized to perform this action' });
  }
});








module.exports = Router;

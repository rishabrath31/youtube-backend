const express = require("express");
const Router = express.Router();
const checkAuth = require("../middleware/checkAuth");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const Video = require("../models/Video");
const mongoose = require("mongoose");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

Router.post("/upload", checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const user = await jwt.verify(token, "rishab secret key");

    const uploadedvideo = await cloudinary.uploader.upload(
      req.files.video.tempFilePath,
      { resource_type: "video" }
    );

    const uploadedThumbnail = await cloudinary.uploader.upload(
      req.files.thumbnail.tempFilePath
    );

    const newVideo = new Video({
      // ✅ FIXED: Changed video to Video
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      description: req.body.description,
      user_id: user._id,
      videoUrl: uploadedvideo.secure_url,
      videoId: uploadedvideo.public_id,
      thumbnailUrl: uploadedThumbnail.secure_url,
      thumbnailId: uploadedThumbnail.public_id,
      category: req.body.category,
      tags: req.body.tags.split(","),
    });

    const newUploadedVideoData = await newVideo.save();

    res.status(200).json({
      newVideo: newUploadedVideoData,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// update Video Detail
Router.put("/:videoId", checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verifiedUser = await jwt.verify(token, "rishab secret key");

    const video = await Video.findById(req.params.videoId);
    console.log(video);

    if (video.user_id == verifiedUser._id) {
      if (req.files) {
        // update thumbnail and text data
        await cloudinary.uploader.destroy(video.thumbnailId);

        const uploadedThumbnail = await cloudinary.uploader.upload(
          req.files.thumbnail.tempFilePath
        );

        const updatedData = {
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
          tags: req.body.tags.split(","),
          thumbnailUrl: uploadedThumbnail.secure_url,
          thumbnailId: uploadedThumbnail.public_id,
        };

        const updatedVideoDetail = await Video.findByIdAndUpdate(
          req.params.videoId,
          updatedData,
          { new: true }
        );

        res.status(200).json({ updatedVideo: updatedVideoDetail });
      } else {
        const updatedData = {
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
          tags: req.body.tags.split(","),
        };

        const updatedVideoDetail = await Video.findByIdAndUpdate(
          req.params.videoId,
          updatedData,
          { new: true }
        );

        res.status(200).json({ updatedVideo: updatedVideoDetail });
      }
    } else {
      return res.status(500).json({
        error: "You are not Verified User for video update",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Video API
Router.delete("/:videoId", checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verifiedUser = await jwt.verify(token, "rishab secret key");
    const video = await Video.findById(req.params.videoId);

    if (video.user_id == verifiedUser._id) {
      // Delete the video, thumbnail and data from database
      await cloudinary.uploader.destroy(video.thumbnailId);
      await cloudinary.uploader.destroy(video.videoId, {
        resource_type: "video",
      });
      const deletedResponse = await Video.findByIdAndDelete(req.params.videoId);
      res.status(200).json({ deletedResponse: deletedResponse });
    } else {
      return res.status(500).json({
        error: "You are not authorized to delete this video",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

// LIKE API
Router.put("/like/:videoId", checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verifiedUser = await jwt.verify(token, "rishab secret key");
    console.log(verifiedUser);
    const video = await Video.findById(req.params.videoId);
    console.log(video);
    if (video.likedBy.includes(verifiedUser._id)) {
      return res.status(500).json({
        error: "You have already liked this video",
      });
    }
    if (video.dislikedBy.includes(verifiedUser._id)) {
      video.dislikes -= 1;
      video.dislikedBy = video.dislikedBy.filter(
        (userId) => userId.toString() != verifiedUser._id
      );
    }

    video.likes += 1;
    video.likedBy.push(verifiedUser._id);
    await video.save();
    res.status(200).json({ msg: "Liked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

// Dislike API

Router.put("/dislike/:videoId", checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verifiedUser = await jwt.verify(token, "rishab secret key");
    console.log(verifiedUser);
    const video = await Video.findById(req.params.videoId);
    console.log(video);
    if (video.dislikedBy.includes(verifiedUser._id)) {
      return res.status(500).json({
        error: "You have already disliked this video",
      });
    }
    if (video.likedBy.includes(verifiedUser._id)) {
      video.likes -= 1;
      video.likedBy = video.likedBy.filter(
        (userId) => userId.toString() != verifiedUser._id
      );
    }

    video.dislikes += 1;
    video.dislikedBy.push(verifiedUser._id);
    await video.save();
    res.status(200).json({
      msg: "Disliked",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

// Views API
Router.put("/views/:videoId", async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    console.log(video);
    video.views += 1;
    await video.save();
    res.status(200).json({ msg: "Viewed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

Router.post("/videos", async (req, res) => {
  try {
    const { skip, limit } = req.body;

    const sortBy = {
      createdAt: -1,
    };

    const videos = await Video.find()
      .sort(sortBy)
      .skip(skip || 0)
      .limit(limit || 0);

    return res.status(200).json({ error: false, videos });
  } catch (error) {
    return res.status(500).json({ error: true, Error: error.message });
  }
});
module.exports = Router;

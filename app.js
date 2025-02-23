const express = require('express');
const app = express();
const mongoose = require('mongoose')
require('dotenv').config()
const userRoute = require('./routes/user')
const videoRoute = require('./routes/video')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const commentRoute = require('./routes/comment')


const connectWithDatabase = async () => {
  try 
  {
    const res = await mongoose.connect(process.env.MONGO_URI)
    console.log('Database connected successfully');
  }
  catch (err){
    console.log('Error connecting to database: ', err);
  }
}
connectWithDatabase()
app.use(bodyParser.json())
app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : '/tmp/'
}));


app.use('/user',userRoute);
app.use('/video',videoRoute);
app.use('/comment',commentRoute);

module.exports = app;

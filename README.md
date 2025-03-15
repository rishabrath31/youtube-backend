# Youtube-Backend
Backend (Node.js + Express.js)
Express.js – API routing
MongoDB (Atlas) – Database
Mongoose – MongoDB ODM
JWT – Authentication


USER

http://localhost:3000/user/signup  POST
http://localhost:3000/user/login   POST
http://localhost:3000/user/subscribe/:userBId  PUT
http://localhost:3000/user/unbscribe/:userBId  PUT


==============================================================

Video

http://localhost:3000/video/:videoId  PUT
http://localhost:3000/video/:videoId  DELETE
http://localhost:3000/video/like/:videoId   PUT
http://localhost:3000/video/dislike/:videoId   PUT
http://localhost:3000/video/videos   POST-GET ALL VIDEOS
================================================================================

Comment

http://localhost:3000/comment/new-comment/:videoId POST
http://localhost:3000/comment/:videoId GET-ALL COMMENTS for a single vdo
http://localhost:3000/comment/:commentID  PUT : update the comment 
http://localhost:3000/comment/:commentID  DELETE  comment 

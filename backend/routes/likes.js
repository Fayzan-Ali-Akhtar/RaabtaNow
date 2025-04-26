import express from "express";
import { toggleLike } from "../controllers/likes.js";
// import { toggleLike } from "../controllers/likeController.js";



const LikeRouter = express.Router();

// Toggle like/unlike
LikeRouter.post("/toggle/:jobId", toggleLike);

export default LikeRouter;

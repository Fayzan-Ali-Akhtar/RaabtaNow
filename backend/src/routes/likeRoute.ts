import express from "express";
import { toggleLike } from "../controllers/likeController";
// import { toggleLike } from "../controllers/likeController.js";



const LikeRouter = express.Router();

// Toggle like/unlike
LikeRouter.post("/toggle/:jobId", toggleLike);

export default LikeRouter;

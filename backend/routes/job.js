import express from "express"
import { getAllJobs, createPost, updatePost, deletePost, createJobPost, editJobPost,deleteJobPost, getAllJobPosts, getMyPosts,getMyJobPosts } from "../controllers/job.js";
import { join } from "path";

export const jobRouter = express.Router();

jobRouter.get('/getposts', getAllJobs);
jobRouter.post('/createpost', createPost);
jobRouter.patch('/update', updatePost);
jobRouter.delete('/delete/:id', deletePost);
jobRouter.post('/createjobpost',createJobPost);
jobRouter.patch('/updatejobpost',editJobPost);
jobRouter.delete('/deletejobpost/:id',deleteJobPost);
jobRouter.get('/getalljobposts',getAllJobPosts);
jobRouter.get("/myposts", getMyPosts);
jobRouter.get("/myjobposts", getMyJobPosts);

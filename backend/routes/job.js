import express from "express"
import { getAllJobs, createJob, updateJob, deleteJob } from "../controllers/job.js";

export const jobRouter = express.Router();

jobRouter.get('/', getAllJobs);
jobRouter.post('/create', createJob);
jobRouter.patch('/update', updateJob);
jobRouter.delete('/delete/:id', deleteJob);

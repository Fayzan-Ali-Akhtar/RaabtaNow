import express from "express"
import { getProfile, createProfile, updateProfile } from "../controllers/profileController";

export const profileRouter = express.Router();

profileRouter.get('/getprofile', getProfile);
profileRouter.patch('/updateprofile', updateProfile);
profileRouter.post('/create', createProfile);

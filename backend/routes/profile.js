import express from "express"
import { getUserProfile, createProfile } from "../controllers/profile.js";

export const profileRouter = express.Router();

profileRouter.get('/', getUserProfile);
profileRouter.post('/create', createProfile);

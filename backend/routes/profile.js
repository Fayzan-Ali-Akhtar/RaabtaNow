import express from "express"
import { getProfile, createProfile } from "../controllers/profile.js";

export const profileRouter = express.Router();

profileRouter.get('/', getProfile);
profileRouter.post('/create', createProfile);

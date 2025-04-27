import express from "express";
import {
  signup,
  login,
  confirmEmail,
  testUserAPI,      // ← now actually exported
} from "../controllers/userController";

const router = express.Router();

// SignUp Route
router.route("/signup").post(signup);

// Log In Route
router.route("/login").post(login);

// Confirm Email Route
router.route("/confirm").post(confirmEmail);

// Test route 
router.route("/test").get(testUserAPI);

export default router;
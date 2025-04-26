import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import User from "../models/user.js";
import { Profile } from "../models/profile.js";
import { saltRounds } from "../utils/config.js";
import { anyValueIsEmpty } from "../utils/validations.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

config({ path: "./config.env" });

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("🔵 Incoming signup data:", { name, email, password });

    // Debugging fields
    console.log("🧪 Debugging Fields:");
    console.log("- Name Empty:", anyValueIsEmpty(name));
    console.log("- Email Empty:", anyValueIsEmpty(email));
    console.log("- Password Empty:", anyValueIsEmpty(password));
    console.log("- Password Length:", password ? password.length : "No password");

    // Field Validations
    if (anyValueIsEmpty(name) || anyValueIsEmpty(email) || anyValueIsEmpty(password)) {
      console.warn("⚠️ Validation Failed: Missing fields");
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (name, email, password).",
      });
    }

    if (password.length < 8) {
      console.warn("⚠️ Validation Failed: Password too short");
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      console.warn("⚠️ User already exists with email:", email);
      return res.status(400).json({
        success: false,
        message: "Email already registered. Try another email.",
      });
    }

    // Encrypt password
    const encryptedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: encryptedPassword,
    });

    // ✨ Create default Profile immediately
    await Profile.create({
      user_id: newUser.id,
      full_name: name,
      contact_email: email,
      location: "",
      company: "",
      professional_headline: "",
      skills: [],
      working_experience: 0,
      bio: "",
      age : 0,
    });

    // Generate JWT Token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    console.log("✅ User and Profile created successfully:", { id: newUser.id, email: newUser.email, name: newUser.name });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
      token,
    });

  } catch (error) {
    console.error("❌ Error during user registration:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error during registration. Please try again later.",
    });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Logging in user with data:", req.body);

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No user found with this email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res
      .status(200)
      .json({ success: true, message: "Login successful", user, token });
  } catch (error) {
    console.error("Error in loginUser:", error);
    return res
      .status(500)
      .json({ success: false, message: "An error occurred while logging in" });
  }
};



export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No users found" });
    }
    return res.status(200).json({ success: true, message: "Users retrieved successfully", users });
  } catch (error) {
    console.error("Error in getUsers:", error);
    return res.status(500).json({ success: false, message: "An error occurred while fetching users" });
  }
}; 



export const updateUser = async (req, res) => {
  try {
    const { id, ...content } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "User ID is required for updating" });
    }

    if (anyValueIsEmpty(content)) {
      return res.status(400).json({ success: false, message: "Fields cannot be empty" });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "No user found with this ID" });
    }

    if (content.password) {
      content.password = await bcrypt.hash(content.password, saltRounds);
    }

    await user.update(content);

    return res
      .status(200)
      .json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    console.error("Error in updateUser:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while updating user",
      });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required for deletion" });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No user found with this ID" });
    }

    await user.destroy();

    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while deleting user",
      });
  }
};

export const requestPassReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Email not found." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // currently using 1 hour expiry duration

    await user.update({ resetToken: token, resetTokenExpiry: expiry });

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset - RaabtaNow",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    });

    return res.json({ message: "Password reset link sent." });
  } catch (err) {
    console.error("Error in requestPassReset", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({ where: { resetToken: token } });

    if (!user || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    });

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Error in resetPassword", err);
    res.status(500).json({ message: "Server error." });
  }
};



import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminAddUserToGroupCommand,
  InitiateAuthCommand,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { Request, Response } from "express";
import User from "../models/userModel";        // import your Sequelize User model
import { Profile } from "../models/profileModel"; // import your Profile model


// Initialize the Cognito client
const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

export const signup = async (req: any, res: any) => {
  console.log("Sign up request", req.body);
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: "name, email, password and group are required"
    });
  }

  try {
    // 1a. Sign up user in Cognito
    const signUpCmd = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "email", Value: email }],
    });
    const signUpResp = await cognito.send(signUpCmd);

    // 1b. Add user to group
    const addGroupCmd = new AdminAddUserToGroupCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      Username: email,
      GroupName: "candidate",
    });
    await cognito.send(addGroupCmd);

    // 2. Create user in your DB
    let newUser = await User.findOne({ where: { email } });
    if (!newUser) {
      const placeholderPassword = "**********";

      newUser = await User.create({
        name,
        email,
        password: placeholderPassword,
      });

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
        age: 0,
      });

      console.log("✅ User and Profile created successfully in DB");
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please confirm your email.",
      user: {
        id: newUser!.id,
        name: newUser!.name,
        email: newUser!.email
      }
      // No token returned at signup stage
    });

  } catch (err: any) {
    console.error("Signup/group error", err);
    const status = err.$metadata?.httpStatusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Signup failed"
    });
  }
};

//  2) Confirm Sign‑Up by email & code

export const confirmEmail = async (req: any, res: any) => {
  console.log("Confirm sign up request", req.body);
  const { email, confirmationCode } = req.body;
  if (!email || !confirmationCode) {
    return res
      .status(400)
      .json({ error: "email and confirmationCode are required" });
  }

  try {
    const cmd = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: email, // use email as the username
      ConfirmationCode: confirmationCode,
    });
    await cognito.send(cmd);
    res.json({ message: "User confirmed successfully." });
  } catch (err: any) {
    console.error("Confirm error", err);
    const status = err.$metadata?.httpStatusCode || 500;
    return res
      .status(status)
      .json({ error: err.message || "Confirmation failed" });
  }
};

// 3) Login endpoint
export const login = async (req: any, res: any) => {
  console.log("Login request", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "email and password are required" });
  }

  try {
    const cmd = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID!,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });
    const response = await cognito.send(cmd);

    const { AccessToken, IdToken, RefreshToken, ExpiresIn } = response.AuthenticationResult!;

    // Fetch user profile from your DB (optional but nicer)
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "No user found in database" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      tokens: {
        accessToken: AccessToken,
        idToken: IdToken,
        refreshToken: RefreshToken,
        expiresIn: ExpiresIn,
      }
    });

  } catch (err: any) {
    console.error("Login error", err);
    const status = err.$metadata?.httpStatusCode === 400 ? 401 : 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Authentication failed"
    });
  }
};

export const testUserAPI = async (_req: any, res: any) => {
  res.json({ message: "✅ Test User API is working!" });
};

export const getUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const users = await User.findAll();

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users
    });
    
  } catch (error) {
    console.error("Error in getUsers:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching users"
    });
  }
};

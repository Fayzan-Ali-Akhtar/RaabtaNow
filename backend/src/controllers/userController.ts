import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminAddUserToGroupCommand,
  InitiateAuthCommand,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

// Initialize the Cognito client
const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

export const signup = async (req: any, res: any) => {
  console.log("Sign up request", req.body);
  const { email, password, group } = req.body;
  if (!email || !password || !group) {
    return res
      .status(400)
      .json({ error: "email, password and group are required" });
  }

  try {
    // 1a. Create the user
    const signUpCmd = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "email", Value: email }],
    });
    const signUpResp = await cognito.send(signUpCmd);

    // 1b. Add them to the requested group
    const addGroupCmd = new AdminAddUserToGroupCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      Username: email,
      GroupName: group,
    });
    await cognito.send(addGroupCmd);

    res.json({
      message: "Sign‑up successful; check your email to confirm.",
      userSub: signUpResp.UserSub,
      codeDeliveryDetails: signUpResp.CodeDeliveryDetails,
      addedToGroup: group,
    });
  } catch (err: any) {
    console.error("Signup/group error", err);
    // return the error code and message
    const status = err.$metadata?.httpStatusCode || 500;
    return res.status(status).json({ error: err.message || "Signup failed" });
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
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    const cmd = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID!,
      AuthParameters: {
        USERNAME: email, // logging in with email
        PASSWORD: password,
      },
    });
    const response = await cognito.send(cmd);
    const { AccessToken, IdToken, RefreshToken, ExpiresIn } =
      response.AuthenticationResult!;
    res.json({ AccessToken, IdToken, RefreshToken, ExpiresIn });
  } catch (err: any) {
    console.error("Login error", err);
    const status = err.$metadata?.httpStatusCode === 400 ? 401 : 500;
    return res
      .status(status)
      .json({ error: err.message || "Authentication failed" });
  }
};

export const testUserAPI = async (_req: any, res: any) => {
  res.json({ message: "✅ Test User API is working!" });
};
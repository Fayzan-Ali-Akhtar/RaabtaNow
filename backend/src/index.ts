import express from 'express';
import 'dotenv/config';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  ConfirmSignUpCommand
} from '@aws-sdk/client-cognito-identity-provider';


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize the Cognito client
const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION
});

// Health check
app.get('/', (_req, res) => {
  res.send('✅ Backend is working!');
});

// Test route
app.get('/api/test', (_req, res) => {
  res.send('✅ Backend test is working!');
});

// 1) Sign Up endpoint
app.post('/api/signup', async (req:any, res:any) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'username, email and password are required' });
  }

  try {
    console.log('Sign up request', req.body);
    const cmd = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email }
      ]
    });
    const response = await cognito.send(cmd);
    res.json({
      message: 'Sign‑up successful, please check your email to confirm.',
      userSub: response.UserSub,
      codeDeliveryDetails: response.CodeDeliveryDetails
    });
  } catch (err: any) {
    console.error('Signup error', err);
    res.status(500).json({ error: err.message || err });
  }
});

//  2) Confirm Sign‑Up by email & code

app.post(
  '/api/confirm',
  async (
    req:any, res:any
  ) => {
    console.log('Confirm sign up request', req.body);
    const { email, confirmationCode } = req.body;
    if (!email || !confirmationCode) {
      return res
        .status(400)
        .json({ error: 'email and confirmationCode are required' });
    }

    try {
      const cmd = new ConfirmSignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID!,
        Username: email,            // use email as the username
        ConfirmationCode: confirmationCode
      });
      await cognito.send(cmd);
      res.json({ message: 'User confirmed successfully.' });
    } catch (err: any) {
      console.error('Confirm error', err);
    }
  }
);

// 3) Login endpoint
app.post('/api/login', async (req:any, res:any) => {
  console.log('Login request', req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: 'email and password are required' });
  }

  try {
    const cmd = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.COGNITO_CLIENT_ID!,
      AuthParameters: {
        USERNAME: email,      // logging in with email
        PASSWORD: password
      }
    });
    const response = await cognito.send(cmd);
    const { AccessToken, IdToken, RefreshToken, ExpiresIn } =
      response.AuthenticationResult!;
    res.json({ AccessToken, IdToken, RefreshToken, ExpiresIn });
  } catch (err: any) {
    console.error('Login error', err);
  }
}
);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

import express from 'express';
import 'dotenv/config';
import cors from 'cors';

// Importing Routes
import userRouter from './routes/userRoute';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: '*'
}))

// Health check
app.get('/', (req:any, res:any) => {
  res.send('✅ Backend is working!');
});

// Test route
app.get('/api/test', (req:any, res:any) => {
  res.send('✅ Backend test is working!');
});

app.use(express.json());

// For User Routes
app.use('/api/user', userRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

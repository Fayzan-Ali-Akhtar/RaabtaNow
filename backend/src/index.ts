import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import sequelize from './db/database'; // ⬅️ corrected
import userRouter from './routes/userRoute';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: '*' }))
app.use(express.json())

// Health-check
app.get('/', async (req: any, res: any) => {
  try {
    await sequelize.authenticate(); // ⬅️ correct way for Sequelize
    return res.status(200).send(`✅ Backend is working! & ✅ Sequelize DB is working! Timestamp: ${new Date().toISOString()}`);
  } catch (err: any) {
    console.error('Health-check DB ping failed:', err);
    return res.status(500).send(`✅ Backend is working! & ❌ DB is not working! Timestamp: ${new Date().toISOString()}`);
  }
});

// Test route
app.get('/api/test', (req: any, res: any) => res.send('✅ Backend test is working!'));

// API routes
app.use('/api/user', userRouter);

// Start server
const start = async () => {
  try {
    await sequelize.authenticate(); // ⬅️ correct way
    console.log('✅ Connected to PostgreSQL');

    app.listen(port, () => {
      console.log(`🚀 Server listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to DB:', err);
    process.exit(1);
  }
};

start();

import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import sequelize from './db/database'; // ⬅️ corrected
import userRouter from './routes/userRoute';
import { jobRouter } from './routes/jobRoute';
import { profileRouter } from './routes/profileRoute';
import Resumerouter from './routes/resumeRoute';
import LikeRouter from './routes/likeRoute';
import CommentRouter from './routes/commentRoute';
import path from 'path';
import User from './models/userModel';
import Job from './models/jobModel';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: '*' }))
app.use(express.json())

// Middleware to parse form-data (for file uploads)
app.use(express.urlencoded({ extended: true }));

User.hasMany(Job, { foreignKey: 'author_id', as: 'jobs' });
Job.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

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

// Routes
// app.use('/api', userRouter);
app.use('/api', jobRouter); //---> uncomment when token logit added
// app.use('/api', jobRouter);

app.use('/api',  profileRouter);

app.use('/api',  Resumerouter);
app.use('/api',LikeRouter);
app.use("/api",CommentRouter)

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Test route
app.get('/api', (req: any, res: any) => res.send('✅ Backend test is working!'));

// API routes
app.use('/api', userRouter);


// Test route that always returns 500
app.get('/api/error', (_req, res) => {
  res.status(500).send('❌ Intentional server error');
});

const start = async () => {
  try {
    await sequelize.authenticate(); // Connect to the database
    console.log('✅ Connected to PostgreSQL');

    await sequelize.sync({ alter: true }); // 🔥 Sync the models to DB
    console.log('✅ All tables synced with DB');

    app.listen(port, () => {
      console.log(`🚀 Server listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to DB:', err);
    process.exit(1);
  }
};


start();

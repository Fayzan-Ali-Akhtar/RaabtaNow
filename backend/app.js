import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { userRouter } from "./routes/user.js";
import { jobRouter } from './routes/job.js';
import sequelize from './db/database.js'; 
import { verifyToken } from './middleware/auth.js';
import { profileRouter } from './routes/profile.js';
import User from './models/user.js';
import Job from './models/job.js';
import Resumerouter from './routes/resume.js';
import path from "path";
import LikeRouter from './routes/likes.js';
import CommentRouter from './routes/comments.js';

import "./models/associations.js";



config({ path: './config.env' });
// await sequelize.sync({ force: false }); // no drop
 
const app = express();

app.use(cors());  

// middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse form-data (for file uploads)
app.use(express.urlencoded({ extended: true }));

User.hasMany(Job, { foreignKey: 'author_id', as: 'jobs' });
Job.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// test api
app.get("/hello", (req, res) => {
  res.send("Welcome to the Job Portal API");
})

// Routes
app.use('/api', userRouter);
app.use('/api', verifyToken, jobRouter); //---> uncomment when token logit added
// app.use('/api', jobRouter);

app.use('/api', verifyToken, profileRouter);

app.use('/api', verifyToken, Resumerouter);
app.use('/api',verifyToken,LikeRouter);
app.use("/api",verifyToken,CommentRouter)

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const PORT = process.env.PORT || 9000; 
const isLocal = process.env.DB_ENV === "local";
const dbConnection = isLocal ? "localhost" : "remotehost";
 
sequelize.sync({force:true}) // Ensures models are synced with DB
  .then(() => {
    console.log("Database connected & synced successfully");
 
    app.listen(PORT, () => {
      console.log(`Server running at http://${dbConnection}:${PORT}`);
    }); 
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
 
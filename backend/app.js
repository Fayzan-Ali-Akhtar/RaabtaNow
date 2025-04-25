import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { userRouter } from "./routes/user.js";
import { jobRouter } from './routes/job.js';
import sequelize from './db/database.js'; 
import { verifyToken } from './middleware/auth.js';
import { profileRouter } from './routes/profile.js';


config({ path: './config.env' });
// await sequelize.sync({ force: false }); // no drop
 
const app = express();

app.use(cors());  

// middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse form-data (for file uploads)
app.use(express.urlencoded({ extended: true }));

// test api
app.get("/hello", (req, res) => {
  res.send("Welcome to the Job Portal API");
})

// Routes
app.use('/user', userRouter);
// app.use('/api', verifyToken, jobRouter); //---> uncomment when token logit added
app.use('/api', jobRouter);

app.use('/profile', verifyToken, profileRouter);

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
 
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import pool from './DB/connect'

// Importing Routes
import userRouter from './routes/userRoute';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: '*' }))
app.use(express.json())

// Health-check
// Health-check: does basic ping to the DB
app.get('/', async (req:any, res:any) => {
  try {
    // grab a client from the pool and do a no-op query
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();

    return res.status(200).send(`✅ Backend is working! & ✅ DB is working! Timestamp: ${new Date().toISOString()}`);
   
  } catch (err: any) {
    console.error('Health-check DB ping failed:', err);
    return res.status(500).send(`✅ Backend is working! & ❌ DB is not working! Timestamp: ${new Date().toISOString()}`);
  }
});


// Test route
app.get('/api/test', (req:any, res:any) => res.send('✅ Backend test is working!'))

// API routes
app.use('/api/user', userRouter)

// Before starting, verify we can actually talk to the DB
const start = async () => {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')   // a no-op ping
    client.release()
    console.log('✅ Connected to PostgreSQL')

    app.listen(port, () => {
      console.log(`🚀 Server listening on http://localhost:${port}`)
    })
  } catch (err) {
    console.error('❌ Failed to connect to DB:', err)
    process.exit(1)
  }
}

start()

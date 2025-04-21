import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('✅ Backend is working!');
});

app.get('/api/test', (_req, res) => {
  res.send('✅ Backend test is working!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

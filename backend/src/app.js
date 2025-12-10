// Startfil som kopplar ihop Express och gemensamt middleware.
require('dotenv').config();
const express = require('express');
const apiRouter = require('./routes');
const connectDB = require('./db');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

connectDB();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Tillåt frontend som körs på Vite (http://localhost:5173)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.send('Backend fungerar!');
});

// 404 för alla okända routes.
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});


// Enkel central felhanterare.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend kör på port ${PORT}`);
});

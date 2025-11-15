// Entry point that wires the Express app and shared middleware.
const express = require('express');
const apiRouter = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.send('Backend fungerar!');
});

app.listen(PORT, () => {
  console.log(`Backend kör på port ${PORT}`);
});

const express = require('express');
const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.send('Backend fungerar!');
});

app.listen(PORT, () => {
  console.log(`Backend kör på port ${PORT}`);
});

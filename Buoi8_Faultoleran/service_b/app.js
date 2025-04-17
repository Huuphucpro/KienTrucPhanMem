const express = require('express');
const app = express();
const port = 7002;

// CÁC CỜ ĐỂ MÔ PHỎNG LỖI
const SIMULATE_DELAY = true;
const SIMULATE_ERROR = true;

app.get('/data', (req, res) => {
  let delay = 0;
  if (SIMULATE_DELAY) {
    delay = [0, 2000, 5000][Math.floor(Math.random() * 3)]; // 0, 2, hoặc 5 giây
  }

  setTimeout(() => {
    if (SIMULATE_ERROR && Math.random() < 0.2) {
      return res.status(500).json({ message: 'Simulated Internal Server Error' });
    }
    res.json({ data: 'Data from Service B' });
  }, delay);
});

app.listen(port, () => {
  console.log(`Service B listening on port ${port}`);
});
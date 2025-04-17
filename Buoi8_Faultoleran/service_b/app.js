const express = require('express');
const app = express();
const port = 5002;

app.get('/data', (req, res) => {
  // Mô phỏng độ trễ
  const delay = [0, 2000, 5000][Math.floor(Math.random() * 3)]; // 0, 2, hoặc 5 giây
  setTimeout(() => {
    // Mô phỏng lỗi (có thể trả về lỗi 500)
    if (Math.random() < 0.2) { // 20% khả năng lỗi
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.json({ data: 'Data from Service B' });
  }, delay);
});

app.listen(port, () => {
  console.log(`Service B listening on port ${port}`);
});
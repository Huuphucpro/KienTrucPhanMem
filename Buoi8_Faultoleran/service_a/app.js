const express = require('express');
const axios = require('axios');
const app = express();
const port = 5001;

const SERVICE_B_URL = 'http://localhost:5002/data';

// Cấu hình Retry
const retry = {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000, // 1s, 2s, 3s...
  retryCondition: (error) => error.response.status === 500,
};

// Cấu hình Circuit Breaker (đơn giản - có thể dùng `opossum`)
const circuitBreaker = {
  threshold: 3,
  timeout: 10000, // 10 giây
  resetTimeout: 30000, // 30 giây để thử lại
  open: false,
  failures: 0,
  lastFailureTime: 0,
};

// Cấu hình Rate Limiter (đơn giản - có thể dùng `express-rate-limit`)
const rateLimit = {
  windowMs: 1000, // 1 giây
  max: 10,       // Tối đa 10 request
  count: 0,
  startTime: Date.now(),
};

// Cấu hình Time Limiter (axios có timeout)
const timeout = 1000; // 1 giây

app.get('/call-b', async (req, res) => {
  // Rate Limiter
  rateLimit.count++;
  if (Date.now() - rateLimit.startTime > rateLimit.windowMs) {
    rateLimit.count = 1;
    rateLimit.startTime = Date.now();
  }
  if (rateLimit.count > rateLimit.max) {
    return res.status(429).json({ message: 'Rate Limit Exceeded' });
  }

  // Circuit Breaker
  if (circuitBreaker.open) {
    if (Date.now() - circuitBreaker.lastFailureTime < circuitBreaker.resetTimeout) {
      return res.status(502).json({ message: 'Circuit Breaker Open' });
    } else {
      circuitBreaker.open = false;
      circuitBreaker.failures = 0;
    }
  }

  try {
    const response = await axios.get(SERVICE_B_URL, { timeout: timeout }); // Time Limiter
    res.json(response.data);
  } catch (error) {
    if (error.response && retry.retryCondition(error)) {
      if (retry.retries > 0) {
        retry.retries--;
        await new Promise(resolve => setTimeout(resolve, retry.retryDelay(3 - retry.retries)));
        return callServiceB(req, res); // Đệ quy để thử lại
      }
    }

    circuitBreaker.failures++;
    if (circuitBreaker.failures >= circuitBreaker.threshold) {
      circuitBreaker.open = true;
      circuitBreaker.lastFailureTime = Date.now();
    }
    res.status(500).json({ message: `Error calling Service B: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Service A listening on port ${port}`);
});
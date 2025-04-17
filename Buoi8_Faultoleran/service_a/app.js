const express = require('express');
const axios = require('axios');
const app = express();
const port = 7001;

const SERVICE_B_URL = 'http://localhost:7002/data';

// CÁC CỜ ĐỂ BẬT/TẮT CÁC KỸ THUẬT
const ENABLE_RETRY = true;
const ENABLE_CIRCUIT_BREAKER = false;
const ENABLE_RATE_LIMITER = false;
const ENABLE_TIME_LIMITER = true; // Timeout luôn nên bật

// Cấu hình Retry
const retry = {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) =>
    error.response && error.response.status === 500 ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ECONNRESET',
};

// Cấu hình Circuit Breaker
const circuitBreaker = {
  threshold: 3,
  resetTimeout: 10000,
  state: 'CLOSED',
  failureCount: 0,
  lastFailureTime: 0,
  halfOpenAttempts: 0,
  halfOpenMaxAttempts: 5, // Không dùng trong code đơn giản này
};

// Cấu hình Rate Limiter
const rateLimit = {
  windowMs: 1000,
  max: 5, // Giảm xuống để dễ test
  count: 0,
  startTime: Date.now(),
};

// Cấu hình Time Limiter
const timeout = 1000;

app.get('/call-b', async (req, res) => {
  // --- KHÔNG CÓ FAULT TOLERANCE NÀO ĐƯỢC BẬT ---
  if (!ENABLE_RETRY && !ENABLE_CIRCUIT_BREAKER && !ENABLE_RATE_LIMITER) {
    try {
      const response = await axios.get(SERVICE_B_URL, { timeout: ENABLE_TIME_LIMITER ? timeout : undefined });
      return res.json(response.data);
    } catch (error) {
      return res.status(500).json({ message: `No Fault Tolerance: ${error.message || error.toString()}` });
    }
  }

  // --- RATE LIMITER ---
  if (ENABLE_RATE_LIMITER) {
    rateLimit.count++;
    if (Date.now() - rateLimit.startTime > rateLimit.windowMs) {
      rateLimit.count = 1;
      rateLimit.startTime = Date.now();
    }
    if (rateLimit.count > rateLimit.max) {
      return res.status(429).json({ message: 'Rate Limit Exceeded' });
    }
  }

  // --- CIRCUIT BREAKER ---
  if (ENABLE_CIRCUIT_BREAKER) {
    if (circuitBreaker.state === 'OPEN') {
      if (Date.now() - circuitBreaker.lastFailureTime < circuitBreaker.resetTimeout) {
        return res.status(502).json({ message: 'Circuit Breaker Open' });
      } else {
        circuitBreaker.state = 'HALF_OPEN';
        circuitBreaker.halfOpenAttempts = 0;
      }
    }
  }

  // --- GỌI SERVICE B VÀ XỬ LÝ LỖI ---
  try {
    const response = await axios.get(SERVICE_B_URL, { timeout: ENABLE_TIME_LIMITER ? timeout : undefined });
    if (ENABLE_CIRCUIT_BREAKER) {
      circuitBreaker.state = 'CLOSED';
      circuitBreaker.failureCount = 0;
    }
    return res.json(response.data);
  } catch (error) {
    // --- RETRY ---
    if (ENABLE_RETRY && retry.retryCondition(error) && retry.retries > 0) {
      retry.retries--;
      await new Promise(resolve => setTimeout(resolve, retry.retryDelay(3 - retry.retries)));
      return callServiceB(req, res); // Đệ quy để thử lại
    }

    // --- CIRCUIT BREAKER (CẬP NHẬT TRẠNG THÁI KHI LỖI) ---
    if (ENABLE_CIRCUIT_BREAKER) {
      circuitBreaker.failureCount++;
      if (circuitBreaker.failureCount >= circuitBreaker.threshold) {
        circuitBreaker.state = 'OPEN';
        circuitBreaker.lastFailureTime = Date.now();
      }
    }
    return res.status(500).json({ message: `Error calling Service B: ${error.message || error.toString()}` });
  }
});

app.listen(port, () => {
  console.log(`Service A listening on port ${port}`);
});
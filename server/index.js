// index.js
const express = require('express');
const EventSource = require('eventsource');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const rfidReader = require('./rfidReader');

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'local/build')));

// SSE endpoint
app.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendRfidTags = () => {
    const rfidTags = rfidReader.getRfidTags();
    res.write(`data: ${JSON.stringify(rfidTags)}\n\n`);
  };

  sendRfidTags();

  const intervalId = setInterval(sendRfidTags, 1000);

  req.on('close', () => {
    clearInterval(intervalId);
  });
});

// Proxy requests to React app
app.use(
  '/web',
  createProxyMiddleware({
    target: 'http://localhost:3001', // Adjust the port if needed
    changeOrigin: true,
  })
);

// Serve index.html directly
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'local/public/index.html'));
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

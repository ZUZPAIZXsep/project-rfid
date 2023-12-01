const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const rfidReader = require('./rfidReader');

const app = express();

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'local/build')));

// Serve index.html directly
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'local/public/index.html'));
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket endpoint
wss.on('connection', (ws) => {
  ws.send(JSON.stringify(rfidReader.getRfidTags()));

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('message', (message) => {
    if (message === 'save') {
      console.log('Saved Count:', rfidReader.getRfidTags().length);
      ws.send(JSON.stringify(rfidReader.getRfidTags()));
    } else if (message === 'reset') {
      // ทำการรีเซ็ตค่าที่นับไว้เป็น 0 และล้างข้อมูล rfid tags ที่เคยจับได้
      console.log('Reset Count');
      rfidReader.resetRfidTags();
      // ส่งข้อมูล Reset กลับไปยัง client WebSocket
      ws.send(JSON.stringify(rfidReader.getRfidTags()));
    }
  });
});



// Periodically send RFID tags to connected WebSocket clients
setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(rfidReader.getRfidTags()));
    }
  });
}, 1000);

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

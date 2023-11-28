const express = require('express');
const EventSource = require('eventsource'); // เรียกใช้งาน EventSource library
const path = require('path');  // Import the path module
const app = express();

// นำเข้าโมดูล RFID reader
const rfidReader = require('./rfidReader');

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'local/build')));

// SSE endpoint
app.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // เริ่มการส่งข้อมูลทุก 1 วินาที
  const sendRfidTags = () => {
    const rfidTags = rfidReader.getRfidTags();
    res.write(`data: ${JSON.stringify(rfidTags)}\n\n`);
  };

  // ส่งข้อมูลเริ่มต้นทันที
  sendRfidTags();

  // ตั้งค่าการส่งข้อมูลทุก 1 วินาที
  const intervalId = setInterval(sendRfidTags, 1000);

  // จัดการเมื่อ client ปิดการเชื่อมต่อ
  req.on('close', () => {
    clearInterval(intervalId);
  });
});

// ... (โค้ดอื่น ๆ)

// สร้าง EventSource instance สำหรับหน้าเว็บ
app.get('/web', (req, res) => {
  const eventSource = new EventSource('/sse');
  res.sendFile(path.join(__dirname, 'local/build/index.html'));

  // จัดการข้อมูลที่ถูกส่งมาจาก SSE endpoint
  eventSource.onmessage = (event) => {
    const rfidTags = JSON.parse(event.data);
    // นำข้อมูลไปแสดงบนหน้าเว็บเชื่อมต่อแล้ว (เช่น อัปเดตตารางหรือรายการแท็ก)
    // คุณสามารถใช้ JavaScript เพื่ออัปเดตหน้าเว็บตามความต้องการ
    console.log('Received RFID Tags:', rfidTags);
  };
});

app.get('/rfid', (req, res) => {
  // รับข้อมูล RFID tags จาก rfidReader.js
  const rfidTags = rfidReader.getRfidTags(); 

  // แสดง RFID tags ในรูปแบบ HTML
  res.send(`
    <h1>RFID Tags</h1>
    <ul>
      ${rfidTags.map(tag => `<li>${tag}</li>`).join('')}
    </ul>
  `);
});

// เริ่มเซิร์ฟเวอร์
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

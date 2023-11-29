// src/components/RFIDCounter.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RFIDCounter = () => {
  const [tagCount, setTagCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/sse');
        const rfidTags = response.data;
        const uniqueTags = [...new Set(rfidTags)]; // เอาเฉพาะ tag ที่ไม่ซ้ำกัน
        setTagCount(uniqueTags.length);
      } catch (error) {
        console.error('Error fetching RFID tags:', error);
      }
    };

    fetchData();

    const eventSource = new EventSource('/sse');

    eventSource.onmessage = (event) => {
      fetchData(); // เมื่อมีข้อมูลใหม่, ทำการดึงข้อมูลอีกครั้ง
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h1>RFID Tag Count: {tagCount}</h1>
    </div>
  );
};

export default RFIDCounter;

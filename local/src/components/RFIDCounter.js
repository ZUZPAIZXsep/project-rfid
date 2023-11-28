import React, { useState, useEffect } from 'react';

const RFIDCounter = () => {
  const [tagCount, setTagCount] = useState(0);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3000/sse');

    eventSource.onmessage = (event) => {
      const rfidTags = JSON.parse(event.data);
      console.log('Received RFID Tags:', rfidTags);
      setTagCount(rfidTags.length);
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

import React, { useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { message } from 'antd';

const ScanSection = ({ isScanning, onScanSuccess }) => {
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  useEffect(() => {
    if (isScanning) {
      codeReader.current = new BrowserQRCodeReader();

      codeReader.current
        .decodeFromVideoDevice(null, videoRef.current, (result, error) => {
          if (result) {
            const text = result.getText();
            onScanSuccess(text);

            // Stop camera stream after successful scan
            if (videoRef.current?.srcObject) {
              videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
              videoRef.current.srcObject = null;
            }
          }
        })
        .catch((err) => {
          message.error('Camera error: ' + err.message);
        });
    }

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [isScanning, onScanSuccess]);

  return (
    <div style={{ display: isScanning ? 'block' : 'none', textAlign: 'center' }}>
      <p>Scanning QR Code with Camera...</p>
      <video ref={videoRef} style={{ width: '100%', maxWidth: '400px' }} />
    </div>
  );
};

export default ScanSection;

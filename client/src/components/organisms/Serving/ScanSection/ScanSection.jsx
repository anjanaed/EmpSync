import React, { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { message } from 'antd';

const ScanSection = ({ isScanning, onScanSuccess }) => {
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isScanning) {
      codeReader.current = new BrowserMultiFormatReader();

      // Start scanning
      codeReader.current
        .decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
          if (result) {
            const text = result.getText();
            onScanSuccess(text);

            // Stop scanning and camera after successful scan
            stopScanning();
          }
          // NotFoundException is normal - it means no code was found in this frame
          // Only log actual errors
          if (error && error.name !== 'NotFoundException') {
            
          }
        })
        .catch((err) => {
          message.error('Camera error: ' + err.message);
        });
    }

    return () => {
      stopScanning();
    };
  }, [isScanning, onScanSuccess]);

  const stopScanning = () => {
    // Stop the video stream
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    // Clear the stream reference
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Clear the code reader
    codeReader.current = null;
  };

  return (
    <div style={{ display: isScanning ? 'block' : 'none', textAlign: 'center' }}>
      <p>Scanning Barcode with Camera...</p>
      <video ref={videoRef} style={{ width: '100%', maxWidth: '400px' }} />
    </div>
  );
};

export default ScanSection;
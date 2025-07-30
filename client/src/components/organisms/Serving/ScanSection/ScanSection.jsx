import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { message } from 'antd';

const ScanSection = ({ isScanning, onScanSuccess }) => {
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const streamRef = useRef(null);
  const hasScannedRef = useRef(false); 

  useEffect(() => {
    if (isScanning) {
      hasScannedRef.current = false; // reset lock on new scan session
      codeReader.current = new BrowserMultiFormatReader();

      codeReader.current
        .decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
          if (result && !hasScannedRef.current) {
            hasScannedRef.current = true; 
            const text = result.getText();
            stopScanning();
            onScanSuccess(text); // only call once
          }

          if (error && error.name !== 'NotFoundException') {
            console.error(error); // optional logging
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
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    codeReader.current = null;
  };

  return (
    <div style={{ display: isScanning ? 'block' : 'none', textAlign: 'center' }}>
      <video ref={videoRef} style={{ width: '100%', maxWidth: '400px' }} />
    </div>
  );
};

export default ScanSection;
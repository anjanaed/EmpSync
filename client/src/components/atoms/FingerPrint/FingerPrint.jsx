import { useEffect, useState } from "react";
import { Button, Card, Layout, Typography } from "antd";
import { LuFingerprint } from "react-icons/lu";

const FingerPrint = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setScale(1);
      setTimeout(() => setScale(1.1), 100);
      setTimeout(() => setScale(1.05), 200);
      setTimeout(() => setScale(1), 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fingerprint-container" style={{ textAlign: "center" }}>
      {/* Add circular border wrapper */}
      <div 
        style={{
          border: "8px solid black", // Increased from 4px to 8px
          borderRadius: "50%",
          width: "250px", // Made equal to height for perfect circle
          height: "250px", // Made equal to width for perfect circle
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
          backgroundColor: "rgb(216, 216, 216)"
        }}
      >
        <LuFingerprint
          style={{
            fontSize: 150,
            transform: `scale(${scale})`,
            transition: "transform 0.2s ease-in-out",
            color: "#000000"
          }}
        />
      </div>

      {/* Ripple effect */}
      <div
        className="ripple-container"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "250px", // Match the container size
          height: "250px", // Match the container size
          borderRadius: "50%",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "3px solid black", // Made thicker
            animation: "ripple 2s infinite ease-out",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "3px solid black", // Made thicker
            animation: "ripple 2s infinite ease-out 0.5s",
          }}
        ></div>
      </div>

      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        .fingerprint-container {
          position: relative;
          width: 300px; // Increased to accommodate the wider circle
          height: 300px; // Increased to accommodate the wider circle
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default FingerPrint;
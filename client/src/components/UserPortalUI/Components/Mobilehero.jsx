import React from "react";
import { MenuOutlined } from "@ant-design/icons";

const MobileHero = () => {
  return (
    <div
      style={{
        position: "fixed", // Keep the hero section fixed
        top: 0,
        left: 0,
        width: "100%", // Full width for mobile
        height: "60px", // Fixed height for the hero section
        background: "#fff", // Background color
        zIndex: 1000, // Ensure it stays above other content
        display: "flex",
        justifyContent: "space-between", // Space between company name and nav icon
        alignItems: "center",
        padding: "0 15px", // Add padding for spacing
        borderBottom: "1px solid #ddd", // Optional border for separation
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Optional shadow for better visibility
      }}
    >
      {/* Company Name */}
      <div style={{ fontWeight: "bold", fontSize: "18px", color: "#333" }}>
        HELIX COMPANY
      </div>

      {/* Navigation Icon */}
      <div>
        <MenuOutlined style={{ fontSize: "24px", color: "#333" }} />
      </div>
    </div>
  );
};

export default MobileHero;
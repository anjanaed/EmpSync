import React from "react";
import { ConfigProvider } from "antd";
import { SidebarProvider } from "./Components/sidebar-provider";

export default function RootLayout({ children }) {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#1890ff" } }}>
      <div style={{ fontFamily: "Arial, sans-serif" }}>
        <SidebarProvider>{children}</SidebarProvider>
      </div>
    </ConfigProvider>
  );
}
import React from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Calendar as AntCalendar } from "antd";

export function Calendar({ className, ...props }) {
  return (
    <div className={`custom-calendar ${className}`} style={{ padding: "16px", background: "#fff", borderRadius: "8px" }}>
      <AntCalendar
        headerRender={({ value, onChange }) => {
          const current = value.clone();
          return (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <LeftOutlined
                onClick={() => onChange(current.subtract(1, "month"))}
                style={{ cursor: "pointer", fontSize: "16px" }}
              />
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                {value.format("MMMM YYYY")}
              </span>
              <RightOutlined
                onClick={() => onChange(current.add(1, "month"))}
                style={{ cursor: "pointer", fontSize: "16px" }}
              />
            </div>
          );
        }}
        {...props}
      />
    </div>
  );
}

Calendar.displayName = "Calendar";
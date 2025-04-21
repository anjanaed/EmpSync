import React from "react";
import { PageHeader } from "../Components/page-header";
import AttendanceCalendar from "../Components/attendance-calendar"; // Fixed import
import { Layout } from "antd";

const { Content } = Layout;

export default function AttendancePage() {
  return (
    <Layout style={{ padding: "24px", background: "#fff" }}>
      <PageHeader
        title="Attendance"
        description="Track your attendance and time records"
      />
      <Content style={{ marginTop: "24px" }}>
        <AttendanceCalendar />
      </Content>
    </Layout>
  );
}
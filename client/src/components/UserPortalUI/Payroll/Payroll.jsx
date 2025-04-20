import React from "react";
import { PageHeader } from "../Components/page-header";
import { PayrollDetails } from "../Components/payroll-details";
import { Layout, Card, Typography, Space } from "antd";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function PayrollPage() {
  return (
    <Layout style={{ padding: "20px", background: "#f0f2f5",margin: "20px" }}>
      <Content>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Card
            style={{
              padding: "20px",
              background: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              
            }}
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <PageHeader
                title={<Title level={3}>Payroll Details</Title>}
                description={
                  <Text type="secondary">
                    View your salary and payment information
                  </Text>
                }
              />
              <PayrollDetails />
            </Space>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
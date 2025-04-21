import React from "react";
import { Tabs, Card, Table, Badge, Button, Typography } from "antd";
import {
  DollarOutlined,
  DownloadOutlined,
  CreditCardOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const currentPayroll = {
  salary: 85000,
  netPay: 5850,
  grossPay: 7083.33,
  deductions: 1233.33,
  payDate: "April 30, 2023",
};

const paymentHistory = [
  {
    id: "PAY-2023-04",
    period: "April 2023",
    date: "April 30, 2023",
    amount: 5850,
    status: "Paid",
  },
  {
    id: "PAY-2023-03",
    period: "March 2023",
    date: "March 31, 2023",
    amount: 5850,
    status: "Paid",
  },
  {
    id: "PAY-2023-02",
    period: "February 2023",
    date: "February 28, 2023",
    amount: 5850,
    status: "Paid",
  },
  {
    id: "PAY-2023-01",
    period: "January 2023",
    date: "January 31, 2023",
    amount: 5850,
    status: "Paid",
  },
];

const deductions = [
  { name: "Income Tax", amount: 850 },
  { name: "Social Security", amount: 233.33 },
  { name: "Health Insurance", amount: 150 },
];

export default function PayrollDetails() {
  return (
    <Tabs
      defaultActiveKey="summary"
      style={{ margin: "20px" }}
      tabBarStyle={{ backgroundColor: "#f5f5f5", borderRadius: "8px" }}
    >
      <Tabs.TabPane tab="Summary" key="summary">
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <Card
            title={<Title level={4}>Annual Salary</Title>}
            bordered={false}
            style={{
              width: 300,
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}
          >
            <DollarOutlined style={{ fontSize: "24px", color: "#08c" }} />
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>
              ${currentPayroll.salary.toLocaleString()}
            </p>
            <Text type="secondary">Per year</Text>
          </Card>
          <Card
            title={<Title level={4}>Net Pay</Title>}
            bordered={false}
            style={{
              width: 300,
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}
          >
            <CreditCardOutlined style={{ fontSize: "24px", color: "#08c" }} />
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>
              ${currentPayroll.netPay.toLocaleString()}
            </p>
            <Text type="secondary">After deductions</Text>
          </Card>
          <Card
            title={<Title level={4}>Next Payment</Title>}
            bordered={false}
            style={{
              width: 300,
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}
          >
            <CalendarOutlined style={{ fontSize: "24px", color: "#08c" }} />
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>
              {currentPayroll.payDate}
            </p>
            <Text type="secondary">Direct deposit</Text>
          </Card>
        </div>

        <Card
          title={<Title level={4}>Current Pay Period</Title>}
          style={{
            marginTop: 24,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
          }}
          extra={<Text type="secondary">Details for the current month's payroll</Text>}
        >
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <p>
                <strong>Gross Pay:</strong> ${currentPayroll.grossPay.toLocaleString()}
              </p>
              <p>
                <strong>Total Deductions:</strong> -${currentPayroll.deductions.toLocaleString()}
              </p>
              <p style={{ borderTop: "1px solid #eee", paddingTop: 8 }}>
                <strong>Net Pay:</strong> ${currentPayroll.netPay.toLocaleString()}
              </p>
              <Button
                icon={<DownloadOutlined />}
                style={{
                  marginTop: 16,
                  backgroundColor: "#08c",
                  color: "#fff",
                  borderRadius: "4px",
                }}
              >
                Download Pay Slip
              </Button>
            </div>
            <div style={{ flex: 1 }}>
              <Title level={5}>Payment Information</Title>
              <p>Bank: National Bank</p>
              <p>Account Number: XXXX-XXXX-1234</p>
              <p>Routing Number: XXX-XXX-XXX</p>
              <p>Payment Method: Direct Deposit</p>
            </div>
          </div>
        </Card>
      </Tabs.TabPane>

      <Tabs.TabPane tab="Payment History" key="history">
        <Card
          title={<Title level={4}>Payment History</Title>}
          extra={<Text type="secondary">View your past payments</Text>}
          style={{
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
          }}
        >
          <Table
            dataSource={paymentHistory}
            rowKey="id"
            pagination={false}
            columns={[
              { title: "Payment ID", dataIndex: "id" },
              { title: "Period", dataIndex: "period" },
              { title: "Date", dataIndex: "date" },
              {
                title: "Amount",
                dataIndex: "amount",
                align: "right",
                render: (val) => `$${val.toLocaleString()}`,
              },
              {
                title: "Status",
                dataIndex: "status",
                render: (text) => (
                  <Badge status="success" text={text} />
                ),
              },
              {
                title: "Actions",
                dataIndex: "actions",
                align: "right",
                render: () => (
                  <Button
                    icon={<DownloadOutlined />}
                    size="small"
                    style={{
                      backgroundColor: "#08c",
                      color: "#fff",
                      borderRadius: "4px",
                    }}
                  />
                ),
              },
            ]}
          />
        </Card>
      </Tabs.TabPane>

      <Tabs.TabPane tab="Deductions" key="deductions">
        <Card
          title={<Title level={4}>Deductions</Title>}
          extra={<Text type="secondary">Breakdown of your monthly deductions</Text>}
          style={{
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
          }}
        >
          <Table
            dataSource={deductions.map((item, idx) => ({ key: idx, ...item }))}
            pagination={false}
            columns={[
              { title: "Description", dataIndex: "name" },
              {
                title: "Amount",
                dataIndex: "amount",
                align: "right",
                render: (val) => `$${val.toLocaleString()}`,
              },
            ]}
            footer={() => (
              <div style={{ textAlign: "right", fontWeight: "bold" }}>
                Total Deductions: ${currentPayroll.deductions.toLocaleString()}
              </div>
            )}
          />
        </Card>
      </Tabs.TabPane>
    </Tabs>
  );
}
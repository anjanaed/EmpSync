import React from "react";
import { Tabs, Card, Table, Badge, Button } from "antd";
import {
  DollarOutlined,
  DownloadOutlined,
  CreditCardOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

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
    <Tabs defaultActiveKey="summary" style={{ marginTop: "20px" }}>
      <Tabs.TabPane tab="Summary" key="summary">
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <Card title="Annual Salary" bordered={false} style={{ width: 300 }}>
            <DollarOutlined style={{ fontSize: "24px", color: "#08c" }} />
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>${currentPayroll.salary.toLocaleString()}</p>
            <p>Per year</p>
          </Card>
          <Card title="Net Pay" bordered={false} style={{ width: 300 }}>
            <CreditCardOutlined style={{ fontSize: "24px", color: "#08c" }} />
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>${currentPayroll.netPay.toLocaleString()}</p>
            <p>After deductions</p>
          </Card>
          <Card title="Next Payment" bordered={false} style={{ width: 300 }}>
            <CalendarOutlined style={{ fontSize: "24px", color: "#08c" }} />
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{currentPayroll.payDate}</p>
            <p>Direct deposit</p>
          </Card>
        </div>

        <Card
          title="Current Pay Period"
          style={{ marginTop: 24 }}
          extra={<span>Details for the current month's payroll</span>}
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
              <Button icon={<DownloadOutlined />} style={{ marginTop: 16 }}>
                Download Pay Slip
              </Button>
            </div>
            <div style={{ flex: 1 }}>
              <h4>Payment Information</h4>
              <p>Bank: National Bank</p>
              <p>Account Number: XXXX-XXXX-1234</p>
              <p>Routing Number: XXX-XXX-XXX</p>
              <p>Payment Method: Direct Deposit</p>
            </div>
          </div>
        </Card>
      </Tabs.TabPane>

      <Tabs.TabPane tab="Payment History" key="history">
        <Card title="Payment History" extra={<span>View your past payments</span>}>
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
                  <Badge
                    status="success"
                    text={text}
                  />
                ),
              },
              {
                title: "Actions",
                dataIndex: "actions",
                align: "right",
                render: () => (
                  <Button icon={<DownloadOutlined />} size="small" />
                ),
              },
            ]}
          />
        </Card>
      </Tabs.TabPane>

      <Tabs.TabPane tab="Deductions" key="deductions">
        <Card title="Deductions" extra={<span>Breakdown of your monthly deductions</span>}>
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
import React, { useState } from "react";
import { Card, Typography, Badge, Tabs, Table, Calendar as AntCalendar, Row, Col } from "antd";
import { ClockCircleOutlined, CalendarOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const attendanceData = {
  present: [
    new Date(2025, 3, 1), new Date(2025, 3, 2), new Date(2025, 3, 3),
    new Date(2025, 3, 4), new Date(2025, 3, 7), new Date(2025, 3, 8),
    new Date(2025, 3, 9), new Date(2025, 3, 10), new Date(2025, 3, 11),
    new Date(2025, 3, 14), new Date(2025, 3, 15), new Date(2025, 3, 16),
    new Date(2025, 3, 17), new Date(2025, 3, 18), new Date(2025, 3, 21),
    new Date(2025, 3, 22), new Date(2025, 3, 23), new Date(2025, 3, 24),
    new Date(2025, 3, 25), new Date(2025, 3, 28), new Date(2025, 3, 29),
    new Date(2025, 3, 30),
  ],
  absent: [{ date: new Date(2025, 3, 18), reason: "Sick Leave" }],
  late: [
    { date: new Date(2025, 3, 10), minutes: 15 },
    { date: new Date(2025, 3, 23), minutes: 10 },
  ],
};

const timeRecords = [
  { date: "April 30, 2025", checkIn: "09:00 AM", checkOut: "05:30 PM", hours: 8.5, status: "Present" },
  { date: "April 29, 2025", checkIn: "08:55 AM", checkOut: "05:15 PM", hours: 8.33, status: "Present" },
  { date: "April 28, 2025", checkIn: "09:10 AM", checkOut: "05:30 PM", hours: 8.33, status: "Late" },
  { date: "April 25, 2025", checkIn: "08:50 AM", checkOut: "05:20 PM", hours: 8.5, status: "Present" },
  { date: "April 24, 2025", checkIn: "09:00 AM", checkOut: "05:30 PM", hours: 8.5, status: "Present" },
  { date: "April 18, 2025", checkIn: "-", checkOut: "-", hours: 0, status: "Absent" },
];

export default function AttendanceCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);

  const isDateEqual = (a, b) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

  const getDateStatus = (date) => {
    const absent = attendanceData.absent.find((d) => isDateEqual(d.date, date));
    if (absent) return { status: "Absent", detail: absent.reason };

    const late = attendanceData.late.find((d) => isDateEqual(d.date, date));
    if (late) return { status: "Late", detail: `${late.minutes} mins` };

    const present = attendanceData.present.find((d) => isDateEqual(d, date));
    if (present) return { status: "Present" };

    return { status: "No Record" };
  };

  const dateCellRender = (date) => {
    const jsDate = date.toDate();
    const status = getDateStatus(jsDate).status;
    const color = status === "Present" ? "green" : status === "Absent" ? "red" : status === "Late" ? "gold" : null;
    return color ? <Badge color={color} /> : null;
  };

  const selectedStatus = selectedDate ? getDateStatus(selectedDate) : null;

  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Check In", dataIndex: "checkIn", key: "checkIn" },
    { title: "Check Out", dataIndex: "checkOut", key: "checkOut" },
    { title: "Hours", dataIndex: "hours", key: "hours" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          color={
            status === "Present"
              ? "green"
              : status === "Absent"
              ? "red"
              : status === "Late"
              ? "gold"
              : "default"
          }
          text={status}
        />
      ),
    },
  ];

  return (
    <Tabs defaultActiveKey="calendar">
      <TabPane tab="Calendar View" key="calendar">
        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Card title="Attendance Calendar">
              <AntCalendar
                fullscreen={false}
                dateCellRender={dateCellRender}
                onSelect={(date) => setSelectedDate(date.toDate())}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Date Details">
              {selectedDate ? (
                <>
                  <p><CalendarOutlined /> {selectedDate.toDateString()}</p>
                  <p>
                    Status: <Badge color={selectedStatus?.status === "Present" ? "green" : selectedStatus?.status === "Absent" ? "red" : selectedStatus?.status === "Late" ? "gold" : "gray"} text={selectedStatus?.status} />
                  </p>
                  {selectedStatus.status === "Absent" && (
                    <p><ExclamationCircleOutlined /> Reason: {selectedStatus.detail}</p>
                  )}
                  {selectedStatus.status === "Late" && (
                    <p><ClockCircleOutlined /> Late by {selectedStatus.detail}</p>
                  )}
                </>
              ) : (
                <p>Select a date to view details.</p>
              )}
            </Card>
          </Col>
        </Row>
      </TabPane>
      <TabPane tab="Time Records" key="records">
        <Card title="Time Records">
          <Table dataSource={timeRecords} columns={columns} rowKey="date" pagination={false} />
        </Card>
      </TabPane>
      <TabPane tab="Summary" key="summary">
        <Card title="Attendance Summary">
          <Row gutter={16}>
            <Col span={8}><Card><Title level={4}>Present Days</Title><Text>{attendanceData.present.length}</Text></Card></Col>
            <Col span={8}><Card><Title level={4}>Absent Days</Title><Text>{attendanceData.absent.length}</Text></Card></Col>
            <Col span={8}><Card><Title level={4}>Late Arrivals</Title><Text>{attendanceData.late.length}</Text></Card></Col>
          </Row>
          <div style={{ marginTop: 24 }}>
            <Title level={5}>Leave Balance</Title>
            <Table
              dataSource={[
                { key: '1', type: 'Sick Leave', total: 12, used: 1, remaining: 11 },
                { key: '2', type: 'Vacation', total: 15, used: 0, remaining: 15 },
                { key: '3', type: 'Personal', total: 5, used: 0, remaining: 5 },
              ]}
              columns={[
                { title: 'Leave Type', dataIndex: 'type', key: 'type' },
                { title: 'Total', dataIndex: 'total', key: 'total' },
                { title: 'Used', dataIndex: 'used', key: 'used' },
                { title: 'Remaining', dataIndex: 'remaining', key: 'remaining' },
              ]}
              pagination={false}
            />
          </div>
        </Card>
      </TabPane>
    </Tabs>
  );
}
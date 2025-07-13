import React, { useEffect, useState } from "react";
import { Pie } from '@ant-design/plots';
import { Table, ConfigProvider, Modal, Button, Popconfirm, Space } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import styles from "./FingerPrints.module.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserPlus,
  faFileInvoice,
  faDollarSign,
  faFingerprint
} from "@fortawesome/free-solid-svg-icons";
import NavBar from "../../NavBar/NavBar";

const customTheme = {
  components: {
    Table: {
      headerBg: "rgba(151, 0, 0, 0.78)",
      headerColor: "white",
      headerSortActiveBg: "rgba(151, 0, 0, 0.78)",
      headerSortHoverBg: "rgba(183, 0, 0, 0.78)",
      fontSize: 12,
      cellPaddingBlock: 12,
      fontFamily: '"Figtree", sans-serif',
    },
  },
};

const FingerPrintsContent = () => {
  // Toggle state for pass-key login feature
  const [showPasskeyMsg, setShowPasskeyMsg] = useState(true);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalThumbids, setModalThumbids] = useState([]);
  const [modalEmpId, setModalEmpId] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [showTable, setShowTable] = useState(false);
  // Device cards state
  const [deviceCards, setDeviceCards] = useState([]);

  // Fetch fingerprint device usage
  useEffect(() => {
    axios
      .get("http://localhost:3000/hr-fingerprints")
      .then((res) => {
        const fingerprints = res.data;
        // Group by unit name (first 6 chars)
        const deviceMap = {};
        fingerprints.forEach(fp => {
          const unit = fp.thumbid.slice(0, 6);
          if (!deviceMap[unit]) deviceMap[unit] = 0;
          deviceMap[unit]++;
        });
        // Build cards
        const cards = Object.entries(deviceMap).map(([unit, count]) => ({
          unit,
          filled: count,
          available: 1000 - count
        }));
        setDeviceCards(cards);
      })
      .catch(() => setDeviceCards([]));
  }, []);
  useEffect(() => {
    if (showTable) {
      setLoading(true);
      axios
        .get("http://localhost:3000/hr-fingerprints/users/fingerprint-details")
        .then((res) => {
          setUserData(res.data);
          setLoading(false);
        })
        .catch(() => {
          setUserData([]);
          setLoading(false);
        });
    }
  }, [showTable]);

  const handleView = (empId, thumbids) => {
    setModalEmpId(empId);
    setModalThumbids(thumbids);
    setDeleteMode(false);
    setModalVisible(true);
  };

  const handleDeleteMode = (empId, thumbids) => {
    setModalEmpId(empId);
    setModalThumbids(thumbids);
    setDeleteMode(true);
    setModalVisible(true);
  };

  const handleDeleteThumbid = async (thumbid) => {
    await axios.delete(`http://localhost:3000/hr-fingerprints/fingerprint/${thumbid}`);
    setModalThumbids((prev) => prev.filter((id) => id !== thumbid));
    setUserData((prev) =>
      prev.map((user) =>
        user.id === modalEmpId
          ? {
              ...user,
              fingerprintCount: user.fingerprintCount - 1,
              thumbids: user.thumbids.filter((id) => id !== thumbid),
              status: user.fingerprintCount - 1 > 0 ? "Registered" : "Unregistered",
            }
          : user
      )
    );
  };

  const columns = [
    {
      title: "Employee ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      defaultSortOrder: "ascend",
      sorter: (a, b) => {
        const numA = parseInt(a.id.match(/\d+/)?.[0] || "0", 10);
        const numB = parseInt(b.id.match(/\d+/)?.[0] || "0", 10);
        return numA - numB;
      },
      ellipsis: true,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      ellipsis: true,
    },
    {
      title: "FingerPrint Passkey",
      dataIndex: "passkey",
      key: "passkey",
      align: "center",
      ellipsis: true,
      render: (passkey) => passkey !== undefined && passkey !== null ? passkey : "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      ellipsis: true,
      render: (status) => (
        <span className={status === "Registered" ? styles.registered : styles.pending}>{status}</span>
      ),
    },
    {
      title: "Count of Fingerprints",
      dataIndex: "fingerprintCount",
      key: "fingerprintCount",
      align: "center",
      ellipsis: true,
      render: (count, record) =>
        record.status === "Registered" ? count : "-",
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) =>
        record.status === "Registered" ? (
          <Space>
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleView(record.id, record.thumbids)}
              size="small"
            >
              
            </Button>
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteMode(record.id, record.thumbids)}
              size="small"
              danger
            >
             
            </Button>
          </Space>
        ) : null,
    },
  ];

  // Landing view
  if (!showTable) {
    return (
      <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "32px", background: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", width: "100%", margin: "40px 0" }}>
          <div style={{ textAlign: "left", fontSize: "1rem", fontWeight: 500 }}>
            Click here to get User Fingerprints Info.
          </div>
          <Button type="primary" onClick={() => setShowTable(true)}>
            User Info.
          </Button>
        </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "32px", background: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", width: "100%", margin: "40px 0" }}>
        <div style={{ textAlign: "left", fontSize: "1rem", fontWeight: 500 }}>
          {showPasskeyMsg ? "Hide the pass-key login feature on the Meals Order-Tab" : "Pass-key login feature is hidden on the Meals Order-Tab"}
        </div>
        <Button type="primary" onClick={() => setShowPasskeyMsg((prev) => !prev)}>
          {showPasskeyMsg ? "Hide" : "Unhide"}
        </Button>
      </div>
        <div style={{ fontSize: "1.15rem", fontWeight: 600, color: "#970000", marginBottom: "8px", marginLeft: "35px" }}>
          Fingerprint Units Info.
        </div>
        <div style={{ display: "flex", gap: "24px", marginBottom: "16px", flexWrap: "wrap",marginLeft: "25px" }}>
          {deviceCards.length === 0 ? (
            <div style={{ fontSize: "1rem", color: "#888" }}>No device usage data found.</div>
          ) : (
            deviceCards.map(card => {
              const pieData = [
                { type: 'Filled', value: card.filled },
                { type: 'Available', value: card.available }
              ];
              const pieConfig = {
                data: pieData,
                angleField: 'value',
                colorField: 'type',
                radius: 1,
                innerRadius: 0.7,
                startAngle: Math.PI,
                endAngle: 2 * Math.PI,
                legend: false,
                label: {
                  type: 'inner',
                  offset: '-30%',
                  content: '{value}',
                  style: {
                    fontSize: 14,
                    textAlign: 'center',
                  },
                },
                color: ['#970000', '#e0e0e0'],
                statistic: null,
                animation: false,
              };
              return (
                <div key={card.unit} style={{ minWidth: 220, background: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: "20px 28px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: 8 }}>Unit Name: <span style={{ color: "#970000" }}>{card.unit}</span></div>
                  <div style={{ width: 180, height: 90, margin: "0 auto 8px auto" }}>
                    <Pie {...pieConfig} />
                  </div>
                  <div style={{ fontSize: "1rem", marginBottom: 4 }}>Filled : <span style={{ fontWeight: 500 }}>{card.filled}/1000</span></div>
                  <div style={{ fontSize: "1rem" }}>Available: <span style={{ fontWeight: 500 }}>{card.available}/1000</span></div>
                </div>
              );
            })
          )}
        </div>
        
      </>
    );
  }

  // Table view
  return (
    <div style={{ position: "relative" }}>
      <div className={styles.container} style={{ position: "relative" }}>
        {/* Absolutely positioned Back Button inside container */}
        <Button
          style={{ position: "absolute", top: 16, left: 16, zIndex: 1000 }}
          onClick={() => setShowTable(false)}
        >
          Back
        </Button>
        <h2 className={styles.title}>User Fingerprint Info.</h2>
        <ConfigProvider theme={customTheme}>
          <Table
            columns={columns}
            dataSource={userData.map((user) => ({ ...user, key: user.id }))}
            loading={loading}
            pagination={{
              position: ["bottomCenter"],
              pageSize: 25,
              showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} items`,
              showSizeChanger: false,
            }}
          />
        </ConfigProvider>
        <Modal
          open={modalVisible}
          title={deleteMode ? "Delete Fingerprints" : "View Fingerprints"}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <div>
            <strong>Employee ID:</strong> {modalEmpId}
          </div>
          <br />
          <ul>
            {modalThumbids.length === 0 ? (
              <li>No fingerprints found.</li>
            ) : (
              modalThumbids.map((thumbid) => (
                <li key={thumbid} style={{ marginBottom: "8px" }}>
                  {thumbid}
                  {deleteMode && (
                    <Popconfirm
                      title="Delete this fingerprint?"
                      onConfirm={() => handleDeleteThumbid(thumbid)}
                      okText="Delete"
                      cancelText="Cancel"
                    >
                      <Button
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                        style={{ marginLeft: "12px" }}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  )}
                </li>
              ))
            )}
          </ul>
        </Modal>
      </div>
    </div>
  );
};

const FingerPrints = () => (
  <NavBar
    titleLines={["Human", "Resource", "Management"]}
    menuItems={[
      {
        key: "1",
        icon: <FontAwesomeIcon icon={faUsers} />,
        label: "Employees",
        link: "/EmployeePage"
      },
      {
        key: "2",
        icon: <FontAwesomeIcon icon={faUserPlus} />,
        label: "Registration",
        link: "/reg"
      },
      {
        key: "3",
        icon: <FontAwesomeIcon icon={faDollarSign} />,
        label: "Payrolls",
        link: "/payroll"
      },
      {
        key: "4",
        icon: <FontAwesomeIcon icon={faFileInvoice} />,
        label: "Reports",
        link: "/reportPage"
      },
      {
        key: "5",
        icon: <FontAwesomeIcon icon={faFingerprint} />,
        label: "FingerPrints",
        link: "/FingerPrints"
      }
    ]}
    Comp={FingerPrintsContent}
  />
);

export default FingerPrints;

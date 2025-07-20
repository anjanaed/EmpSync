import React, { useEffect, useState } from "react";
import Loading from "../../../atoms/loading/loading.jsx";
import { ReloadOutlined } from "@ant-design/icons";
import { Pie } from '@ant-design/plots';
import { Table, ConfigProvider, Modal, Button, Popconfirm, Space } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import styles from "./FingerPrints.module.css";
import axios from "axios";
import { useAuth } from "../../../../contexts/AuthContext.jsx";

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
  const [regeneratingId, setRegeneratingId] = useState(null);
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
  // Search bar state
  const [searchValue, setSearchValue] = useState("");
  const [searchError, setSearchError] = useState("");
  const { authData } = useAuth();
  // Search bar state
  // (searchError and setSearchError are now declared below as part of the new search bar logic)

  // Fetch fingerprint device usage
  useEffect(() => {
    if (!authData?.orgId) return;
    
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/hr-fingerprints`, {
        params: { orgId: authData.orgId }, 
      })
      .then((res) => {
        const fingerprints = res.data || [];
        
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
  }, [authData?.orgId]);
  useEffect(() => {
    if (showTable && authData?.orgId) {
      setLoading(true);
      axios
        .get(`${import.meta.env.VITE_BASE_URL}/hr-fingerprints/users/fingerprint-details`, {
          params: { orgId: authData.orgId },
        })
        .then((res) => {
          setUserData(res.data);
          setLoading(false);
        })
        .catch(() => {
          setUserData([]);
          setLoading(false);
        });
    }
  }, [showTable, authData?.orgId]);

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
    await axios.delete(`${import.meta.env.VITE_BASE_URL}/hr-fingerprints/fingerprint/${thumbid}`);
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
      render: (passkey, record) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{passkey !== undefined && passkey !== null ? passkey : "-"}</span>
          <Button
            icon={<ReloadOutlined style={{ color: "#970000" }} />}
            size="small"
            style={{ marginLeft: "8px" }}
            title="Regenerate Passkey"
            loading={regeneratingId === record.id}
            onClick={async () => {
              setRegeneratingId(record.id);
              try {
                const res = await axios.put(`${import.meta.env.VITE_BASE_URL}/user/${record.id}/regenerate-passkey`);
                const newPasskey = res.data.passkey;
                setTimeout(() => {
                  setUserData(prev => prev.map(u => u.id === record.id ? { ...u, passkey: newPasskey } : u));
                  setRegeneratingId(null);
                }, 700); // Show loading for at least 700ms
              } catch (err) {
                setRegeneratingId(null);
                alert("Failed to regenerate passkey.");
              }
            }}
          />
        </div>
      ),
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
            Click User Info to get User Fingerprints Info.
          </div>
          <Button type="primary" onClick={() => setShowTable(true)}>
            User Info.
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
  // Show loading overlay if regenerating
  if (regeneratingId) {
    return <Loading text="Regenerating passkey..." />;
  }
  return (
    <>
    <div style={{ position: "relative" }}>
      <div className={styles.container} style={{ position: "relative" }}>
        {/* Absolutely positioned Back Button inside container */}
        <Button
          style={{ position: "absolute", top: 16, left: 16, zIndex: 1000 }}
          onClick={() => setShowTable(false)}
        >
          Back
        </Button>
        <h3 className={styles.title}>User Fingerprint Info.</h3>
        {/* Search Bar for Employee ID or Name */}
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <input
            type="text"
            placeholder="Search by Employee ID or Name..."
            value={searchValue}
            onChange={e => {
              setSearchValue(e.target.value);
              setSearchError("");
            }}
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14, width: 260 }}
          />
          <Button
            type="default"
            onClick={() => {
              if (searchValue.trim() === "") {
                setSearchError("");
                return;
              }
              const val = searchValue.trim().toLowerCase();
              const found = userData.some(user =>
                user.id.toLowerCase() === val || user.name.toLowerCase().includes(val)
              );
              if (!found) {
                setSearchError("No matching Employee ID or Name found.");
              } else {
                setSearchError("");
              }
            }}
          >
            Search
          </Button>
          {searchError && <span style={{ color: "#970000", fontWeight: 500 }}>{searchError}</span>}
          {searchValue && !searchError && (
            <Button type="link" onClick={() => setSearchValue("")}>Clear</Button>
          )}
        </div>
        <ConfigProvider theme={customTheme}>
          <Table
            columns={columns}
            dataSource={
              searchValue && !searchError
                ? userData
                    .filter(user => {
                      const val = searchValue.trim().toLowerCase();
                      return (
                        user.id.toLowerCase() === val ||
                        user.name.toLowerCase().includes(val)
                      );
                    })
                    .map(user => ({ ...user, key: user.id }))
                : userData.map(user => ({ ...user, key: user.id }))
            }
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
    </>
  );
};


export default FingerPrintsContent;

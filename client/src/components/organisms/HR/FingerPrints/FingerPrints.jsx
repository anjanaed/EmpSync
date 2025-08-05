import React, { useEffect, useState } from "react";
import { ReloadOutlined, EyeOutlined, DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import Loading from "../../../atoms/loading/loading.jsx";
import { Pie } from "@ant-design/plots";
import { Table, ConfigProvider, Modal, Button, Popconfirm, Space, Tooltip, Popover } from "antd";
import styles from "./FingerPrints.module.css";
import axios from "axios";
import { useAuth } from "../../../../contexts/AuthContext.jsx";
import { useTheme } from "../../../../contexts/ThemeContext.jsx";

const getCustomTheme = () => ({
  components: {
    Table: {
      headerBg: "#960000",
      headerColor: "white",
      headerSortActiveBg: "#960000",
      headerSortHoverBg: "#960000",
      fontSize: 12,
      cellPaddingBlock: 12,
      fontFamily: '"Figtree", sans-serif',
    },
  },
});

const getDarkTheme = () => ({
  components: {
    Table: {
      fontSize: 12,
      cellPaddingBlock: 12,
      fontFamily: '"Figtree", sans-serif',
      colorBgContainer: "#2a2a2a",
      colorText: "#ffffff",
      headerBg: "#232323",
      headerColor: "#ffffff",
      rowHoverBg: "#000000",
    },
    Pagination: {
      colorBgContainer: "#303030",
      colorText: "#ffffff",
      colorBorder: "#404040",
      itemActiveBg: "#404040",
    },
  },
});

const FingerPrintsContent = () => {
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalThumbids, setModalThumbids] = useState([]);
  const [modalEmpId, setModalEmpId] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [deviceCards, setDeviceCards] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchError, setSearchError] = useState("");
  const { authData } = useAuth();
  const { theme } = useTheme();

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
        fingerprints.forEach((fp) => {
          const unit = fp.thumbid.slice(0, 6);
          if (!deviceMap[unit]) deviceMap[unit] = 0;
          deviceMap[unit]++;
        });
        // Build cards
        const cards = Object.entries(deviceMap).map(([unit, count]) => ({
          unit,
          filled: count,
          available: 1000 - count,
        }));
        setDeviceCards(cards);
      })
      .catch(() => setDeviceCards([]));
  }, [authData?.orgId]);

  // Fetch fingerprint table data
  const fetchUserData = async () => {
    if (authData?.orgId) {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/hr-fingerprints/users/fingerprint-details`,
          {
            params: { orgId: authData.orgId },
          }
        );
        setUserData(res.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData([]);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [authData?.orgId]);

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
    await axios.delete(
      `${import.meta.env.VITE_BASE_URL}/hr-fingerprints/fingerprint/${thumbid}`
    );
    setModalThumbids((prev) => prev.filter((id) => id !== thumbid));
    setUserData((prev) =>
      prev.map((user) =>
        user.id === modalEmpId
          ? {
              ...user,
              fingerprintCount: user.fingerprintCount - 1,
              thumbids: user.thumbids.filter((id) => id !== thumbid),
              status:
                user.fingerprintCount - 1 > 0 ? "Registered" : "Unregistered",
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
      ellipsis: true,
      sorter: (a, b) => a.id.localeCompare(b.id),
      defaultSortOrder: 'ascend',
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
        <div className={styles.passkeyCell}>
          <div>
            <span>
              {passkey !== undefined && passkey !== null ? passkey : "-"}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {record.passkeyRegeneratedBy && record.passkeyRegeneratedAt && (
              <Popover
                content={
                  <div style={{ maxWidth: 200 }}>
                    <div><strong>Regenerated by:</strong> {record.passkeyRegeneratedBy}</div>
                    <div><strong>Date:</strong> {new Date(record.passkeyRegeneratedAt).toLocaleDateString()}</div>
                    <div><strong>Time:</strong> {new Date(record.passkeyRegeneratedAt).toLocaleTimeString()}</div>
                  </div>
                }
                title="Passkey Regeneration Info"
                trigger="click"
                placement="topLeft"
              >
                <Button
                  icon={<InfoCircleOutlined style={{ color: "#1890ff" }} />}
                  size="small"
                  type="text"
                />
              </Popover>
            )}
            <Button
              icon={<ReloadOutlined style={{ color: "#970000" }} />}
              size="small"
              className={styles.reloadBtn}
              title="Regenerate Passkey"
              loading={regeneratingId === record.id}
              onClick={async () => {
                setRegeneratingId(record.id);
                try {
                  const res = await axios.put(
                    `${import.meta.env.VITE_BASE_URL}/user/${
                      record.id
                    }/regenerate-passkey`,
                    { adminId: authData?.user?.id },
                    { headers: { Authorization: `Bearer ${authData?.accessToken}` } }
                  );
                  const newPasskey = res.data.passkey;
                  
                  // Refresh the entire table data to get updated tracking information
                  await fetchUserData();
                  setRegeneratingId(null);
                } catch (err) {
                  setRegeneratingId(null);
                  alert("Failed to regenerate passkey.");
                }
              }}
            />
          </div>
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
        <span
          className={
            status === "Registered"
              ? `${styles.registered} ${
                  theme === "dark" ? styles.registeredDark : ""
                }`
              : `${styles.pending} ${
                  theme === "dark" ? styles.pendingDark : ""
                }`
          }
        >
          {status}
        </span>
      ),
    },
    {
      title: "Count of Fingerprints",
      dataIndex: "fingerprintCount",
      key: "fingerprintCount",
      align: "center",
      ellipsis: true,
      render: (count, record) => (record.status === "Registered" ? count : "-"),
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
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteMode(record.id, record.thumbids)}
              size="small"
              danger
            />
          </Space>
        ) : null,
    },
  ];

  if (regeneratingId) {
    return <Loading text="Regenerating passkey..." />;
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className={styles.sectors}>
        <div className={styles.unitsTitle}>Fingerprint Units</div>
        <div className={styles.unitsCards}>
          {deviceCards.length === 0 ? (
            <div className={styles.noDeviceData}>No Device Data Found.</div>
          ) : (
            deviceCards.map((card) => {
              const pieData = [
                { type: "Filled", value: card.filled },
                { type: "Available", value: card.available },
              ];
              const pieConfig = {
                data: pieData,
                angleField: "value",
                colorField: "type",
                radius: 1,
                innerRadius: 0.7,
                startAngle: Math.PI,
                endAngle: 2 * Math.PI,
                legend: false,
                label: false,
                color: ["#970000", "#e0e0e0"],
                statistic: null,
                animation: false,
              };
              return (
                <div key={card.unit} className={styles.unitCard}>
                  <div className={styles.unitName}>
                    Unit Name: <span>{card.unit}</span>
                  </div>
                  <div className={styles.pieWrapper}>
                    <Pie {...pieConfig} />
                  </div>
                  <div className={styles.unitStat}>
                    Filled : <span>{card.filled}/1000</span>
                  </div>
                  <div className={styles.unitStat}>
                    Available: <span>{card.available}/1000</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Fingerprint Table Section */}
      <div className={styles.sectors}>
        <div className={styles.tableSection}>
          <div className={styles.container}>
            <h3 className={styles.unitsTitle}>User Fingerprint Details</h3>
            {/* Search Bar for Employee ID or Name */}
            <div
              className={
                theme === "dark"
                  ? `${styles.searchBarRow} ${styles.searchBarRowDark}`
                  : styles.searchBarRow
              }
            >
              <input
                type="text"
                placeholder="Search by Employee ID or Name..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setSearchError("");
                }}
                className={
                  theme === "dark"
                    ? `${styles.searchInput} ${styles.searchInputDark}`
                    : styles.searchInput
                }
              />
              <Button
                type="default"
                className={styles.searchBtn}
                onClick={() => {
                  if (searchValue.trim() === "") {
                    setSearchError("");
                    return;
                  }
                  const val = searchValue.trim().toLowerCase();
                  const found = userData.some(
                    (user) =>
                      user.id.toLowerCase() === val ||
                      user.name.toLowerCase().includes(val)
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
              {searchError && (
                <span className={styles.searchError}>{searchError}</span>
              )}
              {searchValue && !searchError && (
                <Button
                  type="link"
                  className={styles.clearBtn}
                  onClick={() => setSearchValue("")}
                >
                  Clear
                </Button>
              )}
            </div>
            <ConfigProvider
              theme={theme === "dark" ? getDarkTheme() : getCustomTheme()}
            >
              <Table
                columns={columns}
                dataSource={
                  searchValue && !searchError
                    ? userData
                        .filter((user) => {
                          const val = searchValue.trim().toLowerCase();
                          return (
                            user.id.toLowerCase() === val ||
                            user.name.toLowerCase().includes(val)
                          );
                        })
                        .map((user) => ({ ...user, key: user.id }))
                    : userData.map((user) => ({ ...user, key: user.id }))
                }
                loading={loading}
                pagination={{
                  position: ["bottomCenter"],
                  pageSize: 25,
                  showTotal: (total, range) =>
                    `${range[0]}–${range[1]} of ${total} items`,
                  showSizeChanger: false,
                }}
                rowClassName={(record, index) =>
                  theme === "dark"
                    ? `${styles.customTableRowDark} ${
                        index % 2 === 0 ? styles.evenRowDark : styles.oddRowDark
                      }`
                    : `${styles.customTableRow} ${
                        index % 2 === 0 ? styles.evenRow : styles.oddRow
                      }`
                }
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
      </div>
    </>
  );
};

export default FingerPrintsContent;

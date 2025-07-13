import React, { useEffect, useState } from "react";
import { Table, ConfigProvider, Modal, Button, Popconfirm, Space } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import styles from "./FingerPrints.module.css";
import axios from "axios";

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

const FingerPrints = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalThumbids, setModalThumbids] = useState([]);
  const [modalEmpId, setModalEmpId] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
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
  }, []);

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
    // Optionally, refresh main table data
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

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Fingerprint Registrations</h2>
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
  );
};

export default FingerPrints;

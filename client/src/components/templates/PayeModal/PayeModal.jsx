import React, { useState, useEffect } from "react";
import { Table, InputNumber, Button, ConfigProvider } from "antd";
import axios from "axios";
import Gbutton from "../../atoms/button/Button";
import styles from "./PayeModal.module.css";

const PayeModal = () => {
  const [loading, setLoading] = useState(true);
  const urL = import.meta.env.VITE_BASE_URL;

  const [dataSource, setDataSource] = useState([]);

  const handleChange = (orderId, field, value) => {
    setDataSource((prev) =>
      prev.map((row) =>
        row.orderId === orderId ? { ...row, [field]: value } : row
      )
    );
  };

  const fetchRecord = async () => {
    const res = await axios.get(`${urL}/paye`);
    console.log(res.data);
    setDataSource(res.data);
  };
  const handleRemoveLastRow = () => {
    setDataSource((prev) => prev.slice(0, -1));
  };

  const handleAddRow = () => {
    const neworderId =
      dataSource.length > 0
        ? Math.max(...dataSource.map((row) => Number(row.orderId))) + 1
        : 1;

    const newRow = {
      orderId: neworderId,
      lowerLimit: null,
      upperLimit: null,
      taxRate: null,
    };

    setDataSource((prev) => [...prev, newRow]);
  };

  useEffect(() => {
    fetchRecord();
  }, []);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await axios
        .put(`${urL}/paye`, dataSource)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const customTheme = {
    components: {
      Table: {
        headerBg: "rgba(151, 0, 0, 0.78)",
        headerColor: "white",
        headerSortActiveBg: "rgba(151, 0, 0, 0.78)",
        headerSortHoverBg: "rgba(183, 0, 0, 0.78)",
        cellPaddingBlock: 6,
      },
    },
  };

  const columns = [
    {
      title: "Level",
      dataIndex: "orderId",
      key: "orderId",
      align: "center",
    },
    {
      title: "Lower Limit",
      dataIndex: "lowerLimit",
      key: "lowerLimit",
      align: "center",
      render: (_, record) => (
        <InputNumber
          value={record.lowerLimit}
          onChange={(value) =>
            handleChange(record.orderId, "lowerLimit", value)
          }
        />
      ),
    },
    {
      title: "Higher Limit",
      dataIndex: "upperLimit",
      key: "upperLimit",
      align: "center",
      render: (_, record) => (
        <InputNumber
          value={record.upperLimit}
          onChange={(value) =>
            handleChange(record.orderId, "upperLimit", value)
          }
          placeholder="Null"
        />
      ),
    },
    {
      title: "Tax Percentage",
      dataIndex: "taxRate",
      key: "taxRate",
      align: "center",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={100}
          formatter={(value) => `${value}%`}
          parser={(value) => value.replace("%", "")}
          value={record.taxRate}
          onChange={(value) => handleChange(record.orderId, "taxRate", value)}
        />
      ),
    },
  ];

  return (
    <div>
      <h2>PAYE (Pay As You Earn) Tax Slabs - Yearly</h2>
      <div className={styles.des}>
        Reconfigure Annual Personal Income Tax Data Range.
        <br /> Range Applied for Yearly Income
      </div>
      <br />
      <Button type="primary" onClick={handleAddRow}>
        + Add Level
      </Button>
      <Button type="primary" onClick={handleRemoveLastRow}>
        - Remove Level
      </Button>
      <ConfigProvider theme={customTheme}>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          rowKey="orderId"
        />
      </ConfigProvider>
      <div className={styles.btn}>
        <Gbutton onClick={handleConfirm}>Confirm</Gbutton>
      </div>
    </div>
  );
};

export default PayeModal;

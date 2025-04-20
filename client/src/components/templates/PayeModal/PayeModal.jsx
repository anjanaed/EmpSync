import React, { useState, useEffect } from "react";
import { Table, InputNumber, Button, ConfigProvider } from "antd";
import axios from "axios";
import Gbutton from "../../atoms/button/Button";
import styles from "./PayeModal.module.css";
import { FaRegSave } from "react-icons/fa";
import { BsPlusCircle } from "react-icons/bs";
import { LuCircleMinus } from "react-icons/lu";
import Loading from "../../atoms/loading/loading";

const customTheme = {
  components: {
    Table: {
      headerBg: "rgba(151, 0, 0, 0.78)",
      headerColor: "white",
      headerSortActiveBg: "rgba(151, 0, 0, 0.78)",
      headerSortHoverBg: "rgba(183, 0, 0, 0.78)",
      cellPaddingBlock: 7,
      fontSize: 12,
    },
  },
};

const PayeModal = ({ handleCancel, sucNotify, erNotify }) => {
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
    setDataSource(res.data);
    setLoading(false)
  };


  //Add Line
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


  //Remove Line
  const handleRemoveLastRow = () => {
    setDataSource((prev) => prev.slice(0, -1));
  };



  const handleConfirm = async () => {
    setLoading(true);
    try {
      await axios.put(`${urL}/paye`, dataSource);
      handleCancel();
      sucNotify("PAYE Slab Updated");
    } catch (err) {
      handleCancel();
      erNotify("Something Went Wrong");
    }
    setLoading(false);
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

  useEffect(() => {
    fetchRecord();
  }, []);

  if(loading){
    return <Loading/>
  }

  return (
    <div className={styles.mainBox}>
      <h2>PAYE (Pay As You Earn) Tax Slabs - Yearly</h2>
      <div className={styles.des}>
        Reconfigure Annual Personal Income Tax Data Range.
        <br /> Range Applied for Yearly Income
        <br />
        Leave The Upper Limit Of Last Level As Null
      </div>
      <br />
      <Button type="primary" onClick={handleAddRow}>
        <BsPlusCircle />
        Add Level
      </Button>
      <Button type="primary" onClick={handleRemoveLastRow}>
        <LuCircleMinus />
        Remove Level
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
        <Gbutton onClick={handleConfirm}>
          <>
            <FaRegSave />
            &nbsp; Confirm
          </>
        </Gbutton>
      </div>
    </div>
  );
};

export default PayeModal;

import { React, useState, useEffect } from "react";
import styles from "./Payslip.module.css";
import { Table, Space, ConfigProvider } from "antd";
import axios from "axios";
import { IoMdDownload } from "react-icons/io";
import { LuEye } from "react-icons/lu";
import SearchBar from "../../../molecules/SearchBar/SearchBar";
import Loading from "../../../atoms/loading/loading";

const customTheme = {
  components: {
    Table: {
      headerBg: "rgba(151, 0, 0, 0.78)",
      headerColor: "white",
      cellPaddingBlock: 10,
      headerSortActiveBg: "rgba(151, 0, 0, 0.78)",
      headerSortHoverBg: "rgba(183, 0, 0, 0.78)",
      fontSize: 12,
      fontFamily: "'Figtree', sans-serif",
    },
  },
};

const Payslip = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState();
  const [payslip, setPayslip] = useState();
  const urL = import.meta.env.VITE_BASE_URL;

  const fetchSlips = async (search) => {
    try {
      const res = await axios.get(`${urL}/payroll`, {
        params: {
          search: search || undefined,
        },
      });
      console.log(res);
      const fetchedSlip = res.data.map((slip) => ({
        key: slip.id,
        id: slip.empId,
        name: slip.employee.name,
        month: slip.month,
        salary: `LKR ${slip.netPay}`,
        pdf: slip.payrollPdf,
      }));
      setPayslip(fetchedSlip);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleView = (payslip) => {
    window.open(payslip, "_blank");
  };

  const handleDownload = (payslip) => {
    console.log(payslip);
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
      title: "Month",
      dataIndex: "month",
      key: "month",
      align: "center",
      ellipsis: true,
    },
    {
      title: "Net Salary",
      dataIndex: "salary",
      key: "salary",
      align: "center",
      ellipsis: true,
    },
    {
      title: "View / Download Payslip",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <LuEye
            onClick={() => handleView(record.pdf)}
            className={styles.icons}
            size="20px"
          />
          <IoMdDownload
            onClick={() => handleDownload(record.pdf)}
            className={styles.icons}
            size="20px"
          />
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchSlips(search);
  }, [search]);

  if (loading) {
    return <Loading />;
  }
  return (
    <>
      <div className={styles.home}>
        <div className={styles.homeContent}>
          <div className={styles.homeHead}>
            <div className={styles.headLeft}>Payslips</div>
            <div className={styles.headRight}>
              <SearchBar
                onChange={(e) => setSearch(e.target.value)}
                placeholder={"Search "}
                styles={{ marginRight: "1vw" }}
              />
            </div>
          </div>
          <ConfigProvider theme={customTheme}>
            <Table
              columns={columns}
              dataSource={payslip}
              pagination={{
                position: ["bottomCenter"],
                pageSize: 25,
                showTotal: (total, range) =>
                  `${range[0]}–${range[1]} of ${total} items`,
                showSizeChanger: false,
              }}
            />
          </ConfigProvider>
        </div>
      </div>
    </>
  );
};

export default Payslip;

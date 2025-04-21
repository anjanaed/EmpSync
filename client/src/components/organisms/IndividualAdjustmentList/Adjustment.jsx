import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Space, ConfigProvider } from "antd";
import { MdOutlineDeleteOutline } from "react-icons/md";
import Loading from "../../atoms/loading/loading";
import styles from "./Adjustment.module.css";
import SearchBar from "../../molecules/SearchBar/SearchBar";

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

const Adjustment = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState();
  const [adjustment, setAdjustment] = useState([]);
  const urL = import.meta.env.VITE_BASE_URL;

  const fetchAdjustment = async (searchValue) => {
    try {
      const response = await axios.get(`${urL}/indiadjustment`, {
        params: {
          search: searchValue || undefined,
        },
      });
      const fetchedAdjustment = response.data.map((adj) => ({
        key: adj.id,
        label: adj.label,
        empId: adj.empId,
        allowance: adj.allowance ? "Addition" : "Deduction",
        amount: adj.isPercentage ? `${adj.amount}%` : `${adj.amount} LKR`,
      }));
      setAdjustment(fetchedAdjustment);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${urL}/indiadjustment/${id}`);
      fetchAdjustment();
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  //Columns
  const columns = [
    {
      title: "Employee ID",
      dataIndex: "empId",
      key: "empId",
      align: "center",
      defaultSortOrder: "ascend",
      sorter: (a, b) => {
        const numA = parseInt(a.empId.match(/\d+/)?.[0] || "0", 10);
        const numB = parseInt(b.empId.match(/\d+/)?.[0] || "0", 10);
        return numA - numB;
      },
      ellipsis: true,
    },
    {
      title: "Description",
      dataIndex: "label",
      key: "label",
      align: "center",
      ellipsis: true,
    },
    {
      title: "Addition / Deduction",
      dataIndex: "allowance",
      key: "allowance",
      align: "center",
      ellipsis: true,
      sorter: (a, b) => a.allowance.localeCompare(b.allowance),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <MdOutlineDeleteOutline
            onClick={() => handleDelete(record.key)}
            className={styles.icons}
            size="20px"
          />
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchAdjustment(search);
  }, [search]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className={styles.home}>
        <div className={styles.homeContent}>
          <div className={styles.homeHead}>
            <div className={styles.headLeft}>Individual Adjustment Details</div>
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
              dataSource={adjustment}
              pagination={{
                position: ["bottomCenter"],
                pageSize: 20,
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

export default Adjustment;

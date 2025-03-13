import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Space, Modal, ConfigProvider, Input, Select } from "antd";
import { FiEdit } from "react-icons/fi";
import { MdOutlineDeleteOutline } from "react-icons/md";
import EditModal from "../EditModal/EditModal";
import Loading from "../../loading/loading";
import styles from "./Employee.module.css";

const Employees = () => {
  const [loading, setLoading] = useState(true);
  const { Search } = Input;
  const [employee, setEmployee] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectEmployee, setSelectEmployee] = useState(null);
  const urL = import.meta.env.VITE_BASE_URL;

  const openModal = (empId) => {
    setSelectEmployee(empId);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectEmployee(null);
  };

  const customTheme = {
    components: {
      Table: {
        headerBg: "#d10000",
        headerColor: "white",
        headerSortActiveBg:"rgba(161, 0, 0, 0.78)",
        headerSortHoverBg:"rgba(161, 0, 0, 0.78)",


      },
    },
  };



  const fetchEmployee = async () => {
    try {
      const response = await axios.get(`${urL}/user`);
      const fetchedEmployee = response.data.map((emp) => ({
        key: emp.id,
        id: emp.id,
        name: emp.name,
        role: emp.role,
        email: emp.email,
      }));
      setEmployee(fetchedEmployee);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios
        .delete(`${urL}/user/${id}`)
        .then(() => {
          console.log("User Deleted");
          fetchEmployee();
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const columns = [
    {
      title: "Employee ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      sorter: (a, b) => parseInt(a.id) - parseInt(b.id),
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
      title: "Job Role",
      dataIndex: "role",
      key: "role",
      align: "center",
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <FiEdit
            onClick={() => openModal(record.id)}
            className={styles.icons}
            size="20px"
          />
          <MdOutlineDeleteOutline
            onClick={() => handleDelete(record.id)}
            className={styles.icons}
            size="20px"
          />
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const handleSearch = () => {};

  const onChange = () => {};

  return (
    <>
      <Modal
        open={isModalOpen}
        footer={null}
        width="53vw"
        onCancel={handleCancel}
      >
        <EditModal
          empId={selectEmployee}
          handleCancel={handleCancel}
          fetchEmployee={fetchEmployee}
        />
      </Modal>

      <div className={styles.home}>
        <div className={styles.homeContent}>
          <div className={styles.homeHead}>
            <div className={styles.headLeft}>Registered Employee Details</div>
            <div className={styles.headRight}>
              <Space direction="vertical">
                <Search
                  placeholder="Search Employee"
                  className={styles.searchBar}
                  onSearch={handleSearch}
                  style={{
                    width: 200,
                  }}
                />
              </Space>
              <Select
                showSearch
                allowClear
                placeholder="Select Role"
                className={styles.filter}
                optionFilterProp="label"
                onChange={onChange}
                options={[
                  {
                    value: "HR Manager",
                    label: "HR Manager",
                  },
                  {
                    value: "Kitchen Admin",
                    label: "Kitchen Admin",
                  },
                  {
                    value: "Kitchen Staff",
                    label: "Kitchen Staff",
                  },
                  {
                    value: "Inventory Manager",
                    label: "Inventory Manager",
                  },
                  {
                    value: "Other",
                    label: "Other",
                  },
                ]}
              />
            </div>
          </div>
          <ConfigProvider theme={customTheme}>
            <Table
              columns={columns}
              dataSource={employee}
              onChange={handleTableChange}
              pagination={false}
            />
          </ConfigProvider>
        </div>
      </div>
    </>
  );
};

export default Employees;

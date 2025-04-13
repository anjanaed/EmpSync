import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Table, Space, Modal, ConfigProvider, Input, Select } from "antd";
import { FiEdit } from "react-icons/fi";
import { MdOutlineDeleteOutline } from "react-icons/md";
import EditModal from "../../templates/EditModal/EditModal";
import Loading from "../../atoms/loading/loading";
import styles from "./Employee.module.css";
import SearchBar from "../../molecules/SearchBar/SearchBar";
import { debounce } from "lodash";

const Employees = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState();
  const [frole, setFrole] = useState();
  const { Search } = Input;
  const [emp, setEmp] = useState(null);
  const [employee, setEmployee] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const urL = import.meta.env.VITE_BASE_URL;

  const openModal = (empId) => {
    setEmp(empId);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    // setSelectEmployee(null);
  };

  useEffect(() => {
    debouncedFetch(search, frole);
  }, [search, frole]);

  const customTheme = {
    components: {
      Table: {
        headerBg: "rgba(151, 0, 0, 0.78)",
        headerColor: "white",
        headerSortActiveBg: "rgba(151, 0, 0, 0.78)",
        headerSortHoverBg: "rgba(183, 0, 0, 0.78)",
      },
    },
  };

  const fetchEmployee = async (searchValue, roleValue) => {
    try {
      const response = await axios.get(`${urL}/user`, {
        params: {
          search: searchValue || undefined,
          role: roleValue || undefined,
        },
      });
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

  const debouncedFetch = useCallback(
    debounce((searchValue, roleValue) => {
      fetchEmployee(searchValue, roleValue);
    }, 300),
    []
  );

  const modalStyles={
    mask: {
      backdropFilter: 'blur(12px)',
    },
  }

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

  return (
    <>
      <Modal
        open={isModalOpen}
        footer={null}
        width="65vw"
        onCancel={handleCancel}
        styles={modalStyles}
      >
        <EditModal
          empId={emp}
          handleCancel={handleCancel}
          fetchEmployee={fetchEmployee}
        />
      </Modal>

      <div className={styles.home}>
        <div className={styles.homeContent}>
          <div className={styles.homeHead}>
            <div className={styles.headLeft}>Registered Employee Details</div>
            <div className={styles.headRight}>
              <SearchBar
                onChange={(e) => setSearch(e.target.value)}
                placeholder={"Search Employee"}
                onSearch={Search}
                styles={{ marginRight: "1vw" }}
              />

              <Select
                showSearch
                allowClear
                onChange={(value) => setFrole(value)}
                placeholder="Select Role"
                className={styles.filter}
                optionFilterProp="label"
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
                ]}
              />
            </div>
          </div>
          <ConfigProvider theme={customTheme}>
            <Table
              columns={columns}
              dataSource={employee}
              pagination={{position:["bottomCenter"],
                pageSize:20,
                showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} items`,
                showSizeChanger:false,
              }}
            />
          </ConfigProvider>
        </div>
      </div>
    </>
  );
};

export default Employees;

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Table, Space, Modal, ConfigProvider, Select, Popconfirm } from "antd";
import { FiEdit } from "react-icons/fi";
import { MdOutlineDeleteOutline } from "react-icons/md";
import EditModal from "../../../templates/HR/EditModal/EditModal";
import Loading from "../../../atoms/loading/loading";
import styles from "./Employee.module.css";
import SearchBar from "../../../molecules/SearchBar/SearchBar";
import { Toaster, toast } from "sonner";
import { debounce } from "lodash";
import { usePopup } from "../../../../contexts/PopupContext";

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

const roleMap = {
  KITCHEN_ADMIN: "Kitchen Administrator",
  KITCHEN_STAFF: "Kitchen Staff",
  INVENTORY_ADMIN: "Inventory Manager",
  HR_ADMIN: "Human Resource Manager",
};

const Employees = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState();
  const [frole, setFrole] = useState();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employee, setEmployee] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const urL = import.meta.env.VITE_BASE_URL;
  const { success, error } = usePopup();

  const openModal = (empId) => {
    setSelectedEmployee(empId);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
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

  //Preventing instant API calls when searching
  const debouncedFetch = useCallback(
    debounce((searchValue, roleValue) => {
      fetchEmployee(searchValue, roleValue);
    }, 300),
    []
  );

  const modalStyles = {
    mask: {
      backdropFilter: "blur(12px)",
    },
  };


  const handleDelete = async (id, email) => {
    setLoading(true);
    try {
      await axios.delete(`${urL}/user/${id}`);
      await axios.post(`${urL}/auth/delete`, { email: email });
      fetchEmployee();
      success("User Removed Successfully!");
    } catch (err) {
      console.log(err);
      error("Something went Wrong!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployee();
  }, []);

  useEffect(() => {
    debouncedFetch(search, frole);
  }, [search, frole, debouncedFetch]);

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
      render: (role) => roleMap[role] || role,
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
            size="15px"
          />
          <Popconfirm
            title={
              <span style={{ fontSize: "0.9vw" }}>
                Delete User {record.id}
              </span>
            }
            placement="bottom"
            onConfirm={() => handleDelete(record.id, record.email)}
            description={
              <span style={{ fontStyle: "italic", fontSize: "0.8vw" }}>
                Are You Sure to Delete
              </span>
            }
            okText={<span style={{ fontSize: "0.8vw" }}>Yes</span>}
            cancelText={<span style={{ fontSize: "0.8vw" }}>No</span>}
          >
            {" "}
            <MdOutlineDeleteOutline className={styles.icons} size="17px" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Toaster richColors />
      <Modal
        open={isModalOpen}
        footer={null}
        width="66vw"
        onCancel={handleCancel}
        styles={modalStyles}
      >
        <EditModal
          empId={selectedEmployee}
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

export default Employees;

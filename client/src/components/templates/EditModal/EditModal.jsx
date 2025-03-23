import { React, useState, useEffect } from "react";
import { Tabs, Form, Input, DatePicker, Select, Space } from "antd";
import styles from "./EditModal.module.css";
import Loading from "../../atoms/loading/loading";
import dayjs from "dayjs";
import { LuSave } from "react-icons/lu";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Gbutton from "../../atoms/button/Button";
const dateFormat = "YYYY/MM/DD";
import { RiFingerprintLine } from "react-icons/ri";

const EditModal = ({ empId, handleCancel, fetchEmployee }) => {
  const [customRole, setCustomRole] = useState("");
  const [form] = Form.useForm();
  const [currentEmployee, setCurrentEmployee] = useState({
    id: "",
    name: "",
    role: "",
    dob: "",
    telephone: "",
    gender: "",
    address: "",
    email: "",
    password: "",
    salary: "",
    thumbId: "",
    supId: "",
    language: "",
    height: "",
    weight: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const urL = import.meta.env.VITE_BASE_URL;
  const getEmployee = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${urL}/user/${empId}`);
      setCurrentEmployee(res.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmployee();
  }, [empId]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios
        .put(`${urL}/user/${empId}`, currentEmployee)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
      handleCancel();
      fetchEmployee;
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }
  const formItemLayout = {
    labelCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 7,
      },
    },
    wrapperCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 14,
      },
    },
  };
  return (
    <>
      <div className={styles.head}>Edit Employee - {currentEmployee.id}</div>
      <div className={styles.headDes}>
        Update Employee Information. Click Save Changes When You're Done.
      </div>

      <div className={`${styles.yo} customTabs`}>
        <Form {...formItemLayout} form={form}>
          <Tabs
            className={styles.tab}
            defaultActiveKey="personal"
            items={[
              {
                key: "personal",
                size: "large",
                label: <span className={styles.tabHead}>Personal Details</span>,
                children: (
                  <>
                    <div className={styles.con}>
                      <Form.Item
                        name="fullname"
                        label="Full Name"
                        styles={{
                          explain: {
                            color: "blue",
                          },
                        }}
                        rules={[
                          {
                            required: true,
                            message: "Please input your Name!",
                            whitespace: true,
                          },
                        ]}
                      >
                        <Input
                          defaultValue={currentEmployee.name}
                          placeholder="Enter Name"
                          onChange={(e) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              name: e.target.value,
                            })
                          }
                        />
                      </Form.Item>
                      <Form.Item
                        name="email"
                        label="E-mail"
                        rules={[
                          {
                            type: "email",
                            message: "The input is not valid E-mail!",
                          },
                          {
                            required: true,
                            message: "Please input your E-mail!",
                          },
                        ]}
                      >
                        <Input
                          defaultValue={currentEmployee.email}
                          placeholder="Enter Email Address"
                          onChange={(e) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              email: e.target.value,
                            })
                          }
                        />
                      </Form.Item>
                      <Form.Item name="phone" label="Phone Number">
                        <Input
                          defaultValue={currentEmployee.telephone}
                          placeholder="Enter Mobile Number"
                          onChange={(e) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              telephone: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        name="gender"
                        label="Gender"
                        rules={[
                          {
                            required: true,
                            message: "Please select gender!",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select Gender"
                          defaultValue={currentEmployee.gender}
                          onChange={(value) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              gender: value,
                            })
                          }
                          className={styles.select}
                        >
                          <Select.Option value="Male">Male</Select.Option>
                          <Select.Option value="Female">Female</Select.Option>
                          <Select.Option value="Other">Other</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item name="address" label="Residential Address">
                        <Input
                          defaultValue={currentEmployee.address}
                          placeholder="Enter Address"
                          onChange={(e) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              address: e.target.value,
                            })
                          }
                        />
                      </Form.Item>
                      <Form.Item
                        name="dob"
                        label="Date of Birth"
                        rules={[
                          {
                            required: true,
                            message: "Please Enter Birth Date!",
                          },
                        ]}
                      >
                        <DatePicker
                          defaultValue={dayjs(currentEmployee.dob, dateFormat)}
                          onChange={(date) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              dob: moment(date).format("YYYY-MM-DD"),
                            })
                          }
                          placeholder="Select Birth Date"
                          style={{ width: "100%" }}
                          className={styles.select}
                        />
                      </Form.Item>
                    </div>
                  </>
                ),
              },
              {
                key: "employment",
                label: <span className={styles.tabHead}>Employment</span>,
                children: (
                  <>
                    <div className={styles.con}>
                      <Form.Item
                        name="empId"
                        label="Employee ID"
                        rules={[
                          {
                            required: true,
                            message: "Please Enter ID!",
                          },
                        ]}
                      >
                        <Input
                          defaultValue={currentEmployee.id}
                          placeholder="Enter ID"
                          onChange={(e) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              id: e.target.value,
                            })
                          }
                        />
                      </Form.Item>
                      <Form.Item name="supId" label="Supervisor's ID">
                        <Input
                          defaultValue={currentEmployee.supId}
                          onChange={(e) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              supId: e.target.value,
                            })
                          }
                          placeholder="Enter Supervisor ID (If Available)"
                        />
                      </Form.Item>
                      <Form.Item
                        label={
                          <>
                            <p style={{ color: "red" }}>* </p>&#8201; Job Role
                          </>
                        }
                        name="role"
                      >
                        <Space.Compact className={styles.select}>
                          <Form.Item
                            noStyle
                            name="selectRole"
                            style={{ flex: "1" }}
                            rules={[
                              {
                                required: true,
                                message: "Please Enter Role!",
                              },
                            ]}
                          >
                            <Select
                              defaultValue={currentEmployee.role}
                              onChange={(value) => {
                                setCurrentEmployee({
                                  ...currentEmployee,
                                  role: value,
                                });
                                setCustomRole(value);
                              }}
                              style={{ width: "100%" }}
                              placeholder="Select Role"
                            >
                              <Select.Option value="HrManager">
                                HR Administrator
                              </Select.Option>
                              <Select.Option value="KitchenAdmin">
                                Kitchen Admin
                              </Select.Option>
                              <Select.Option value="KitchenStaff">
                                Kitchen Staff
                              </Select.Option>
                              <Select.Option value="InventoryManager">
                                Inventory Manager
                              </Select.Option>
                              <Select.Option value="Other">Other</Select.Option>
                            </Select>
                          </Form.Item>
                          <Form.Item
                            name="customRole"
                            noStyle
                            style={{ flex: "2" }}
                          >
                            <Input
                              style={{ width: "100%" }}
                              onChange={(e) => {
                                setCurrentEmployee({
                                  ...currentEmployee,
                                  role: e.target.value,
                                });
                              }}
                              placeholder="If Other, Enter Job Role"
                              disabled={customRole !== "Other"}
                              required={false}
                            />
                          </Form.Item>
                        </Space.Compact>
                      </Form.Item>
                      <Form.Item
                        name="salary"
                        label="Basic Salary"
                        rules={[
                          {
                            required: true,
                            message: "Please Enter Salary!",
                          },
                        ]}
                      >
                        <Input
                          defaultValue={currentEmployee.salary}
                          placeholder="Enter Basic Salary"
                          onChange={(e) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              salary: e.target.value,
                            })
                          }
                        />
                      </Form.Item>
                    </div>
                  </>
                ),
              },
              {
                key: "additional",
                label: <span className={styles.tabHead}>Additional</span>,
                children: (
                  <>
                    <div className={styles.con}>
                      <Form.Item
                        name="language"
                        label="Preferred Language"
                        rules={[
                          {
                            required: true,
                            message: "Please Select Language!",
                          },
                        ]}
                      >
                        <Select
                          className={styles.select}
                          defaultValue={currentEmployee.language}
                          placeholder="Select Language"
                          onChange={(value) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              language: value,
                            })
                          }
                        >
                          <Select.Option value="Sinhala">Sinhala</Select.Option>
                          <Select.Option value="English">English</Select.Option>
                          <Select.Option value="Tamil">Tamil</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item name="height" label="Height">
                        <Input
                          defaultValue={currentEmployee.height}
                          onChange={(e) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              height: e.target.value,
                            })
                          }
                          placeholder="Enter Height (cm)"
                        />
                      </Form.Item>
                      <Form.Item name="weight" label="Weight">
                        <Input
                          defaultValue={currentEmployee.weight}
                          onChange={(e) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              weight: e.target.value,
                            })
                          }
                          placeholder="Enter Weight (Kg)"
                        />
                      </Form.Item>
                      <label className={styles.fingerLabel}>
                        Finger Print:{" "}
                      </label>
                      <button className={styles.rescanBtn}>
                        <RiFingerprintLine size={20} /> &nbsp;Rescan
                      </button>
                    </div>
                    <div className={styles.subBtn}>
                      <Gbutton onClick={handleUpdate}>
                        <>
                          <LuSave size={16} />
                          &nbsp;&nbsp;Save Changes
                        </>
                      </Gbutton>
                    </div>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </div>
    </>
  );
};

export default EditModal;

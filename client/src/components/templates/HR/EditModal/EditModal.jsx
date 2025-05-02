import { React, useState, useEffect } from "react";
import {
  Tabs,
  Form,
  Input,
  DatePicker,
  Select,
  Space,
  InputNumber,
} from "antd";
import styles from "./EditModal.module.css";
import Loading from "../../../atoms/loading/loading";
import dayjs from "dayjs";
import {Toaster,toast} from 'sonner'
import { LuSave } from "react-icons/lu";
import axios from "axios";
import Gbutton from "../../../atoms/button/Button";
import { RiFingerprintLine } from "react-icons/ri";

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
  const urL = import.meta.env.VITE_BASE_URL;

  const fetchRecord = async () => {
    try {
      const res = await axios.get(`${urL}/user/${empId}`);
      const employee = res.data;
      employee.dob = dayjs(employee.dob);
      setCurrentEmployee(employee);
      form.setFieldsValue(employee);
    } catch (err) {
      console.log(err);
      erNofify("Error Fetching User Details")
    }
    setLoading(false);
  };

  const sucNofify = (message) => {
    setTimeout(
      () =>
        toast.success(message, {
          duration: 2500,
          position: "top-center",
        }),
      300
    );
  };

  const erNofify = (message) => {
    setzTimeout(
      () =>
        toast.error(message, {
          duration: 2500,
          position: "top-center",
        }),
      300
    );
  };

  useEffect(() => {
    fetchRecord();
  }, [empId]);

  const handleUpdate = async () => {
    await form.validateFields();
    setLoading(true);
    try {
      await axios.put(`${urL}/user/${empId}`, currentEmployee);
      handleCancel();
      fetchEmployee();
      sucNofify("User Information Updated Successfully!")
    } catch (err) {
      console.log(err);
      erNofify("User Update Failed")
    }
    setLoading(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
        <Toaster richColors/>
      <div className={styles.head}>Edit Employee - {currentEmployee.id}</div>
      <div className={styles.headDes}>
        Update Employee Information. Click Save Changes When You're Done.
      </div>

      <div className={`${styles.yo} customTabs`}>
        <Form {...formItemLayout} form={form} initialValues={currentEmployee}>
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
                        name="name"
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
                          {
                            pattern: /^[A-Za-z\s]+$/,
                            message: "Name can only include letters and spaces",
                          },
                        ]}
                      >
                        <Input
                          maxLength={45}
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
                          maxLength={35}
                          placeholder="Enter Email Address"
                          onChange={(e) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              email: e.target.value,
                            })
                          }
                        />
                      </Form.Item>
                      <Form.Item
                        name="telephone"
                        label="Phone Number"
                        rules={[
                          {
                            pattern: /^\d{10}$/,
                            message: "Mobile Number must be include 10 digits",
                          },
                        ]}
                      >
                        <Input
                          maxLength={10}
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
                          maxLength={65}
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
                          onChange={(date) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              dob: dayjs(date).format("YYYY-MM-DD"),
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
                        name="id"
                        label="Employee ID"
                        rules={[
                          {
                            required: true,
                            message: "Please Enter ID!",
                          },
                        ]}
                      >
                        <Input disabled />
                      </Form.Item>
                      <Form.Item name="supId" label="Supervisor's ID">
                        <Input
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
                        rules={[
                          {
                            required: true,
                            message: "Please Enter ID!",
                          },
                        ]}
                        label="Job Role"
                        name="roleHold"
                      >
                        <Space.Compact className={styles.select}>
                          <Form.Item
                            noStyle
                            name="role"
                            style={{ flex: "1" }}
                            rules={[
                              {
                                required: true,
                                message: "Please select a role!",
                              },
                            ]}
                          >
                            <Select
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
                              <Select.Option value="HR_ADMIN">
                                Human Resources Manager
                              </Select.Option>
                              <Select.Option value="KITCHEN_ADMIN">
                                Kitchen Administrator
                              </Select.Option>
                              <Select.Option value="KITCHEN_STAFF">
                                Kitchen Staff
                              </Select.Option>
                              <Select.Option value="INVENTORY_ADMIN">
                                Inventory Manager
                              </Select.Option>
                              <Select.Option value="Other">Other</Select.Option>
                            </Select>
                          </Form.Item>

                          <Form.Item
                            noStyle
                            name="customRole"
                            style={{ flex: "2" }}
                            rules={[
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (
                                    getFieldValue("role") === "Other" &&
                                    !value
                                  ) {
                                    return Promise.reject(
                                      "Please enter custom role!"
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              }),
                            ]}
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
                        <InputNumber
                          maxLength={12}
                          min={0}
                          style={{ width: "100%" }}
                          formatter={(value) => `${value} LKR`}
                          parser={(value) => value.replace(" LKR", "")}
                          placeholder="Enter Basic Salary"
                          onChange={(e) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              salary: parseFloat(e.target.value) || 0,
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
                        <InputNumber
                          maxLength={3}
                          min={0}
                          style={{ width: "100%" }}
                          formatter={(value) => `${value} cm`}
                          parser={(value) => value.replace(" cm", "")}
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
                        <InputNumber
                          maxLength={3}
                          min={0}
                          style={{ width: "100%" }}
                          formatter={(value) => `${value} Kg`}
                          parser={(value) => value.replace(" Kg", "")}
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

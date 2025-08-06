import { React, useState, useEffect } from "react";
import {
  Tabs,
  Form,
  Input,
  DatePicker,
  Select,
  Space,
  InputNumber,
  message,
} from "antd";
import styles from "./EditModal.module.css";
import Loading from "../../../atoms/loading/loading";
import dayjs from "dayjs";
import { LuSave } from "react-icons/lu";
import axios from "axios";
import Gbutton from "../../../atoms/button/Button";
import { RiFingerprintLine } from "react-icons/ri";
import { usePopup } from "../../../../contexts/PopupContext";
import { useAuth } from "../../../../contexts/AuthContext";
import { useTheme } from "../../../../contexts/ThemeContext";

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
  const [form] = Form.useForm();
  const { success, error } = usePopup();
  const { authData } = useAuth();
  const { theme } = useTheme();
  const token = authData?.accessToken;

  const [currentEmployee, setCurrentEmployee] = useState({
    id: "",
    empNo: "",
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
      const res = await axios.get(`${urL}/user/${empId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const employee = res.data;
      employee.dob = dayjs(employee.dob);
      setCurrentEmployee(employee);
      form.setFieldsValue(employee);
    } catch (err) {
      console.log(err);
      error("Error Fetching User Details");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecord();
  }, [empId]);

  const handleUpdate = async () => {
    try {
      const token = authData?.accessToken;
      await form.validateFields();
      setLoading(true);
      const {
        organizationId,
        organization,
        createdAt,
        payrolls,
        permissions,
        userPermissions,
        individualSalaryAdjustments,
        passkey,
        passkeyRegeneratedBy,
        passkeyRegeneratedAt,
        ...updateData
      } = currentEmployee;

      await axios.put(`${urL}/user/${empId}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      handleCancel();
      fetchEmployee();
      success("User Information Updated Successfully!");
    } catch (err) {
      console.log(err);

      // Show backend error message if available
      if (err.response?.data?.message) {
        error(err.response.data.message);
      } else if (err?.errorFields) {
        const allMessages = err.errorFields
          .map((field) => field.errors.join(", "))
          .join(" | ");
        error(allMessages);
      } else {
        error(err?.message || "Update failed");
      }
    }
    setLoading(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div
      className={`${theme === "dark" ? "dark" : ""} ${
        theme === "dark" ? styles.darkWrapper : styles.modalContainer
      }`}
    >
      <div className={styles.headWrapper}>
        <div className={styles.head}>
          Edit Employee - {currentEmployee.empNo}
        </div>
        <div className={styles.empIdTopRight}>
          ID: <b>{currentEmployee.id}</b>
        </div>
      </div>
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
                          disabled
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
                      <Form.Item name="empNo" label="Employee No">
                        <Input
                          onChange={(e) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              empNo: e.target.value,
                            })
                          }
                          placeholder="Enter Employee Number"
                        />
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
                        name="role"
                        label="Job Role"
                        rules={[
                          {
                            required: true,
                            message: "Please enter a role!",
                          },
                        ]}
                      >
                        <Input
                          disabled={
                            currentEmployee.role === "HR_ADMIN" ||
                            currentEmployee.role === "KITCHEN_ADMIN" ||
                            currentEmployee.role === "KITCHEN_STAFF"
                          }
                          placeholder="Enter Job Role"
                          onChange={(e) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              role: e.target.value,
                            })
                          }
                        />
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
                          onChange={(value) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              salary: parseFloat(value) || 0,
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
                          maxLength={6}
                          min={0}
                          style={{ width: "100%" }}
                          formatter={(value) => (value ? `${value} cm` : "")}
                          parser={(value) => value.replace(/[^\d]/g, "")}
                          onChange={(value) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              height: value,
                            })
                          }
                          placeholder="Enter Height (cm)"
                        />
                      </Form.Item>
                      <Form.Item name="weight" label="Weight">
                        <InputNumber
                          maxLength={6}
                          min={0}
                          style={{ width: "100%" }}
                          formatter={(value) => (value ? `${value} Kg` : "")}
                          parser={(value) => value.replace(/[^\d]/g, "")}
                          onChange={(value) =>
                            setCurrentEmployee({
                              ...currentEmployee,
                              weight: value,
                            })
                          }
                          placeholder="Enter Weight (Kg)"
                        />
                      </Form.Item>
                    </div>
                    <div className={styles.subBtn}>
                      <button onClick={handleUpdate} className={styles.saveBtn}>
                        <span className={styles.btnContent}>
                          <LuSave size={16} />
                          <span>Save Changes</span>
                        </span>
                      </button>
                    </div>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </div>
    </div>
  );
};

export default EditModal;

import React, { useState } from "react";
import { DatePicker, Form, Space, Input, Select, InputNumber } from "antd";
import styles from "./Register.module.css";
import { IoIosArrowBack } from "react-icons/io";
import FingerPrint from "../../../atoms/FingerPrint/FingerPrint";
import Loading from "../../../atoms/loading/loading";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { AiOutlineCaretRight } from "react-icons/ai";
import Gbutton from "../../../atoms/button/Button";
import axios from "axios";
import { usePopup } from "../../../../contexts/PopupContext";

const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};

const Register = () => {
  const [menu, setMenu] = useState(1);
  const urL = import.meta.env.VITE_BASE_URL;
  const auth0Url = import.meta.env.VITE_AUTH0_URL;
  const auth0Id = import.meta.env.VITE_AUTH0_ID;
  const navigate = useNavigate();
  const [id, setId] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [dob, setDob] = useState(null);
  const [address, setAddress] = useState(null);
  const [tel, setTel] = useState(null);
  const [salary, setSalary] = useState(null);
  const [name, setName] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [customJobRole, setCustomJobRole] = useState(null);
  const [gender, setGender] = useState("");
  const [lang, setLang] = useState("");
  const [supId, setSupId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { success, error } = usePopup();

  //Registering Process
  const handleRegister = async () => {
    setLoading(true);
    let role = jobRole;
    if (role === "Other") {
      role = customJobRole;
    }

    try {
      const payload = {
        id,
        name,
        role,
        dob,
        telephone: tel,
        gender,
        address,
        email,
        password,
        supId,
        language: lang,
        salary: parseInt(salary),
      };
      await axios.post(`${urL}/user`, payload);
    } catch (err) {
      error(
        `Registration Failed: ${err.response?.data?.message || "Unknown error"}`
      );
      setLoading(false);
      return;
    }
    try {
      await signUpUser({ email, password, id });
      success("User Registered Successfully");
      navigate("/EmployeePage");
    } catch (err) {
      await axios.delete(`${urL}/user/${id}`);
      console.error("Registration Error:", err);
      error(
        `Registration Failed: ${err.response?.data?.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const signUpUser = async ({ email, password, id }) => {
    try {
      const res = await axios.post(`https://${auth0Url}/dbconnections/signup`, {
        client_id: auth0Id,
        email,
        username: id,
        password,
        connection: "Username-Password-Authentication",
      });
    } catch (error) {
      console.error("Auth0 Registration Error:", error);
      error(`Registration Failed: ${error.response.data.message}`);
      setLoading(false);
      throw error;
    }
  };

  const handleNext = async () => {
    await form.validateFields();
    setMenu(2);
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <div className={styles.formContainer}>
      {menu == 1 && (
        <>
          <div className={styles.heading}>New Employee Onboarding</div>
          <Form
            {...formItemLayout}
            form={form}
            name="register"
            scrollToFirstError
          >
            <div className={styles.sides}>
              <div className={styles.sideOne}>
                <Form.Item
                  name="fullname"
                  label="Full Name"
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
                    placeholder="Enter Name"
                    maxLength={40}
                    onChange={(e) => setName(e.target.value)}
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
                    placeholder="Enter Email Address"
                    maxLength={40}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="Password (Portal Access)"
                  rules={[
                    {
                      required: true,
                      message: "Please input your password!",
                    },
                    {
                      pattern:
                        /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
                      message:
                        "Password must be at least 8 characters, include a capital letter and a special character.",
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    placeholder="Enter Password"
                    maxLength={20}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Item>
                <Form.Item
                  name="phone"
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
                    onChange={(e) => setTel(e.target.value)}
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
                    onChange={(value) => setGender(value)}
                  >
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Job Role" required>
                  <Space.Compact style={{ display: "flex", width: "100%" }}>
                    <Form.Item
                      noStyle
                      name="selectRole"
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
                          setJobRole(value);
                        }}
                        style={{ width: "100%" }}
                        placeholder="Select Role"
                      >
                        <Option value="HR_ADMIN">Human Resource Manager</Option>
                        <Option value="KITCHEN_ADMIN">
                          Kitchen Administrator
                        </Option>
                        <Option value="KITCHEN_STAFF">Kitchen Staff</Option>
                        <Option value="INVENTORY_ADMIN">
                          Inventory Manager
                        </Option>
                        <Option value="Other">Other</Option>
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
                              getFieldValue("selectRole") === "Other" &&
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
                        onChange={(e) => setCustomJobRole(e.target.value)}
                        placeholder="If Other, Enter Job Role"
                        disabled={jobRole !== "Other"}
                      />
                    </Form.Item>
                  </Space.Compact>
                </Form.Item>
              </div>
              <div className={styles.sideOne}>
                <Form.Item
                  name="empId"
                  label="Employee ID"
                  rules={[
                    {
                      required: true,
                      message: "Please Enter ID!",
                    },
                    {
                      pattern: /^\S{4}$/,
                      message:
                        "ID Must be Exactly 4 Characters With No Spaces!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter ID"
                    maxLength={10}
                    onChange={(e) => setId(e.target.value)}
                  />
                </Form.Item>
                <Form.Item name="address" label="Residential Address">
                  <Input
                    maxLength={65}
                    placeholder="Enter Address"
                    onChange={(e) => setAddress(e.target.value)}
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
                      setDob(moment(date).format("YYYY-MM-DD"))
                    }
                    placeholder="Select Birth Date"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item name="supId" label="Supervisor's ID">
                  <Input
                    onChange={(e) => setSupId(e.target.value)}
                    maxLength={10}
                    placeholder="Enter Supervisor ID (If Available)"
                  />
                </Form.Item>
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
                    placeholder="Select Language"
                    onChange={(value) => setLang(value)}
                  >
                    <Option value="Sinhala">Sinhala</Option>
                    <Option value="English">English</Option>
                    <Option value="Tamil">Tamil</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="salary"
                  label="Basic Salary (LKR)"
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
                    onChange={(value) => setSalary(value)}
                  />
                </Form.Item>
              </div>
            </div>
            <div className={styles.btnContainer}>
              <Gbutton width={200} onClick={handleNext}>
                <>
                  Next &nbsp; <AiOutlineCaretRight />
                </>
              </Gbutton>
            </div>
          </Form>
        </>
      )}
      {menu == 2 && (
        <>
          <div className={styles.finHeader}>
            <div className={styles.backIcon} onClick={() => setMenu(1)}>
              <IoIosArrowBack />
            </div>
            <div className={styles.head}>
              Place Your Finger to Complete Registration
            </div>
          </div>
          <div className={styles.fingerPrint}>
            <FingerPrint />
          </div>
          <div className={styles.btnContainer}>
            <Gbutton
              width={300}
              onClick={handleRegister}
              className={styles.btn}
            >
              Register Without Finger Print
            </Gbutton>
          </div>
        </>
      )}
    </div>
  );
};

export default Register;

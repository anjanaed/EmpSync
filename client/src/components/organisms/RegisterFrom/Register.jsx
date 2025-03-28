import React, { useState } from "react";
import { DatePicker, Form, Space, Input, Select } from "antd";
import styles from "./Register.module.css";
import { IoIosArrowBack } from "react-icons/io";
import FingerPrint from "../../atoms/FingerPrint/FingerPrint";
import Loading from "../../atoms/loading/loading";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { AiOutlineCaretRight } from "react-icons/ai";
import Gbutton from "../../atoms/button/Button";
import axios from "axios";

const Register = () => {
  const [menu, setMenu] = useState(1);
  const urL = import.meta.env.VITE_BASE_URL;
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

  const handleRegister = async () => {
    setLoading(true);
    let role = jobRole;
    if (role === "Other") {
      role = customJobRole;
    }
    try {
      const payload = {
        id: id,
        name: name,
        role: role,
        dob: dob,
        telephone: tel,
        gender: gender,
        address: address,
        email: email,
        password: password,
        supId: supId,
        language: lang,
        salary: parseInt(salary),
      };
      await axios
        .post(`${urL}/user`, payload)
        .then((res) => {
          console.log(res);
          navigate("/");
        })
        .catch((err) => {
          if (
            err.response.data.message ==
            "Id, Name, Email, Password must be filled"
          ) {
            setMenu(1);
            setRequired(true);
          } else {
            setRequired(false);
          }
        });
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const handleNext = async () => {
    await form.validateFields();
    setMenu(2);
  };

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

  const [form] = Form.useForm();

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select
        style={{
          width: 70,
        }}
      >
        <Option value="94">+94</Option>
      </Select>
    </Form.Item>
  );

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
            initialValues={{
              prefix: "+94",
            }}
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
                  ]}
                >
                  <Input
                    placeholder="Enter Name"
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
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    placeholder="Enter Password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Item>
                <Form.Item name="phone" label="Phone Number">
                  <Input
                    placeholder="Enter Mobile Number"
                    onChange={(e) => setTel(e.target.value)}
                    addonBefore={prefixSelector}
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
                <Form.Item
                  label={
                    <>
                      <p style={{ color: "red" }}>* </p>&#8201; Job Role
                    </>
                  }
                  name="role"
                >
                  <Space.Compact style={{ display: "flex", width: "100%" }}>
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
                        onChange={(value) => setJobRole(value)}
                        style={{ width: "100%" }}
                        placeholder="Select Role"
                      >
                        <Option value="HrManager">HR Administrator</Option>
                        <Option value="KitchenAdmin">Kitchen Admin</Option>
                        <Option value="KitchenStaff">Kitchen Staff</Option>
                        <Option value="InventoryManager">
                          Inventory Manager
                        </Option>
                        <Option value="Other">Other</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="customRole" noStyle style={{ flex: "2" }}>
                      <Input
                        style={{ width: "100%" }}
                        onChange={(e) => setCustomJobRole(e.target.value)}
                        placeholder="If Other, Enter Job Role"
                        disabled={jobRole !== "Other"}
                        required={false}
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
                  ]}
                >
                  <Input
                    placeholder="Enter ID"
                    onChange={(e) => setId(e.target.value)}
                  />
                </Form.Item>
                <Form.Item name="address" label="Residential Address">
                  <Input
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
                  <Input placeholder="Enter Supervisor ID (If Available)" />
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
                  label="Basic Salary"
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Salary!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter Basic Salary"
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>
            <div className={styles.btnContainer}>
              <Gbutton onClick={handleNext}>
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
            <Gbutton onClick={handleRegister} className={styles.btn}>
              Register Without Finger Print
            </Gbutton>
          </div>
        </>
      )}
    </div>
  );
};

export default Register;

import React, { useState } from "react";
import { DatePicker, Form, Space, Input, Select, InputNumber } from "antd";
import styles from "./Register.module.css";
import { IoIosArrowBack } from "react-icons/io";
import Loading from "../../../atoms/loading/loading.jsx";
import ImportModal from "../../../templates/HR/ImportModal/ImportModal.jsx";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { AiOutlineCaretRight } from "react-icons/ai";
import { useAuth } from "../../../../contexts/AuthContext.jsx";
import { Modal } from "antd";
import axios from "axios";
import { usePopup } from "../../../../contexts/PopupContext.jsx";
import { FaFileImport } from "react-icons/fa6";

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
  const [passkey, setPasskey] = useState(null);
  const urL = import.meta.env.VITE_BASE_URL;
  const auth0Url = import.meta.env.VITE_AUTH0_URL;
  const auth0Id = import.meta.env.VITE_AUTH0_ID;
  const navigate = useNavigate();
  const [id, setId] = useState(null);
  const [empNo, setEmpNo] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [dob, setDob] = useState(null);
  const [address, setAddress] = useState(null);
  const [tel, setTel] = useState(null);
  const [salary, setSalary] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [name, setName] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [gender, setGender] = useState("");
  const [lang, setLang] = useState("");
  const [supId, setSupId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { success, error } = usePopup();
  const { authData } = useAuth();

  //Registering Process
  const handleRegister = async () => {
    setLoading(true);
    try {
      const token = authData?.accessToken;

      const payload = {
        id,
        empNo,
        name,
        role:jobRole,
        dob,
        telephone: tel,
        gender,
        address,
        email,
        supId,
        language: lang,
        organizationId: authData?.orgId,
        salary: parseInt(salary),
      };
      const res = await axios.post(`${urL}/user`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data && res.data.passkey) {
        setPasskey(res.data.passkey);
        setMenu(3); // Show passkey screen
      }
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
      // navigate("/EmployeePage");
    } catch (err) {
      await axios.delete(`${urL}/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.error("Registration Error:", err);
      error(
        `Registration Failed: ${err.response?.data?.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const generateUserId = async () => {
    const org = authData?.orgId || "O001";
    if (!org) return;

    try {
      const res = await axios.get(`${urL}/user/last-empno/${org}`);
      const lastEmpNo = res.data;
      let newEmpNo;
      console.log("Last Employee No:", lastEmpNo);

      if (lastEmpNo && lastEmpNo.startsWith(org + "E")) {
        // Extract the number after the last 'E'
        const num = parseInt(lastEmpNo.slice((org + "E").length - 1 + 1)) + 1;
        newEmpNo = `${org}E${num.toString().padStart(3, "0")}`;
      } else {
        newEmpNo = `${org}E001`;
      }
      setId(newEmpNo);
      console.log(newEmpNo);
    } catch (err) {
      console.error("Failed to generate user ID", err);
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
    await generateUserId();
    setMenu(2);
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <div className={styles.formContainer}>
      <Modal
        open={isImportModalOpen}
        footer={null}
        width="70vw"
        onCancel={() => setIsImportModalOpen(false)}
        styles={{
          mask: {
            backdropFilter: "blur(12px)",
          },
        }}
      >
        <ImportModal />
      </Modal>
      {menu == 1 && (
        <>
          <div className={styles.headingRow}>
            <div className={styles.heading}>New Employee Onboarding</div>
            <button
              className={styles.importBtn}
              onClick={() => setIsImportModalOpen(true)}
            >
              <>
                <FaFileImport /> Import
              </>
            </button>
          </div>
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
                <Form.Item
                  name="jobRole"
                  label="Job Role"
                  rules={[
                    {
                      required: true,
                      message: "Please enter job role!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter Job Role"
                    maxLength={50}
                    onChange={(e) => setJobRole(e.target.value)}
                  />
                </Form.Item>
              </div>
              <div className={styles.sideOne}>
                <Form.Item
                  name="empNo"
                  label="Employee No"
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Number!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter Number"
                    maxLength={10}
                    onChange={(e) => setEmpNo(e.target.value)}
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
              <button
                width={200}
                className={styles.mainBtns}
                onClick={handleNext}
              >
                <>
                  Next &nbsp; <AiOutlineCaretRight />
                </>
              </button>
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
          </div>
          <div className={styles.idContainer}>
            <span>
              Your Employee ID: <b>{id}</b>
            </span>
            <div className={styles.idNote}>
              <small>Employee ID can be used for login.</small>
            </div>
          </div>
          <div className={styles.btnContainer}>
            <button
              width={300}
              onClick={handleRegister}
              className={styles.mainBtns}
            >
              Complete Registration
            </button>
          </div>
        </>
      )}

      {menu == 3 && passkey && (
        <>
          <div className={styles.passkeyContainer}>
            <div className={styles.head}>New user Finger-Print Passkey:</div>
            <div className={styles.passkeyValue}>
              <b>{passkey}</b>
            </div>
          </div>
          <div className={styles.btnContainer}>
            <button
              width={200}
              className={styles.mainBtns}
              onClick={() => navigate("/FingerPrint")}
            >
              Fingerprint Management
            </button>
            <button
              width={200}
              className={styles.mainBtns}
              onClick={() => navigate("/EmployeePage")}
            >
              Back To Employees
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Register;

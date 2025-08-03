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
        role: jobRole,
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

      // Step 1: Register in database
      const res = await axios.post(`${urL}/user`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      try {
        // Step 2: Register in Auth0
        await signUpUser({ email, password, id });

        // Both registrations successful
        success("User Registered Successfully");

        // Show passkey screen only after both succeed
        if (res.data && res.data.passkey) {
          setPasskey(res.data.passkey);
          setMenu(3);
        } 
      } catch (auth0Error) {
        // Auth0 registration failed, rollback database registration
        try {
          await axios.delete(`${urL}/user/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Database registration rolled back successfully");
        } catch (rollbackError) {
          console.log(
            "Failed to rollback database registration:",
            rollbackError
          );
        }
        if (auth0Error.response?.data.code === "invalid_signup") {
          error("Registration Failed: The email or ID may already exist in Auth0.");
        } else {
          console.log("Auth0 Error:", auth0Error.response?.data);
        }

      }
    } catch (dbError) {
      // Database registration failed
      console.error("Database Registration Error:", dbError);
      error(
        `Registration Failed: ${
          dbError.response?.data?.message || "Database registration failed"
        }`
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

      if (lastEmpNo && lastEmpNo.startsWith(org + "E")) {
        // Extract the number after the last 'E'
        const num = parseInt(lastEmpNo.slice((org + "E").length - 1 + 1)) + 1;
        newEmpNo = `${org}E${num.toString().padStart(3, "0")}`;
      } else {
        newEmpNo = `${org}E001`;
      }
      setId(newEmpNo);
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
                    {
                      validator: (_, value) => {
                        const restrictedRoles = [
                          "KITCHEN_ADMIN",
                          "KITCHEN_STAFF",
                          "HR_ADMIN",
                        ];
                        if (
                          value &&
                          restrictedRoles.includes(value.toUpperCase())
                        ) {
                          return Promise.reject(
                            new Error(
                              "This role is restricted. Please enter a different job role."
                            )
                          );
                        }
                        return Promise.resolve();
                      },
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

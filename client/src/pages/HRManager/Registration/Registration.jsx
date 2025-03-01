import React, { useState, useEffect } from "react";
import styles from "./Registration.module.css";
import Navbar from "../../../components/hrDashboard/hrNavbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFingerprint } from "@fortawesome/free-solid-svg-icons";
import Loading from "../../../components/loading/loading";
import { DatePicker } from "antd";
import axios from 'axios';
import GButton from "../../../components/button/Button";
import GradientButton from "react-linear-gradient-button";
import { IoMdFingerPrint } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import moment from 'moment';

function Register() {
  const urL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const [menu, setMenu] = useState(1);
  const [id, setId] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [dob, setDob] = useState(null);
  const [address, setAddress] = useState(null);
  const [tel, setTel] = useState(null);
  const [salary, setSalary] = useState(null);
  const [name, setName] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [gender, setGender] = useState("");
  const [lang,setLang]=useState("");
  const [supId,setSupId]=useState(null);

  function switchMenu(menu) {
    setMenu(menu);
  }

  const handleRegister = async() => {
    setLoading(true);
    console.log(dob);
    try {
      const payload = {
        id: id,
        name: name,
        role: jobRole,
        dob: dob,
        telephone: tel,
        gender: gender,
        address: address,
        email: email,
        password: password,
        supId:supId,
        language:lang,
        salary: parseInt(salary),
      };
      await axios
        .post(`${urL}/user`, payload)
        .then((res) => {
          console.log(res);
          navigate("/login");
        })
        .catch((err) => {
          console.log(err);
        });
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={styles.home}>
      <div className={styles.homeNavbar}>
        <Navbar selected={"R"} />
      </div>
      <div className={styles.homeContent}>
        <div className={styles.rBox}>
          <div className={styles.rTable}>
            <div
              className={
                menu === 1 ? styles.rTableContentSelected : styles.rTableContent
              }
              onClick={() => switchMenu(1)}
            >
              1 User Profile
            </div>
            <div
              className={
                menu === 2 ? styles.rTableContentSelected : styles.rTableContent
              }
            >
              2 Bio Data
            </div>
          </div>

          <div className={styles.mid}>
            <h1>Register New Employees</h1>
            <span>
              Enter User Information & Provide Fingerprint At The Next Page To
              Add New Employee To The System
            </span>
          </div>

          {menu === 1 && (
            <>
              <div className={styles.inputRow}>
                <div className={styles.inputs}>
                  <div className={styles.inputsBox}>
                    <label>Employee ID:</label>
                    <br></br>
                    <input
                      onChange={(e) => setId(e.target.value)}
                      placeholder="Enter Employee ID"
                      type="textbox"
                    ></input>
                  </div>
                  <div className={styles.inputsBox}>
                    <label>Full Name:</label>
                    <br></br>
                    <input
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter Name"
                      type="textbox"
                    ></input>
                  </div>
                </div>
              </div>
              <div className={styles.inputRow}>
                <div className={styles.inputs}>
                  <div className={styles.inputsBox}>
                    <label>Email:</label>
                    <br></br>
                    <input
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Email Address"
                      type="email"
                    ></input>
                  </div>
                  <div className={styles.inputsBox}>
                    <label>Password (For Portal Access):</label>
                    <br></br>
                    <input
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Password"
                      type="password"
                    ></input>
                  </div>
                </div>
              </div>
              <div className={styles.inputRow}>
                <div className={styles.inputs}>
                  <div className={styles.inputsBox}>
                    <label>Date of Birth:</label>
                    <br></br>
                    <DatePicker
                      onChange={(date) => setDob(moment(date).format('YYYY-MM-DD'))}
                      placeholder="Select a Date"
                      className={styles.picker}
                    />
                  </div>
                  <div className={styles.inputsBox}>
                    <label>Residential Address:</label>
                    <br></br>
                    <input
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter Address"
                      type="textbox"
                    ></input>
                  </div>
                </div>
              </div>
              <div className={styles.inputRow}>
                <div className={styles.inputs}>
                  <div className={styles.inputsBox}>
                    <label>Gender:</label>
                    <br></br>
                    <select
                      className={styles.selects}
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className={styles.inputsBox}>
                    <label>Telephone Number:</label>
                    <br></br>
                    <input
                      onChange={(e) => setTel(e.target.value)}
                      placeholder="Enter Mobile Number"
                      type="textbox"
                    ></input>
                  </div>
                </div>
              </div>
              <div className={styles.inputRow}>
                <div className={styles.inputs}>
                  <div className={styles.inputsBox}>
                    <label>Preferred Language:</label>
                    <br></br>
                    <select
                      className={styles.selects}
                      onChange={(e) => setLang(e.target.value)}
                    >
                      <option value="">Select Language</option>
                      <option value="English">English</option>
                      <option value="Sinhala">Sinhala</option>
                      <option value="Tamil">Tamil</option>
                    </select>
                  </div>
                  <div className={styles.inputsBox}>
                    <label> Supervisor's Employee ID:</label>
                    <br></br>
                    <input
                      onChange={(e) => setSupId(e.target.value)}
                      placeholder="Enter Supervisor ID"
                      type="textbox"
                    ></input>
                  </div>
                </div>
              </div>
              <div className={styles.inputRow}>
                <div className={styles.inputs}>
                  <div className={styles.inputsBox}>
                    <label>Job Role:</label>
                    <br></br>
                    <select
                      className={styles.selects}
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                    >
                      <option value="">Select a Role</option>
                      <option value="HR Manager">HR Manager</option>
                      <option value="Kitchen Admin">Kitchen Admin</option>
                      <option value="Kitchen Staff">Kitchen Staff</option>
                      <option value="Inventory Manager">
                        Inventory Manager
                      </option>
                      <option value="Other">Other</option>
                    </select>
                    {jobRole === "Other" && (
                      <input
                        className={styles.customInput}
                        type="textbox"
                        onChange={(e) => setJobRole(e.target.value)}
                        placeholder="Enter Job Role"
                      />
                    )}
                  </div>
                  <div className={styles.inputsBox}>
                    <label>Basic Salary:</label>
                    <br></br>
                    <input
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="Enter Basic Salary"
                      type="number"
                    ></input>
                  </div>
                </div>
              </div>
              <div className={styles.btn}>
                <GButton onClick={() => switchMenu(2)} padding="0.7vw 5vw">
                  Next
                </GButton>
              </div>
            </>
          )}
          {menu === 2 && (
            <>
              <div className={styles.bioSec}>
                <div className={styles.bio}>
                  <div className={styles.fingerBio}>
                    Place your Finger to Complete the Registration
                  </div>
                  <div className={styles.fingerIcon}>
                    <IoMdFingerPrint size="50vh" />
                  </div>
                </div>
              </div>
              <div className={styles.btn}>
                <GButton onClick={handleRegister} padding="0.7vw 2vw">
                  Register Without FingerPrint
                </GButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;

import React, { useState, useEffect } from "react";
import styles from "./Registration.module.css";
import Navbar from "../../components/hrDashboard/hrNavbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFingerprint } from "@fortawesome/free-solid-svg-icons";
import Loading from "../../components/loading/loading";
import { DatePicker } from "antd";
import GButton from "../../components/button/Button";
import GradientButton from "react-linear-gradient-button";
import { IoMdFingerPrint } from "react-icons/io";

function Register() {
  const [menu, setMenu] = useState(1);
  const [jobRole, setJobRole] = useState("");
  const [gender, setGender] = useState("");
  const [customJobRole, setCustomJobRole] = useState("");

  function switchMenu(menu) {
    setMenu(menu);
  }
  const handleJobRoleChange = (e) => {
    setJobRole(e.target.value);
    if (e.target.value !== "custom") {
      setCustomJobRole("");
    }
  };

  const handleGenderChange = (e) => {
    setGender(e.target.value);
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log(menu);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
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
                    <label>Employee Id:</label>
                    <br></br>
                    <input type="textbox"></input>
                  </div>
                  <div className={styles.inputsBox}>
                    <label>Full Name:</label>
                    <br></br>
                    <input type="textbox"></input>
                  </div>
                </div>
              </div>
              <div className={styles.inputRow}>
                <div className={styles.inputs}>
                  <div className={styles.inputsBox}>
                    <label>Email:</label>
                    <br></br>
                    <input type="textbox"></input>
                  </div>
                  <div className={styles.inputsBox}>
                    <label>Password (For Portal Access):</label>
                    <br></br>
                    <input type="textbox"></input>
                  </div>
                </div>
              </div>
              <div className={styles.inputRow}>
                <div className={styles.inputs}>
                  <div className={styles.inputsBox}>
                    <label>Date of Birth:</label>
                    <br></br>
                    <DatePicker className={styles.picker} />
                  </div>
                  <div className={styles.inputsBox}>
                    <label>Address:</label>
                    <br></br>
                    <input type="textbox"></input>
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
                      onChange={handleGenderChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className={styles.inputsBox}>
                    <label>Telephone Number:</label>
                    <br></br>
                    <input type="textbox"></input>
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
                      onChange={handleJobRoleChange}
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
                        value={customJobRole}
                        onChange={(e) => setCustomJobRole(e.target.value)}
                        placeholder="Enter Job Role"
                      />
                    )}
                  </div>
                  <div className={styles.inputsBox}>
                    <label>Basic Salary:</label>
                    <br></br>
                    <input type="textbox"></input>
                  </div>
                </div>
              </div>
              <div className={styles.btn}>
                <GButton onClick={() => switchMenu(2)} padding="0.7vw 2vw">
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
                <GButton onClick={() => switchMenu(2)} padding="0.7vw 2vw">
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

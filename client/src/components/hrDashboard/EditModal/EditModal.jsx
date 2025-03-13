import { React, useState, useEffect } from "react";
import styles from "./EditModal.module.css";
import Loading from "../../loading/loading";
import axios from "axios";
import GButton from "../../../components/button/Button";
import { DatePicker } from "antd";
import { useNavigate } from "react-router-dom";

const EditModal = ({ empId, handleCancel, fetchEmployee }) => {
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

  if (loading) {
    return <Loading />;
  }

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.put(`${urL}/user/${empId}`, currentEmployee);
      console.log("User Updated");
      handleCancel();
      fetchEmployee();
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalWrap}>
      <div className={styles.modalHeader}>Edit Employee - {empId}</div>
      <hr />
      <div className={styles.inputWrap}>
        <div className={styles.inputSide}>
          <label>Employee Id</label>
          <br />
          <input
            type="textbox"
            value={currentEmployee.id}
            onChange={(e) =>
              setCurrentEmployee({ ...currentEmployee, id: e.target.value })
            }
            placeholder="Enter ID"
          ></input>
          <br />
          <label>Name</label>
          <br />
          <input
            type="textbox"
            value={currentEmployee.name}
            onChange={(e) =>
              setCurrentEmployee({ ...currentEmployee, name: e.target.value })
            }
            placeholder="Enter Name"
          ></input>
          <br />
          <label>Email</label>
          <br />
          <input
            type="email"
            value={currentEmployee.email}
            onChange={(e) =>
              setCurrentEmployee({ ...currentEmployee, email: e.target.value })
            }
            placeholder="Enter Email"
          ></input>
          <br />
          <label>Date of Birth</label>
          <br />
          <DatePicker
            onChange={(date) =>
              setCurrentEmployee({
                ...currentEmployee,
                dob: moment(date).format("YYYY-MM-DD"),
              })
            }
            placeholder="Select a Date"
            className={styles.picker}
          />
          <br />
          <label>Job Role:</label>
          <br></br>
          <select
            className={styles.selects}
            onChange={(e) =>
              setCurrentEmployee({ ...currentEmployee, role: e.target.value })
            }
          >
            <option value="">Select a Role</option>
            <option value="HR Manager">HR Manager</option>
            <option value="Kitchen Admin">Kitchen Admin</option>
            <option value="Kitchen Staff">Kitchen Staff</option>
            <option value="Inventory Manager">Inventory Manager</option>
            <option value="Other">Other</option>
          </select>
          {currentEmployee.role === "Other" && (
            <input
              className={styles.customJob}
              type="textbox"
              onChange={(e) =>
                setCurrentEmployee({ ...currentEmployee, role: e.target.value })
              }
              placeholder="Enter Job Role"
            />
          )}
          <br />
          <label>Finger Print</label>
          <br />
          <button className={styles.rescanBtn}>Rescan</button>
        </div>
        <div className={styles.inputSide}>
          <label>Residential Address</label>
          <br />
          <input
            type="textbox"
            value={currentEmployee.supId}
            onChange={(e) =>
              setCurrentEmployee({ ...currentEmployee, supId: e.target.value })
            }
            placeholder="Enter Address"
          ></input>
          <br />
          <label>Telephone</label>
          <br />
          <input
            type="textbox"
            value={currentEmployee.telephone}
            onChange={(e) =>
              setCurrentEmployee({
                ...currentEmployee,
                telephone: e.target.value,
              })
            }
            placeholder="Enter Tel."
          ></input>
          <br />
          <label>Supervisor's Employee Id</label>
          <br />
          <input
            type="textbox"
            value={currentEmployee.supId}
            onChange={(e) =>
              setCurrentEmployee({ ...currentEmployee, supId: e.target.value })
            }
            placeholder="Enter Supervisor's Id"
          ></input>
          <br />
          <label>Salary</label>
          <br />
          <input
            type="textbox"
            value={currentEmployee.salary}
            onChange={(e) =>
              setCurrentEmployee({ ...currentEmployee, salary: e.target.value })
            }
            placeholder="Enter Salary"
          ></input>
          <br />
          <label>Preferred Language</label>
          <br />
          <select
            className={styles.selects}
            value={currentEmployee.language}
            defaultChecked={currentEmployee.language}
            onChange={(e) =>
              setCurrentEmployee({
                ...currentEmployee,
                language: e.target.value,
              })
            }
          >
            <option value="">Select Language</option>
            <option value="English">English</option>
            <option value="Sinhala"> Sinhala </option>
            <option value="Tamil"> Tamil </option>
          </select>
          <br />
          <label>Gender</label>
          <br />
          <select
            className={styles.selects}
            onChange={(e) =>
              setCurrentEmployee({ ...currentEmployee, gender: e.target.value })
            }
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <br />
        </div>
      </div>
      <div className={styles.btnSection}>
        <GButton onClick={handleUpdate} padding="0.4vw 2vw">
          Update
        </GButton>
      </div>
    </div>
  );
};

export default EditModal;

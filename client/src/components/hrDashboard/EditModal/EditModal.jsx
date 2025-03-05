import { React, useState, useEffect } from "react";
import styles from "./EditModal.module.css";
import Loading from "../../loading/loading";
import axios from "axios";

const EditModal = ({ empId }) => {
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
    createdAt: "",
  });
  const [loading, setLoading]=useState(true);
  const urL = import.meta.env.VITE_BASE_URL;
  const getEmployee = async () => {
    try {
      const res = await axios.get(`${urL}/user/${empId}`);
      setCurrentEmployee(res.data);
      setLoading(false)
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

  return (
    <div className={styles.modalWrap}>
      <div className={styles.modalHeader}>Edit Employee - {empId}</div>
      <hr />
      <div className={styles.inputWrap}>
        <div className={styles.inputSide}>
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
          {console.log(currentEmployee)}
        </div>
        <div className={styles.inputSide}>
          <label>Address</label>
        </div>
      </div>
    </div>
  );
};

export default EditModal;

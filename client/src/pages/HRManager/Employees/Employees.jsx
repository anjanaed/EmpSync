import { useState, React, useEffect } from "react";
import axios from "axios";
import styles from "./Employee.module.css";
import Navbar from "../../../components/hrDashboard/NavBar/hrNavbar";
import Loading from "../../../components/loading/loading";
import { FiEdit } from "react-icons/fi";
import { Modal } from "antd";
import { MdOutlineDeleteOutline } from "react-icons/md";
import EditModal from "../../../components/hrDashboard/EditModal/EditModal";

const Employees = () => {
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectEmployee,setSelectEmployee]= useState(null);

  const urL = import.meta.env.VITE_BASE_URL;

  
  const openModal = (empId) => {
    setSelectEmployee(empId)
    setIsModalOpen(true);
  };



  const handleCancel=()=>{
    setIsModalOpen(false)
    setSelectEmployee(null);

  }

  const fetchEmployee = async () => {
    try {
      const response = await axios.get(`${urL}/user`);

      const fetchedEmployee = response.data.map((emp) => ({
        id: emp.id,
        name: emp.name,
        role: emp.role,
        email: emp.email,
      }));
      setEmployee(fetchedEmployee);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios
        .delete(`${urL}/user/${id}`)
        .then(() => {
          console.log("User Deleted");
          fetchEmployee();
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
    <Modal open={isModalOpen} footer={null} width={"55vw"} onCancel={handleCancel}>
      <EditModal empId={selectEmployee} handleCancel={handleCancel} fetchEmployee={fetchEmployee}/>
      </Modal>
    


    <div className={styles.home}>
      <div className={styles.homeNav}>
        <Navbar selected={"E"} />
      </div>
      <div className={styles.homeContent}>
        <div className={styles.homeHead}>
          <div className={styles.headLeft}>Registered Employee Details</div>
          <div className={styles.headRight}>
            <input placeholder="Search Employee" type="textbox"></input>
            <select>
              <option value="">All Roles</option>
              <option value="HR Manager">HR Manager</option>
              <option value="Kitchen Admin">Kitchen Admin</option>
              <option value="Kitchen Staff">Kitchen Staff</option>
              <option value="Inventory Manager">Inventory Manager</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <table className={styles.contentBox}>
          <thead>
            <tr className={styles.tableHeadContainer}>
              <th className={styles.tableHead}>ID</th>
              <th className={styles.tableHead}>Name</th>
              <th className={styles.tableHead}>Job Role</th>
              <th className={styles.tableHead}>Email</th>
              <th className={styles.tableHead}>Actions</th>
            </tr>
          </thead>
          <tbody className={styles.tableContent}>
            {employee.length > 0 ? (
              employee.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.name}</td>
                  <td>{emp.role}</td>
                  <td>{emp.email}</td>
                  <td>
                    <FiEdit onClick={()=>{openModal(emp.id)}}  className={styles.icons} size="20px" />
                    <MdOutlineDeleteOutline
                      onClick={() => handleDelete(emp.id)}
                      className={styles.icons}
                      size="20px"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className={styles.empty}>
                  No Registered Employees to Display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};

export default Employees;

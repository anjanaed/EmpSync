import React from "react";
import styles from "./FingerPrints.module.css";

// Temporary fingerprint data
const fingerprintData = [
  { id: 1, name: "John Doe", status: "Registered", date: "2025-07-01" },
  { id: 2, name: "Jane Smith", status: "Pending", date: "2025-07-10" },
  { id: 3, name: "Alice Johnson", status: "Registered", date: "2025-07-05" },
  { id: 4, name: "Bob Lee", status: "Pending", date: "2025-07-11" },
];

const FingerPrints = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Fingerprint Registrations</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {fingerprintData.map((fp) => (
            <tr key={fp.id} className={fp.status === "Registered" ? styles.registered : styles.pending}>
              <td>{fp.name}</td>
              <td>{fp.status}</td>
              <td>{fp.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FingerPrints;

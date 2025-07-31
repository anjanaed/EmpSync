import React, { useRef, useState } from "react";
import Papa from "papaparse";
import { useAuth } from "../../../../contexts/AuthContext";
import styles from "./ImportModal.module.css";
import axios from "axios";
import Loading from "../../../atoms/loading/loading";
import { usePopup } from "../../../../contexts/PopupContext.jsx";



// These columns must match your CSV headers and form fields
const REQUIRED_COLUMNS = [
  "Full Name",
  "Employee No",
  "E-mail",
  "Phone Number",
  "Gender",
  "Job Role",
  "Date of Birth",
  "Residential Address",
  "Preferred Language",
  "Basic Salary (LKR)",
];

// Validation functions matching Register.jsx
const validateRow = (row, idx) => {
  const errors = [];
  // Full Name: required, only letters and spaces, min 2 chars
  if (
    !row["Full Name"] ||
    !/^[A-Za-z\s]+$/.test(row["Full Name"]) ||
    row["Full Name"].trim().length < 2
  ) {
    errors.push(
      `Row ${
        idx + 2
      }: Full Name is required, must be at least 2 letters, and only letters/spaces.`
    );
  }
  // E-mail: required, valid email
  if (!row["E-mail"] || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row["E-mail"])) {
    errors.push(`Row ${idx + 2}: Valid E-mail is required.`);
  }

  // Phone Number: optional, but if present must be 10 digits
  if (row["Phone Number"] && !/^\d{10}$/.test(row["Phone Number"])) {
    errors.push(`Row ${idx + 2}: Phone Number must include 10 digits.`);
  }
  // Gender: required, must be one of the options
  if (!row["Gender"] || !["Male", "Female", "Other"].includes(row["Gender"])) {
    errors.push(
      `Row ${idx + 2}: Gender is required and must be Male, Female, or Other.`
    );
  }
  // Job Role: required, not empty
  if (!row["Job Role"] || row["Job Role"].trim() === "") {
    errors.push(`Row ${idx + 2}: Job Role is required.`);
  }
  // Date of Birth: required, valid date (YYYY-MM-DD)
  if (
    !row["Date of Birth"] ||
    !/^\d{4}-\d{2}-\d{2}$/.test(row["Date of Birth"])
  ) {
    errors.push(
      `Row ${
        idx + 2
      }: Date of Birth is required and must be in YYYY-MM-DD format.`
    );
  }
  // Residential Address: optional, max 65 chars
  if (row["Residential Address"] && row["Residential Address"].length > 65) {
    errors.push(
      `Row ${idx + 2}: Residential Address must be 65 characters or less.`
    );
  }
  // Preferred Language: required, must be one of the options
  if (!["Sinhala", "English", "Tamil"].includes(row["Preferred Language"])) {
    errors.push(
      `Row ${idx + 2}: Preferred Language must be Sinhala, English, or Tamil.`
    );
  }
  // Basic Salary (LKR): required, positive number
  if (
    !row["Basic Salary (LKR)"] ||
    isNaN(row["Basic Salary (LKR)"]) ||
    Number(row["Basic Salary (LKR)"]) <= 0
  ) {
    errors.push(
      `Row ${
        idx + 2
      }: Basic Salary (LKR) is required and must be a positive number.`
    );
  }
  return errors;
};

const ImportModal = () => {
  const fileInputRef = useRef();
  const [previewData, setPreviewData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const { authData } = useAuth();
  const [failedRows, setFailedRows] = useState([]);
  const [file, setFile] = useState(null);
  const urL = import.meta.env.VITE_BASE_URL;
  const auth0Url = import.meta.env.VITE_AUTH0_URL;
  const auth0Id = import.meta.env.VITE_AUTH0_ID;
  const { success } = usePopup();
  const token = authData?.accessToken;

  const signUpUser = async ({ email, password, id }) => {
    try {
      await axios.post(`https://${auth0Url}/dbconnections/signup`, {
        client_id: auth0Id,
        email,
        username: id,
        password,
        connection: "Username-Password-Authentication",
      });
    } catch (error) {
      throw error;
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    setProgress(0);
    setFailedRows([]);
    let failedRowsArr = [];

    // 1. Fetch the last employee number for the org
    const org = authData?.orgId;
    let lastEmpNo = null;
    try {
      const res = await axios.get(`${urL}/user/last-empno/${org}`);
      lastEmpNo = res.data;
    } catch (err) {
      setUploading(false);
      setProgress(0);
      setError("Failed to fetch last employee number.");
      return;
    }

    // 2. Prepare the starting number for new IDs
    let startNum = 1;
    if (lastEmpNo && lastEmpNo.startsWith(org + "E")) {
      startNum = parseInt(lastEmpNo.slice((org + "E").length)) + 1;
    }

    // 3. Generate IDs for each row
    const generatedIds = previewData.map((_, idx) => {
      const num = startNum + idx;
      return `${org}E${num.toString().padStart(3, "0")}`;
    });

    for (let i = 0; i < previewData.length; i++) {
      const row = previewData[i];


      // Use generated ID
      let id = generatedIds[i];

      const payload = {
        id,
        empNo: row["Employee No"],
        name: row["Full Name"],
        role:row["Job Role"],
        dob: row["Date of Birth"],
        telephone: row["Phone Number"],
        gender: row["Gender"],
        address: row["Residential Address"],
        email: row["E-mail"],
        supId: row["Supervisor's ID"] || "",
        language: row["Preferred Language"],
        organizationId: authData?.orgId,
        salary: parseInt(row["Basic Salary (LKR)"]),
      };

      try {
        // 1. Register in your backend
        await axios.post(`${urL}/user`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        failedRowsArr.push({
          idx: i,
          name: row["Full Name"],
          email: row["E-mail"],
          reason: err.response?.data?.message || "Backend error",
        });
        setProgress(Math.round(((i + 1) / previewData.length) * 100));
        continue;
      }

      try {
        // 2. Register in Auth0
        await signUpUser({
          email: row["E-mail"],
          password: row["Password"] || "Test12345.", // Use password from CSV or fallback
          id,
        });
      } catch (err) {
        // Rollback backend user if Auth0 fails
        if (id) {
          try {
            await axios.delete(`${urL}/user/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          } catch (delErr) {
            // Optionally log rollback error
          }
        }
        failedRowsArr.push({
          idx: i,
          name: row["Full Name"],
          email: row["E-mail"],
          reason: err.response?.data?.message || "Auth0 error",
        });
      }
      setProgress(Math.round(((i + 1) / previewData.length) * 100));
    }

    setUploading(false);
    setProgress(0);
    setFailedRows(failedRowsArr);

    // Only clear if all succeeded
    if (failedRowsArr.length === 0) {
      success("Employees Imported Successfully!");
      setPreviewData([]);
      setFile(null);
      setValidationErrors([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    
  };

  const handleFileChange = (e) => {
    setError("");
    setValidationErrors([]);
    setPreviewData([]);
    setFile(null);
    setFailedRows([]);

    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        const fileHeaders = results.meta.fields;

        // Check for required columns
        const missing = REQUIRED_COLUMNS.filter(
          (col) => !fileHeaders.includes(col)
        );
        if (missing.length) {
          setError(`Missing required columns: ${missing.join(", ")}`);
          setPreviewData([]);
          setFile(null);
          return;
        }

        // Only keep required columns for preview
        const preview = data.map((row) =>
          REQUIRED_COLUMNS.reduce((acc, col) => {
            acc[col] = row[col];
            return acc;
          }, {})
        );

        // Row-level validations
        const rowErrors = [];
        preview.forEach((row, idx) => {
          rowErrors.push(...validateRow(row, idx));
        });

        setPreviewData(preview);
        setValidationErrors(rowErrors);
        setFile(file);
      },
      error: () => {
        setError("Failed to parse CSV file.");
        setPreviewData([]);
        setFile(null);
      },
    });
  };

  if (uploading) {
    return <Loading text={`Uploading... ${progress}%`} />;
  }

  return (
    <div className={styles.importModalContainer}>
      <h3 className={styles.title}>Import Employee Data (.CSV)

</h3>
      <p className={styles.desc}>Select a CSV file to import employee data.</p>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <button
          className={styles.uploadBtn}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          type="button"
        >
          Choose CSV File
        </button>
        <button
          className={styles.clearBtn}
          type="button"
          onClick={() => {
            setPreviewData([]);
            setValidationErrors([]);
            setError("");
            setFile(null);
            setFailedRows([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          disabled={!file}
        >
          Clear
        </button>
      </div>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        className={styles.fileInput}
        onChange={handleFileChange}
      />
      {error && <div className={styles.errorMsg}>{error}</div>}
      {validationErrors.length > 0 && (
        <div className={styles.validationErrors}>
          {validationErrors.map((err, idx) => (
            <div key={idx}>{err}</div>
          ))}
        </div>
      )}
      {failedRows.length > 0 && (
        <div className={styles.failedRows}>
          <b>Failed Registrations:</b>
          <ul>
            {failedRows.map((fail, idx) => (
              <li key={idx}>
                Row {fail.idx + 2} ({fail.name}, {fail.email}): {fail.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
      {previewData.length > 0 && (
        <div className={styles.previewTableWrapper}>
          <h4>Preview</h4>
          <div className={styles.tableScroll}>
            <table className={styles.previewTable}>
              <thead>
                <tr>
                  {REQUIRED_COLUMNS.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 50).map((row, idx) => (
                  <tr key={idx}>
                    {REQUIRED_COLUMNS.map((col) => (
                      <td key={col}>{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 50 && (
              <div className={styles.moreRows}>
                Showing first 50 rows of {previewData.length}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={styles.bottomBar}>
        <button
          className={styles.finalUploadBtn}
          onClick={handleUpload}
          disabled={
            !file ||
            !!error ||
            validationErrors.length > 0 ||
            previewData.length === 0
          }
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default ImportModal;
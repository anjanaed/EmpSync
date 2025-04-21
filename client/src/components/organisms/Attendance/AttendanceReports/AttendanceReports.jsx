import React, { useState } from "react";
import styles from "./AttendanceReports.module.css";
import NavBar from "../AttendanceNavbar/AttendanceNavbar";
import { FileText, Calendar, Download, FileSpreadsheet, FileIcon as FilePdf } from "lucide-react";

// Sample data for departments
const departments = [
  { id: "all", name: "All Departments" },
  { id: "eng", name: "Engineering" },
  { id: "hr", name: "Human Resources" },
  { id: "fin", name: "Finance" },
  { id: "mkt", name: "Marketing" },
  { id: "ops", name: "Operations" },
];

// Sample data for recent reports
const recentReports = [
  {
    id: 1,
    name: "Monthly Summary",
    department: "All Departments",
    dateRange: "Mar 1 - Mar 31, 2025",
    generatedOn: "Apr 2, 2025",
  },
  {
    id: 2,
    name: "Engineering Attendance",
    department: "Engineering",
    dateRange: "Mar 15 - Mar 31, 2025",
    generatedOn: "Apr 1, 2025",
  },
  {
    id: 3,
    name: "Late Arrivals",
    department: "All Departments",
    dateRange: "Mar 1 - Mar 31, 2025",
    generatedOn: "Apr 1, 2025",
  },
  {
    id: 4,
    name: "Absence Report",
    department: "Marketing",
    dateRange: "Feb 1 - Feb 28, 2025",
    generatedOn: "Mar 5, 2025",
  },
  {
    id: 5,
    name: "Quarterly Summary",
    department: "Finance",
    dateRange: "Jan 1 - Mar 31, 2025",
    generatedOn: "Apr 5, 2025",
  },
];

// Report types
const reportTypes = [
  { id: "summary", name: "Summary Report" },
  { id: "detailed", name: "Detailed Report" },
  { id: "late", name: "Late Arrivals Report" },
  { id: "absent", name: "Absence Report" },
  { id: "overtime", name: "Overtime Report" },
];

const AttendanceReports = () => {
  // State for form inputs
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [startDate, setStartDate] = useState("2025-04-01");
  const [endDate, setEndDate] = useState("2025-04-15");
  const [reportType, setReportType] = useState("summary");
  const [reportName, setReportName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReportGenerated, setIsReportGenerated] = useState(false);

  // Handle report generation
  const handleGenerateReport = (e) => {
    e.preventDefault();
    setIsGenerating(true);

    // Simulate report generation with a timeout
    setTimeout(() => {
      setIsGenerating(false);
      setIsReportGenerated(true);
    }, 1500);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={styles.dash}>
      <div className={styles.mainBox}>
        <NavBar />
        <div className={styles.mainTitle}>
          <h1>Attendance Reports</h1>
          <span>Access and manage all your reports in one place</span>
        </div>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.reportGenerator}>
            <div className={styles.emptyPreview}>
                  <FileText className={styles.emptyPreviewIcon} />
                  <h3 className={styles.emptyPreviewTitle}>No Report Generated</h3>
                  <p className={styles.emptyPreviewText}>
                    Configure the report options and click Generate Report to preview
                  </p>
            </div>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Generate Report</h2>
                </div>
                <div className={styles.cardContent}>
                  <form onSubmit={handleGenerateReport}>
                    <div className={styles.formGroup}>
                      <label htmlFor="reportName" className={styles.label}>
                        Report Name
                      </label>
                      <input
                        id="reportName"
                        type="text"
                        className={styles.input}
                        placeholder="Enter report name"
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="department" className={styles.label}>
                        Department
                      </label>
                      <select
                        id="department"
                        className={styles.select}
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                      >
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Date Range</label>
                      <div className={styles.dateRange}>
                        <div className={styles.dateInput}>
                          <label htmlFor="startDate" className={styles.dateLabel}>
                            From
                          </label>
                          <div className={styles.dateInputWrapper}>
                            <Calendar className={styles.dateIcon} />
                            <input
                              id="startDate"
                              type="date"
                              className={styles.input}
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className={styles.dateInput}>
                          <label htmlFor="endDate" className={styles.dateLabel}>
                            To
                          </label>
                          <div className={styles.dateInputWrapper}>
                            <Calendar className={styles.dateIcon} />
                            <input
                              id="endDate"
                              type="date"
                              className={styles.input}
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="reportType" className={styles.label}>
                        Report Type
                      </label>
                      <select
                        id="reportType"
                        className={styles.select}
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                      >
                        {reportTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className={`${styles.button} ${styles.primaryButton} ${
                        isGenerating ? styles.loading : ""
                      }`}
                      disabled={isGenerating}
                    >
                      {isGenerating ? "Generating..." : "Generate Report"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recent Reports</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <div className={styles.tableHeaderCell}>Report Name</div>
                <div className={styles.tableHeaderCell}>Department</div>
                <div className={styles.tableHeaderCell}>Date Range</div>
                <div className={styles.tableHeaderCell}>Generated On</div>
                <div className={styles.tableHeaderCell}>Actions</div>
              </div>
              <div className={styles.tableBody}>
                {recentReports.map((report) => (
                  <div key={report.id} className={styles.tableRow}>
                    <div className={styles.tableCell}>{report.name}</div>
                    <div className={styles.tableCell}>{report.department}</div>
                    <div className={styles.tableCell}>{report.dateRange}</div>
                    <div className={styles.tableCell}>{report.generatedOn}</div>
                    <div className={styles.tableCell}>
                      <button className={`${styles.button} ${styles.iconButton}`} title="Download Report">
                        <Download className={styles.actionIcon} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReports;

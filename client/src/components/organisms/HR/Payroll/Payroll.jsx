import { React, useState, useEffect } from "react";
import {
  Input,
  DatePicker,
  Checkbox,
  Modal,
  InputNumber,
  Form,
  Tooltip,
} from "antd";
import styles from "./Payroll.module.css";
import { useNavigate } from "react-router-dom";
import { BsPlusCircle } from "react-icons/bs";
import { FaRegSave } from "react-icons/fa";
import { LuEye } from "react-icons/lu";
import Gbutton from "../../../atoms/button/Button";
import { MdCalculate } from "react-icons/md";
import AdjustmentModal from "../../../templates/HR/AdjustmentModal/AdjustmentModal";
import { InfoCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import { IoOpenOutline } from "react-icons/io5";
import Loading from "../../../atoms/loading/loading";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import PayeModal from "../../../templates/HR/PayeModal/PayeModal";
import { useAuth } from "../../../../contexts/AuthContext";

import { usePopup } from "../../../../contexts/PopupContext";
const { RangePicker } = DatePicker;

const Payroll = () => {
  const [isAllowanceChecked, setIsAllowanceChecked] = useState(false);
  const [adjustments, setAdjustments] = useState([]);
  const [etf, setEtf] = useState(0);
  const [range, setRange] = useState();
  const [epf, setEpf] = useState(0);
  const [month, setMonth] = useState(null);
  const [employerFund, setEmployerFund] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayeModalOpen, setIsPayeModalOpen] = useState(false);
  const urL = import.meta.env.VITE_BASE_URL;
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { authData } = useAuth();
  const token = authData?.accessToken;
  const { success, error } = usePopup();

  const [individualAdjustment, setIndividualAdjustment] = useState([
    { id: "", details: "", amount: "", isPercentage: true, isAllowance: true },
  ]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPDFLoading] = useState(false);
  const handleAllowanceChange = () => {
    setIsAllowanceChecked(!isAllowanceChecked);
  };

  //Format Month
  const handleMonthChange = (value) => {
    if (value) {
      const formattedMonth = value.format("MM~YYYY");
      setMonth(formattedMonth);
      form.setFieldsValue({ payrollMonth: value });
    }
  };

  //Format Range
  const handleRangeChange = (dates) => {
    console.log(month);
    if (dates) {
      const formattedRange = [dates[0].toISOString(), dates[1].toISOString()];

      setRange(formattedRange);
    }
  };

  //Add New Set of Fields
  const handleNewIndividualAdjustment = () => {
    setIndividualAdjustment([
      ...individualAdjustment,
      {
        id: "",
        details: "",
        amount: "",
        isPercentage: true,
        isAllowance: true,
      },
    ]);
  };

  //Payroll Generation
  const handleGenerate = async () => {
    await form.validateFields(["payrollMonth", "epf", "etf", "EmpoyerFund"]);

    //Sending ETF EPF data
    try {
      setPDFLoading(true);

      //Update Predefined Adjustments
      await handleEtfEpf();

      //Remove Existing Payrolls with same month
      await axios.delete(`${urL}/payroll/delete-by-month/${month}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      //Start calculations
      await axios.post(
        `${urL}/payroll/calculate-all`,
        {
          range: range,
          month: month,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      success("Payrolls Generated Successfully");
    } catch (err) {
      console.log(err);
      error("Payrolls Generation Failed");
    } finally {
      setPDFLoading(false);
    }
  };

  const handleNewFields = () => {
    setIsModalOpen(true);
  };

  const handlePayeModalOpen = () => {
    setIsPayeModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handlePayeModalCancel = () => {
    setIsPayeModalOpen(false);
  };

  const modalStyles = {
    mask: {
      backdropFilter: "blur(12px)",
    },
  };

  //Remove General Adjustment
  const handleAdjustmentDelete = async (id) => {
    setLoading(true);
    try {
      const intId = parseInt(id, 10);
      await axios.delete(`${urL}/adjustment/${intId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchAdjustments();
      success("Adjustment Removed Successfully");
    } catch (err) {
      console.log(err);
      error("Something wen Wrong");
    }
    setLoading(false);
  };

  //Fetch Data
  const fetchAdjustments = async () => {
    try {
      const res = await axios.get(`${urL}/adjustment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      //Check Availability of Pre defined Fields & Set their Existing Values
      const epfValue = res.data.find((adj) => adj.label == "EPF (Employee)");
      const etfValue = res.data.find((adj) => adj.label == "ETF");
      const employerFundValue = res.data.find(
        (adj) => adj.label == "EmployerFund"
      );
      if (epfValue) {
        setEpf(epfValue.amount);
        form.setFieldsValue({ epf: epfValue.amount });
      }
      if (etfValue) {
        setEtf(etfValue.amount);
        form.setFieldsValue({ etf: etfValue.amount });
      }
      if (employerFundValue) {
        setEmployerFund(employerFundValue.amount);
        form.setFieldsValue({ EmployerFund: employerFundValue.amount });
      }
      //Filter out pre defined fields for display
      const filteredRes = res.data.filter(
        (adj) =>
          adj.label !== "ETF" &&
          adj.label !== "EPF (Employee)" &&
          adj.label !== "EmployerFund"
      );
      setAdjustments(filteredRes);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  //Submit Individual Adjustment
  const handleIndiAdjustmentSave = async () => {
    const allFields = form.getFieldsValue();
    const fieldNamesToValidate = Object.keys(allFields).filter(
      (name) => name !== "payrollMonth"
    );
    await form.validateFields(fieldNamesToValidate);
    setLoading(true);

    try {
      const userRes = await axios.get(`${urL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userIds = userRes.data.map((user) => user.id);
      const processedIds = new Set();

      for (const adj of individualAdjustment) {
        // Split and clean IDs
        const idArray = adj.id
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id !== "");

        // Remove duplicates in current input
        const uniqueIds = [...new Set(idArray)];

        // Validate IDs
        const invalidIds = uniqueIds.filter((id) => !userIds.includes(id));
        if (invalidIds.length > 0) {
          setLoading(false);
          console.log(`Invalid Employee IDs: ${invalidIds.join(",")}`);
          error(`Invalid Employee IDs: ${invalidIds.join(",")}`);
          return;
        }

        // Submit adjustments
        for (const id of uniqueIds) {
          if (processedIds.has(id)) continue;

          const payload = {
            empId: id,
            label: adj.details,
            allowance: adj.isAllowance,
            isPercentage: adj.isPercentage,
            amount: parseFloat(adj.amount),
          };

          await axios.post(`${urL}/indiadjustment`, payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          processedIds.add(id);
        }
      }

      // Reset fields once after all processing
      setIndividualAdjustment([
        {
          id: "",
          details: "",
          amount: "",
          isPercentage: true,
          isAllowance: true,
        },
      ]);
      const preservedFields = form.getFieldsValue([
        "payrollMonth",
        "etf",
        "epf",
        "EmployerFund",
      ]);
      form.resetFields();
      form.setFieldsValue(preservedFields);

      success("Adjustments Updated Successfully");
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  const handleEtfEpf = async () => {
    setLoading(true);
    try {
      //Retrieve Pre defined field values
      const res = await axios.get(`${urL}/adjustment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const adjustment = res.data;
      const epfRecord = adjustment.find((adj) => adj.label == "EPF (Employee)");
      const etfRecord = adjustment.find((adj) => adj.label == "ETF");
      const employerFundRecord = adjustment.find(
        (adj) => adj.label == "EmployerFund"
      );

      // Update the record if changes are detected, or create a new one if it doesn't exist
      if (epfRecord) {
        if (epfRecord.amount != parseFloat(epf)) {
          await axios.put(`${urL}/adjustment/${epfRecord.id}`, epfPayload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      } else {
        const epfPayload = {
          label: "EPF (Employee)",
          isPercentage: true,
          allowance: false,
          amount: parseFloat(epf),
        };
        await axios.post(`${urL}/adjustment`, epfPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      if (employerFundRecord) {
        if (employerFundRecord.amount != parseFloat(employerFund)) {
          await axios.put(
            `${urL}/adjustment/${employerFundRecord.id}`,
            employerPayload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      } else {
        const employerPayload = {
          label: "EmployerFund",
          isPercentage: true,
          allowance: false,
          amount: parseFloat(employerFund),
        };
        await axios.post(`${urL}/adjustment`, employerPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (etfRecord) {
        if (etfRecord.amount != parseFloat(etf)) {
          await axios.put(
            `${urL}/adjustment/${parseInt(etfRecord.id)}`,
            etfPayload,{
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      } else {
        const etfPayload = {
          label: "ETF",
          isPercentage: true,
          allowance: false,
          amount: parseFloat(etf),
        };
        await axios.post(`${urL}/adjustment`, etfPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      fetchAdjustments();
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdjustments();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (pdfLoading) {
    return <Loading text="Generating Payslips..." />;
  }

  return (
    <Form form={form}>
      {/* Modal 1 */}
      <Modal
        open={isModalOpen}
        footer={null}
        width="450px"
        onCancel={handleCancel}
        styles={modalStyles}
      >
        <AdjustmentModal
          error={error}
          success={success}
          handleCancel={handleCancel}
          fetch={fetchAdjustments}
        />
      </Modal>
      {/* Modal 2 */}
      <Modal
        open={isPayeModalOpen}
        footer={null}
        width="40vw"
        onCancel={handlePayeModalCancel}
        styles={modalStyles}
      >
        <PayeModal
          handleCancel={handlePayeModalCancel}
          error={error}
          success={success}
        />
      </Modal>
      <div className={styles.mainBox}>
        <div className={styles.topTitle}>
          Payroll Configuration & Salary Adjustments
        </div>
        <div className={styles.topInput}>
          <div className={styles.inputLine}>
            <div className={styles.inputSet}>
              <label>Employee Trust Fund (ETF) Rate</label>
              <br />
              <Form.Item
                style={{ marginBottom: 10 }}
                name="etf"
                rules={[{ required: true, message: "ETF Rate Required!" }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  formatter={(value) => `${value}%`}
                  parser={(value) => value.replace("%", "")}
                  value={etf}
                  onChange={(value) => setEtf(value)}
                  placeholder={"Enter Rate"}
                  style={{ width: "20vw" }}
                />
              </Form.Item>
            </div>
            <div className={styles.inputSet}>
              <label>Employee Provident Fund (EPF) Rate</label>
              <br />
              <Form.Item
                style={{ marginBottom: 10 }}
                name="epf"
                rules={[{ required: true, message: "EPF Rate Required!" }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  formatter={(value) => `${value}%`}
                  parser={(value) => value?.replace("%", "")}
                  value={epf}
                  onChange={(value) => setEpf(value)}
                  placeholder={"Enter Rate"}
                  style={{ width: "20vw" }}
                />
              </Form.Item>
            </div>
            <div className={styles.inputSet}>
              <label>Employer Provident Fund (EPF) Rate</label>
              <br />

              <Form.Item
                style={{ marginBottom: 10 }}
                name="EmployerFund"
                rules={[{ required: true, message: "EPF Rate Required!" }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  formatter={(value) => `${value}%`}
                  parser={(value) => value?.replace("%", "")}
                  value={employerFund}
                  onChange={(value) => setEmployerFund(value)}
                  placeholder={"Enter Rate"}
                  style={{ width: "20vw" }}
                />
              </Form.Item>
            </div>
          </div>
          <div className={styles.dynamicInputLine}>
            {adjustments.map((adj, index) => (
              <div key={index} className={styles.dynamicInputSet}>
                <label>{adj.label}</label>
                <div className={styles.inputDelete}>
                  <Input
                    disabled
                    value={
                      adj.isPercentage ? `${adj.amount}%` : `LKR ${adj.amount}`
                    }
                  />
                  <span onClick={() => handleAdjustmentDelete(adj.id)}>
                    <IoMdRemoveCircleOutline size={24} color="brown" />
                  </span>
                </div>
              </div>
            ))}

            <div className={styles.dynamicInputSet}>
              <button onClick={handleNewFields} className={styles.newFieldBtn}>
                <BsPlusCircle size={13} /> Add New Field
              </button>
            </div>
          </div>
          <div className={styles.payee}>
            <span>*</span> Income Paye Taxes Will Be Applied Automatically
            &nbsp;
            <div className={styles.link} onClick={handlePayeModalOpen}>
              Reconfigure PAYE Taxes <IoOpenOutline size={15} />
            </div>
          </div>
          <div className={styles.dates}>
            <div>
              <label>Payroll Period</label>
              <br />
              <Form.Item style={{ marginBottom: 0 }} name="range">
                <RangePicker
                  style={{ width: "250px" }}
                  onChange={(dates) => handleRangeChange(dates)}
                />
              </Form.Item>
            </div>
            <div>
              <label>Payroll Month</label>
              <br />
              <Form.Item
                name="payrollMonth"
                style={{ marginBottom: 0 }}
                rules={[{ required: true, message: "Please Fill the Month!" }]}
              >
                <DatePicker
                  picker="month"
                  style={{ width: "250px" }}
                  onChange={(value) => handleMonthChange(value)}
                />
              </Form.Item>
            </div>
          </div>
        </div>
        <hr />
        <div className={styles.bottomHalf}>
          <div className={styles.topTitle}>Individual Salary Adjustments</div>
          {individualAdjustment.map((adj, index) => (
            <div key={index} className={styles.inputLine}>
              <div>
                <label>
                  Employee ID/IDs{" "}
                  <Tooltip title="Separate IDs with Comma">
                    <InfoCircleOutlined
                      style={{ marginLeft: 4, color: "#1890ff" }}
                    />
                  </Tooltip>
                </label>
                <Form.Item
                  name={[index, "name"]}
                  style={{ marginBottom: 0, width: "300px" }}
                  rules={[
                    {
                      required: true,
                      message: "Enter ID",
                    },
                  ]}
                >
                  <Input
                    placeholder="IDs"
                    onChange={(e) => {
                      const newList = [...individualAdjustment];
                      newList[index].id = e.target.value;
                      setIndividualAdjustment(newList);
                    }}
                  />
                </Form.Item>
              </div>
              <div>
                <label>Adjustment Reason</label>
                <Form.Item
                  name={[index, "des"]}
                  style={{ marginBottom: 0, width: "300px" }}
                  rules={[
                    {
                      required: true,
                      message: "Enter Reason",
                    },
                  ]}
                >
                  <Input
                    maxLength={25}
                    placeholder="Description"
                    onChange={(e) => {
                      const newList = [...individualAdjustment];
                      newList[index].details = e.target.value;
                      setIndividualAdjustment(newList);
                    }}
                  />
                </Form.Item>
              </div>
              <div className={styles.amountLine}>
                <div>
                  <label>Amount</label>
                  <br />
                  <Form.Item
                    name={[index, "Amount"]}
                    style={{ marginBottom: 0 }}
                    rules={[
                      {
                        required: true,
                        message: "Enter Amount",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="Amount"
                      formatter={
                        adj.isPercentage
                          ? (value) => `${value}%`
                          : (value) => value.replace("%", "")
                      }
                      parser={
                        adj.isPercentage
                          ? (value) => value.replace("%", "")
                          : (value) => value
                      }
                      min={0}
                      max={adj.isPercentage ? 100 : undefined}
                      onChange={(value) => {
                        const newList = [...individualAdjustment];
                        newList[index].amount = value;
                        setIndividualAdjustment(newList);
                      }}
                    />
                  </Form.Item>
                </div>
                <div className={styles.checkBoxes}>
                  <Checkbox
                    style={{ transform: "scale(0.9)" }}
                    checked={adj.isAllowance}
                    onChange={() => {
                      handleAllowanceChange();
                      const newList = [...individualAdjustment];
                      newList[index].isAllowance = true;
                      setIndividualAdjustment(newList);
                    }}
                  >
                    Addition
                  </Checkbox>
                  <Checkbox
                    style={{ transform: "scale(0.9)" }}
                    checked={!adj.isAllowance}
                    onChange={() => {
                      handleAllowanceChange();
                      const newList = [...individualAdjustment];
                      newList[index].isAllowance = false;
                      setIndividualAdjustment(newList);
                    }}
                  >
                    Deduction
                  </Checkbox>
                </div>
                <div className={styles.checkBoxes}>
                  <Checkbox
                    style={{ transform: "scale(0.9)" }}
                    checked={adj.isPercentage}
                    onChange={() => {
                      handleAllowanceChange();

                      const newList = [...individualAdjustment];
                      newList[index].isPercentage = true;
                      setIndividualAdjustment(newList);
                    }}
                  >
                    Percentage
                  </Checkbox>
                  <Checkbox
                    style={{ transform: "scale(0.9)" }}
                    checked={!adj.isPercentage}
                    defaultChecked
                    onChange={() => {
                      handleAllowanceChange();
                      const newList = [...individualAdjustment];
                      newList[index].isPercentage = false;
                      setIndividualAdjustment(newList);
                    }}
                  >
                    Value
                  </Checkbox>
                </div>
              </div>
              <div
                className={styles.removeBtn}
                onClick={() => {
                  const newList = individualAdjustment.filter(
                    (_, i) => i !== index
                  );
                  setIndividualAdjustment(newList);
                }}
              >
                <IoMdRemoveCircleOutline size="2vw" color="brown" />
              </div>
            </div>
          ))}
          <div className={styles.btnSet}>
            <button onClick={handleNewIndividualAdjustment}>
              <BsPlusCircle size={13} />
              Add Adjustment
            </button>
            <button onClick={handleIndiAdjustmentSave}>
              <FaRegSave size={13} /> Save Adjustment
            </button>
            <button onClick={() => navigate("/adjustment")}>
              <LuEye size={13} />
              View Adjustments
            </button>
          </div>
        </div>
        <div className={styles.genBtn}>
          <Gbutton width={250} onClick={handleGenerate}>
            <>
              <MdCalculate size={19} />
              &nbsp;Generate Payroll
            </>
          </Gbutton>{" "}
          <Gbutton width={250} onClick={() => navigate("/payslip")}>
            <>
              <LuEye size={19} />
              &nbsp;View Payrolls
            </>
          </Gbutton>
        </div>
      </div>
    </Form>
  );
};

export default Payroll;

import { React, useState, useEffect } from "react";
import { Input, DatePicker, Checkbox, Modal, InputNumber } from "antd";
import styles from "./Payroll.module.css";
import { useNavigate } from "react-router-dom";
import { BsPlusCircle } from "react-icons/bs";
import { FaRegSave } from "react-icons/fa";
import { LuEye } from "react-icons/lu";



import Gbutton from "../../atoms/button/Button";
import { MdCalculate } from "react-icons/md";
import AdjustmentModal from "../../templates/AdjustmentModal/AdjustmentModal";
import axios from "axios";
import { IoOpenOutline } from "react-icons/io5";

import Loading from "../../atoms/loading/loading";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import PayeModal from "../../templates/PayeModal/PayeModal";

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
  const navigate = useNavigate();
  const [individualAdjustment, setIndividualAdjustment] = useState([
    { id: "", details: "", amount: "", isPercentage: true, isAllowance: true },
  ]);

  const [loading, setLoading] = useState(true);
  const handleAllowanceChange = () => {
    setIsAllowanceChecked(!isAllowanceChecked);
  };

  const handleMonthChange = (value) => {
    if (value) {
      const formattedMonth = value.format("MM~YYYY");
      setMonth(formattedMonth);
      console.log(month);
    }
  };
  const handleRangeChange = (dates) => {
    console.log(month);
    if (dates) {
      const formattedRange = [dates[0].toISOString(), dates[1].toISOString()];

      setRange(formattedRange);
    }
  };

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

  const handleGenerate = async () => {
    setLoading(true);
    console.log(range);
    await handleEtfEpf();
    try {
      await axios
        .post(`${urL}/payroll/calculate-all`, {
          range: range,
          month: month,
        })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleNewFields = () => {
    setIsModalOpen(true);
  };

  const handlePayeModalOpen = () => {
    setIsPayeModalOpen(true);
  };

  const handleAdjustmentDelete = async (id) => {
    setLoading(true);
    setLoading(true);
    try {
      const intId = parseInt(id, 10);
      await axios
        .delete(`${urL}/adjustment/${intId}`)
        .then((res) => {
          console.log(res);
          fetchAdjustments();
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };
  const fetchAdjustments = async () => {
    try {
      const res = await axios.get(`${urL}/adjustment`);

      if (
        res.data.find((adj) => adj.label == "EPF (Employee)") ||
        res.data.find((adj) => adj.label == "ETF") ||
        res.data.find((adj) => adj.label == "EmployerFund")
      ) {
        setEpf(res.data.find((adj) => adj.label == "EPF (Employee)").amount);
        setEtf(res.data.find((adj) => adj.label == "ETF").amount);
        setEmployerFund(
          res.data.find((adj) => adj.label == "EmployerFund").amount
        );
        const filteredRes = res.data.filter(
          (adj) =>
            adj.label !== "ETF" &&
            adj.label !== "EPF (Employee)" &&
            adj.label !== "EmployerFund"
        );
        setAdjustments(filteredRes);
      } else {
        setAdjustments(res.data);
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
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

  const handleIndiAdjustmentSave = async () => {
    setLoading(true);
    try {
      for (const adj of individualAdjustment) {
        const idArray = adj.id
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id !== "");

        for (const ids of idArray) {
          const payload = {
            empId: ids,
            label: adj.details,
            allowance: adj.isAllowance,
            isPercentage: adj.isPercentage,
            amount: parseFloat(adj.amount),
          };

          await axios
            .post(`${urL}/indiadjustment`, payload)
            .then((res) => {
              console.log(res);
              setIndividualAdjustment([
                {
                  id: "",
                  details: "",
                  amount: "",
                  isPercentage: true,
                  isAllowance: true,
                },
              ]);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleEtfEpf = async () => {
    try {
      const res = await axios.get(`${urL}/adjustment`);
      const adjustment = res.data;

      const epfRecord = adjustment.find((adj) => adj.label == "EPF (Employee)");
      const etfRecord = adjustment.find((adj) => adj.label == "ETF");
      const employerFundRecord = adjustment.find(
        (adj) => adj.label == "EmployerFund"
      );

      if (epfRecord) {
        await axios.put(`${urL}/adjustment/${epfRecord.id}`, {
          label: "EPF (Employee)",
          isPercentage: true,
          allowance: false,
          amount: parseFloat(epf),
        });
      } else {
        await axios.post(`${urL}/adjustment`, {
          label: "EPF (Employee)",
          isPercentage: true,
          allowance: false,
          amount: parseFloat(epf),
        });
      }

      if (employerFundRecord) {
        await axios.put(`${urL}/adjustment/${employerFundRecord.id}`, {
          label: "EmployerFund",
          isPercentage: true,
          allowance: false,
          amount: parseFloat(employerFund),
        });
      } else {
        await axios.post(`${urL}/adjustment`, {
          label: "EmployerFund",
          isPercentage: true,
          allowance: false,
          amount: parseFloat(employerFund),
        });
      }

      if (etfRecord) {
        await axios.put(`${urL}/adjustment/${parseInt(etfRecord.id)}`, {
          label: "ETF",
          isPercentage: true,
          allowance: false,
          amount: parseFloat(etf),
        });
      } else {
        await axios.post(`${urL}/adjustment`, {
          label: "ETF",
          isPercentage: true,
          allowance: false,
          amount: parseFloat(etf),
        });
      }
      fetchAdjustments();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAdjustments();
  }, []);

  if (loading) {
    return <Loading />;
  }
  return (
    <>
      <Modal
        open={isModalOpen}
        footer={null}
        width="450px"
        onCancel={handleCancel}
        styles={modalStyles}
      >
        <AdjustmentModal handleCancel={handleCancel} fetch={fetchAdjustments} />
      </Modal>
      <Modal
        open={isPayeModalOpen}
        footer={null}
        width="40vw"
        onCancel={handlePayeModalCancel}
        styles={modalStyles}
      >
        <PayeModal handleCancel={handlePayeModalCancel} />
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
              <InputNumber
                min={0}
                max={100}
                formatter={(value) => `${value}%`}
                parser={(value) => value.replace("%", "")}
                value={etf}
                onChange={(value) => setEtf(value)}
                placeholder={"Enter Rate"}
                style={{ width: "250px" }}
              />
            </div>
            <div className={styles.inputSet}>
              <label>Employee Provident Fund (EPF) Rate</label>
              <br />
              <InputNumber
                min={0}
                max={100}
                formatter={(value) => `${value}%`}
                parser={(value) => value?.replace("%", "")}
                value={epf}
                onChange={(value) => setEpf(value)}
                placeholder={"Enter Rate"}
                style={{ width: "250px" }}
              />
            </div>
            <div className={styles.inputSet}>
              <label>Employer Provident Fund (EPF) Rate</label>
              <br />
              <InputNumber
                min={0}
                max={100}
                formatter={(value) => `${value}%`}
                parser={(value) => value?.replace("%", "")}
                value={employerFund}
                onChange={(value) => setEmployerFund(value)}
                placeholder={"Enter Rate"}
                style={{ width: "250px" }}
              />
            </div>

            <div className={styles.inputSet}>
              <label>Max Paid Leave Days Allowed</label>
              <br />
              <InputNumber
                style={{ width: "250px" }}
                placeholder="No of Days"
              />
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
              <RangePicker
                style={{ width: "250px" }}
                onChange={(dates) => handleRangeChange(dates)}
              />
            </div>
            <div>
              <label>Payroll Period</label>
              <br />
              <DatePicker
                picker="month"
                style={{ width: "250px" }}
                onChange={(value) => handleMonthChange(value)}
              />
            </div>
          </div>
        </div>
        <hr />
        <div className={styles.bottomHalf}>
          <div className={styles.topTitle}>Individual Salary Adjustments</div>
          {individualAdjustment.map((adj, index) => (
            <div key={index} className={styles.inputLine}>
              <div>
                <label>Employee ID/IDs</label>
                <Input
                  placeholder="ID"
                  onChange={(e) => {
                    const newList = [...individualAdjustment];
                    newList[index].id = e.target.value;
                    setIndividualAdjustment(newList);
                  }}
                />
              </div>
              <div>
                <label>Adjustment Details</label>
                <Input
                  placeholder="Description"
                  onChange={(e) => {
                    const newList = [...individualAdjustment];
                    newList[index].details = e.target.value;
                    setIndividualAdjustment(newList);
                  }}
                />
              </div>
              <div>
                <label>Amount</label>
                <InputNumber
                  placeholder="Amount"
                  style={{ width: "280px" }}
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
              </div>
              <div className={styles.checkBoxes}>
                <Checkbox
                  style={{ transform: "scale(0.9)" }}
                  checked={adj.isAllowance}
                  onChange={() => {
                    handleAllowanceChange;

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
                    handleAllowanceChange;
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
                    handleAllowanceChange;

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
                    handleAllowanceChange;
                    const newList = [...individualAdjustment];
                    newList[index].isPercentage = false;
                    setIndividualAdjustment(newList);
                  }}
                >
                  Value
                </Checkbox>
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
                <IoMdRemoveCircleOutline size={30} color="brown" />
              </div>
            </div>
          ))}
          <div className={styles.btnSet}>
            <button onClick={handleNewIndividualAdjustment}>
            <BsPlusCircle size={13} />Add Adjustment
            </button>
            <button onClick={handleIndiAdjustmentSave}><FaRegSave size={13}/> Save Adjustment</button>
            <button onClick={() => navigate("/adjustment")}>
              <LuEye size={13}/>View Adjustments
            </button>
          </div>
        </div>
        <hr />
        <div className={styles.genBtn}>
          <Gbutton onClick={handleGenerate}>
            <>
              <MdCalculate size={19} />
              &nbsp;Generate Payroll
            </>
          </Gbutton>
        </div>
      </div>
    </>
  );
};

export default Payroll;

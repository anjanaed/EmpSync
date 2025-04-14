import { React, useState, useEffect } from "react";
import { Input, DatePicker, Checkbox, Modal } from "antd";
import styles from "./Payroll.module.css";
import Gbutton from "../../atoms/button/Button";
import { MdCalculate } from "react-icons/md";
import AdjustmentModal from "../../templates/AdjustmentModal/AdjustmentModal";
import axios from "axios";
import Loading from "../../atoms/loading/loading";
import { IoMdRemoveCircleOutline } from "react-icons/io";

const { RangePicker } = DatePicker;

const Payroll = () => {
  const [isAllowanceChecked, setIsAllowanceChecked] = useState(false);
  const [adjustments, setAdjustments] = useState([]);
  const [etf,setEtf]=useState();
  const[epf,setEpf]=useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const urL = import.meta.env.VITE_BASE_URL;
  const [individualAdjustment, setIndividualAdjustment] = useState([
    { id: "", details: "", amount: "",isPercentage:true, isAllowance: true },
  ]);

  const [loading, setLoading] = useState(true);
  const handleAllowanceChange = () => {
    setIsAllowanceChecked(!isAllowanceChecked);
  };

  const handleNewIndividualAdjustment = () => {
    setIndividualAdjustment([
      ...individualAdjustment,
      { id: "", details: "", amount: "", isAllowance: true },
    ]);
  };

  const handleGenerate=async()=>{
    setLoading(true)
    try {
      const payload = [{
        label: "ETF",
        isPercentage: true,
        allowance: false,
        amount:parseFloat(etf),
      },{
        label: "EPF",
        isPercentage: true,
        allowance: false,
        amount:parseFloat(epf),
      }];
      for(const items of payload){
        await axios
        .post(`${urL}/adjustment`, items)
        .then((res) => {
          console.log(res);
          fetch();
          handleCancel();
        })
        .catch((err) => {
          console.log(err);
        });
      setLoading(false);
      }
      setEpf();
      setEtf();

    } catch (err) {
      console.log(err);
      setLoading(false);
    }
    try{
      await axios.post(`${urL}/payroll/calculate-all`)
      .then((res)=>{
        console.log(res)
      }).catch((err)=>{
        console.log(err);
      })

    }catch(err){
      console.log(err)
    }
    setLoading(false)
  }

  const handleNewFields = () => {
    setIsModalOpen(true);
  };
  const handleAdjustmentDelete = async (id) => {
    setLoading(true);
    console.log(id);
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
      setAdjustments(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const modalStyles = {
    mask: {
      backdropFilter: "blur(12px)",
    },
  };

  const handleIndiAdjustmentSave=async()=>{
    setLoading(true);
    try{
      for(const adj of individualAdjustment){
        const idArray=adj.id.split(",").map((id)=>id.trim()).filter((id)=>id!=="");
        
        for(const ids of idArray){
        const payload={
          empId:ids,
          label:adj.details,
          allowance:adj.isAllowance,
          isPercentage:adj.isPercentage,
          amount:parseFloat(adj.amount)
        };


        await axios.post(`${urL}/indiadjustment`,payload)
        .then((res)=>{
          console.log(res)
          setIndividualAdjustment([
            { id: "", details: "", amount: "",isPercentage:true, isAllowance: true },
          ]);
        })
        .catch((err)=>{
          console.log(err);
        })
      }}

    }catch(err){
      console.log(err);
    }
    setLoading(false)

  }

  useEffect(() => {
    fetchAdjustments();
  }, []);

  useEffect(() => {
    console.log(adjustments);
  }, [adjustments]);

  if (loading) {
    return <Loading />;
  }
  return (
    <>
      <Modal
        open={isModalOpen}
        footer={null}
        width="40vw"
        onCancel={handleCancel}
        styles={modalStyles}
      >
        <AdjustmentModal handleCancel={handleCancel} fetch={fetchAdjustments} />
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
              <Input onChange={(e)=>setEtf(e.target.value)} placeholder="ETF" />
            </div>
            <div className={styles.inputSet}>
              <label>Employee Provident Fund (EPF) Rate</label>
              <br />
              <Input onChange={(e)=>setEpf(e.target.value)} placeholder="EPF" />
            </div>
            <div className={styles.inputSet}>
              <label>Max Paid Leave Days Allowed</label>
              <br />
              <Input placeholder="No of Days" />
            </div>
          </div>
          <div className={styles.dynamicInputLine}>
            {adjustments.map((adj, index) => (
              <div key={index} className={styles.dynamicInputSet}>
                <label>{adj.label}</label>
                <div className={styles.inputDelete}>
                  <Input placeholder="Enter Value" value={adj.amount || ""} />
                  <span onClick={() => handleAdjustmentDelete(adj.id)}>
                    <IoMdRemoveCircleOutline size={24} color="brown" />
                  </span>
                </div>
              </div>
            ))}
            <div className={styles.dynamicInputSet}>
              <button onClick={handleNewFields} className={styles.newFieldBtn}>
                + &nbsp; Deduction / Allowance
              </button>
            </div>
          </div>
          <div className={styles.payee}>
            <span>*</span> Income Payee Taxes will be applied automatically
          </div>
          <div>
            <label>Payroll Period</label>
            <br />
            <RangePicker />
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
                  value={adj.id}
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
                  value={adj.details}
                  onChange={(e) => {
                    const newList = [...individualAdjustment];
                    newList[index].details = e.target.value;
                    setIndividualAdjustment(newList);
                  }}
                />
              </div>
              <div>
                <label>Amount</label>
                <Input
                  placeholder="Amount"
                  value={adj.amount}
                  onChange={(e) => {
                    const newList = [...individualAdjustment];
                    newList[index].amount = e.target.value;
                    setIndividualAdjustment(newList);
                  }}
                />
              </div>
              <div className={styles.checkBoxes}>
                <Checkbox
                  checked={adj.isAllowance}
                  onChange={() => {
                    handleAllowanceChange;

                    const newList = [...individualAdjustment];
                    newList[index].isAllowance = true;
                    setIndividualAdjustment(newList);
                  }}
                >
                  Allowance
                </Checkbox>
                <Checkbox
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
                  checked={!adj.isPercentage}
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
              <div className={styles.removeBtn}
                onClick={() => {
                  const newList = individualAdjustment.filter(
                    (_, i) => i !== index
                  );
                  setIndividualAdjustment(newList);
                }}
              >
                <IoMdRemoveCircleOutline size={30} color="brown"/>
              </div>
            </div>
          ))}
          <div className={styles.btnSet}>
            <button onClick={handleNewIndividualAdjustment}>
              Add Adjustment
            </button>
            <button onClick={handleIndiAdjustmentSave}>Save Adjustment</button>
            <button>View Adjustments</button>
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

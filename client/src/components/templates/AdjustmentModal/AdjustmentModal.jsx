import { React, useState } from "react";
import { Input, Checkbox } from "antd";
import styles from "./AdjustmentModal.module.css";
import Gbutton from "../../atoms/button/Button";
import { FaRegSave } from "react-icons/fa";
import Loading from "../../atoms/loading/loading";
import axios from "axios";

const AdjustmentModal = ({handleCancel, fetch}) => {
  const [isAllowanceChecked, setIsAllowanceChecked] = useState(true);
  const [isTypeChecked, setIsTypeChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState();
  const[amount,setAmount]=useState();
  const urL = import.meta.env.VITE_BASE_URL;

  const handleAllowanceChange = () => {
    setIsAllowanceChecked(!isAllowanceChecked);
  };
  const handleTypeChange = () => {
    setIsTypeChecked(!isTypeChecked);
  };



  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        label: description,
        isPercentage: !isTypeChecked,
        allowance: isAllowanceChecked,
        amount:parseFloat(amount),
      };
      await axios
        .post(`${urL}/adjustment`, payload)
        .then((res) => {
          console.log(res);
          fetch();
          handleCancel();
        })
        .catch((err) => {
          console.log(err);
        });
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }

  };
  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className={styles.mainBox}>
        <h1>Add New Public Adjustment</h1>
        <div className={styles.inputDiv}>
          <div className={styles.inputLine}>
            <label className={styles.titles}>Adjustment Description</label>
            <Input
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VAT"
            ></Input>
          </div>
          <div className={styles.inputLine}>
            <label className={styles.titles}>Amount</label>
            <Input
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Value / Percentage"
            ></Input>
          </div>
          <div className={styles.inputLine}>
            <div>
              <div className={styles.titles}>Adjustment Type: &nbsp;</div>
              <div className={styles.checkBoxes}>
                <Checkbox
                  checked={isAllowanceChecked}
                  onChange={handleAllowanceChange}
                >
                  Addition
                </Checkbox>
                &nbsp;
                <Checkbox
                  checked={!isAllowanceChecked}
                  onChange={handleAllowanceChange}
                >
                  Deduction
                </Checkbox>
              </div>
            </div>
          </div>
          <div className={styles.inputLine}>
            <div>
              <div>
                <div className={styles.titles}>Amount Type: &nbsp;</div>
                <div className={styles.checkBoxes}>
                  <Checkbox checked={isTypeChecked} onChange={handleTypeChange}>
                    Value
                  </Checkbox>
                  &nbsp;
                  <Checkbox
                    checked={!isTypeChecked}
                    onChange={handleTypeChange}
                  >
                    Percentage
                  </Checkbox>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.btnDiv}>
          <Gbutton onClick={handleSave}>
            <>
              <FaRegSave />
              &nbsp;&nbsp;Save Changes
            </>
          </Gbutton>
        </div>
      </div>
    </div>
  );
};

export default AdjustmentModal;

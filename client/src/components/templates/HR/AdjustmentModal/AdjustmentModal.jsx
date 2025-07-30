import { React, useState } from "react";
import { Input, Checkbox, InputNumber, Form } from "antd";
import styles from "./AdjustmentModal.module.css";
import Gbutton from "../../../atoms/button/Button";
import { FaRegSave } from "react-icons/fa";
import Loading from "../../../atoms/loading/loading";
import axios from "axios";
import { useAuth } from "../../../../contexts/AuthContext";


const AdjustmentModal = ({ handleCancel, fetch, success, error }) => {
  const [isAllowanceChecked, setIsAllowanceChecked] = useState(true);
  const [isTypeChecked, setIsTypeChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState();
  const [amount, setAmount] = useState();
  const [form] = Form.useForm();
      const { authData } = useAuth();
  const token = authData?.accessToken;

  const urL = import.meta.env.VITE_BASE_URL;

  const handleAllowanceChange = () => {
    setIsAllowanceChecked(!isAllowanceChecked);
  };
  const handleTypeChange = () => {
    setIsTypeChecked(!isTypeChecked);
  };

  const handleSave = async () => {
    await form.validateFields();
    setLoading(true);
    try {
      const payload = {
        orgId: authData?.orgId,
        label: description,
        isPercentage: !isTypeChecked,
        allowance: isAllowanceChecked,
        amount: parseFloat(amount),
      };
      await axios.post(`${urL}/adjustment`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetch();
      handleCancel();
      success(`${description} Added Successfully`);
    } catch (err) {
      handleCancel();
      error("Something Went Wrong");
    }
    setLoading(false);
  };
  if (loading) {
    return <Loading />;
  }

  return (
    <Form form={form}>
      <div className={styles.mainBox}>
        <h1>Add New General Adjustment</h1>
        <div className={styles.inputDiv}>
          <div className={styles.inputLine}>
            <label className={styles.titles}>Adjustment Reason</label>
            <Form.Item
              name="des"
              rules={[
                {
                  required: true,
                  message: "Enter the Reason for Adjustment",
                },
              ]}
            >
              <Input
                maxLength={25}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bonus"
              ></Input>
            </Form.Item>
          </div>
          <div className={styles.inputLine}>
            <label className={styles.titles}>Amount</label>
            <br />
            <Form.Item
              name="amount"
              rules={[
                {
                  required: true,
                  message: "Enter the Amount",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                onChange={(value) => setAmount(value)}
                placeholder="Value / Percentage"
                formatter={
                  !isTypeChecked
                    ? (value) => `${value}%`
                    : (value) => value.replace("%", "")
                }
                parser={
                  !isTypeChecked
                    ? (value) => value.replace("%", "")
                    : (value) => value
                }
                min={0}
                max={!isTypeChecked ? 100 : undefined}
              />
            </Form.Item>
          </div>
          <div className={styles.inputLine}>
            <div>
              <div className={styles.titles}>Adjustment Type: &nbsp;</div>
              <div className={styles.checkBoxes}>
                <Checkbox
                  style={{ transform: "scale(0.9)" }}
                  checked={isAllowanceChecked}
                  onChange={handleAllowanceChange}
                >
                  Addition
                </Checkbox>
                &nbsp;
                <Checkbox
                  style={{ transform: "scale(0.9)" }}
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
                  <Checkbox
                    style={{ transform: "scale(0.9)" }}
                    checked={isTypeChecked}
                    onChange={handleTypeChange}
                  >
                    Fixed Amount
                  </Checkbox>
                  &nbsp;
                  <Checkbox
                    style={{ transform: "scale(0.9)" }}
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
          <button onClick={handleSave}>
            <>
              <FaRegSave />
              &nbsp;&nbsp;Save Changes
            </>
          </button>
        </div>
      </div>
    </Form>
  );
};

export default AdjustmentModal;

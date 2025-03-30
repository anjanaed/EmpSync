import {React,useState} from 'react';
import { Input,DatePicker,Checkbox } from 'antd';
import styles from "./Payroll.module.css"
import Gbutton from "../../atoms/button/Button";
import { MdCalculate } from "react-icons/md";

const {RangePicker}=DatePicker;


const Payroll=()=>{
    const [isAllowanceChecked, setIsAllowanceChecked] = useState(false);
    const [isDeductionChecked, setIsDeductionChecked] = useState(false);

    
    const [loading,setLoading]=useState(false)
    const handleAllowanceChange=()=>{
        setIsDeductionChecked(false)
        setIsAllowanceChecked(true)
    }
    const handleDeductionChange=()=>{
        setIsDeductionChecked(true)
        setIsAllowanceChecked(false)
    }

    return(
        <>
            <div className={styles.mainBox}>
                <div className={styles.topTitle}>
                    Payroll Configuration & Salary Adjustments
                </div>
                <div className={styles.topInput}>
                <div className={styles.inputLine}>
                    <div className={styles.inputSet} >
                        <label>Employee Trust Fund (ETF) Rate</label><br/>
                        <Input placeholder='ETF'/>
                    </div>
                    <div className={styles.inputSet}>
                        <label>Employee Provident Fund (EPF) Rate</label><br/>
                        <Input placeholder='EPF'/>
                    </div>
                    <div className={styles.inputSet}>
                        <label>Max Paid Leave Days Allowed</label><br/>
                        <Input placeholder='No of Days'/>
                    </div>
                    </div>
                    <div className={styles.inputLine}>
                    <div className={styles.inputSet}>
                        <label>Applicable Taxes</label>
                        <Input placeholder='Taxes'/>
                    </div>
                    <div className={styles.inputSet}>
                        <button>Add Deduction/Allowance + </button>
                    </div>
                    <div className={styles.inputSet}></div>
                    </div>
                    <div className={styles.payee}>
                        <span>*</span> Income Payee Taxes will be applied automatically
                    </div>
                    <div>
                        <label>Payroll Period</label><br/>
                        <RangePicker/>
                    </div>
                </div>
                <hr/>
                <div>
                    <div className={styles.topTitle}>
                        Individual Salary Adjustments
                    </div>
                    <div className={styles.inputLine}>
                    <div>
                        <label>Employee ID/IDs</label>
                        <Input placeholder='ID'/>
                    </div>
                    <div>
                        <label>Adjustment Details</label>
                        <Input placeholder='Adjustment'/>
                    </div>
                    <div>
                        <label>Amount</label>
                        <Input placeholder='Amount'/>
                    </div>
                    <div>
                        <Checkbox checked={isAllowanceChecked} onChange={handleAllowanceChange} >Allowance</Checkbox>
                        <Checkbox checked={isDeductionChecked} onChange={handleDeductionChange} >Deduction</Checkbox>
                    </div>
                    </div>
                    <div className={styles.btnSet}>
                        <button>Save Adjustment</button>
                        <button>View Adjustments</button>
                    </div>
                    
                </div>
                <hr/>
                <div className={styles.genBtn}>
                    <Gbutton><><MdCalculate size={19}/>&nbsp;Generate Payroll</></Gbutton>
                </div>
            </div>
        </>
    )
}

export default Payroll
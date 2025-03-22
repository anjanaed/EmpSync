import React from "react";
import { Tabs, Form, Input, DatePicker, Select, Space } from "antd";
import styles from "./EditModal.module.css";

const onChange = (key) => {};

const items = [
  {
    key: "personal",
    size: "large",
    label: <span className={styles.tabHead}>Personal Details</span>,
    children: (
      <>
        <div className={styles.con}>
          <Form.Item
            name="fullname"
            label="Full Name"
            rules={[
              {
                required: true,
                message: "Please input your Name!",
                whitespace: true,
              },
            ]}
          >
            <Input
              placeholder="Enter Name"
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="email"
            label="E-mail"
            rules={[
              {
                type: "email",
                message: "The input is not valid E-mail!",
              },
              {
                required: true,
                message: "Please input your E-mail!",
              },
            ]}
          >
            <Input
              placeholder="Enter Email Address"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>
          <Form.Item name="phone" label="Phone Number">
            <Input
              placeholder="Enter Mobile Number"
              onChange={(e) => setTel(e.target.value)}
              style={{
                width: "100%",
              }}
            />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Gender"
            rules={[
              {
                required: true,
                message: "Please select gender!",
              },
            ]}
          >
            <Select
              placeholder="Select Gender"
              onChange={(value) => setGender(value)}
              className={styles.select}
            >
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item name="address" label="Residential Address">
            <Input
              placeholder="Enter Address"
              onChange={(e) => setAddress(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="dob"
            label="Date of Birth"
            rules={[
              {
                required: true,
                message: "Please Enter Birth Date!",
              },
            ]}
          >
            <DatePicker
              onChange={(date) => setDob(moment(date).format("YYYY-MM-DD"))}
              placeholder="Select Birth Date"
              style={{ width: "100%" }}
              className={styles.select}
            />
          </Form.Item>
        </div>
      </>
    ),
  },
  {
    key: "employment",
    label: <span className={styles.tabHead}>Employment</span>,
    children: (
      <>
        <div className={styles.con}>
          <Form.Item
            name="empId"
            label="Employee ID"
            rules={[
              {
                required: true,
                message: "Please Enter ID!",
              },
            ]}
          >
            <Input
              placeholder="Enter ID"
              onChange={(e) => setId(e.target.value)}
            />
          </Form.Item>
          <Form.Item name="supId" label="Supervisor's ID">
            <Input placeholder="Enter Supervisor ID (If Available)" />
          </Form.Item>
          <Form.Item
            label={
              <>
                <p style={{ color: "red" }}>* </p>&#8201; Job Role
              </>
            }
            name="role"
          >
            <Space.Compact className={styles.select}>
              <Form.Item
                noStyle
                name="selectRole"
                style={{ flex: "1" }}
                rules={[
                  {
                    required: true,
                    message: "Please Enter Role!",
                  },
                ]}
              >
                <Select
                  // onChange={(value) => setJobRole(value)}
                  style={{ width: "100%" }}
                  placeholder="Select Role"
            
                >
                  <Select.Option value="HrManager">
                    HR Administrator
                  </Select.Option>
                  <Option value="KitchenAdmin">Kitchen Admin</Option>
                  <Option value="KitchenStaff">Kitchen Staff</Option>
                  <Option value="InventoryManager">Inventory Manager</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
              <Form.Item name="customRole" noStyle style={{ flex: "2" }}>
                <Input
                  style={{ width: "100%" }}
                  // onChange={(e) => setCustomJobRole(e.target.value)}
                  placeholder="If Other, Enter Job Role"
                  // disabled={jobRole !== "Other"}
                  required="false"
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item
            name="salary"
            label="Basic Salary"
            rules={[
              {
                required: true,
                message: "Please Enter Salary!",
              },
            ]}
          >
            <Input
              placeholder="Enter Basic Salary"
              onChange={(e) => setSalary(e.target.value)}
            />
          </Form.Item>
        </div>
      </>
    ),
  },
  {
    key: "additional",
    label: <span className={styles.tabHead}>Additional</span>,
    children: (
      <>
        <div className={styles.con}>
          <Form.Item
            name="language"
            label="Preferred Language"
            rules={[
              {
                required: true,
                message: "Please Select Language!",
              },
            ]}
          >
            <Select
            className={styles.select}
              placeholder="Select Language"
              onChange={(value) => setLang(value)}
            >
              <Option value="Sinhala">Sinhala</Option>
              <Option value="English">English</Option>
              <Option value="Tamil">Tamil</Option>
            </Select>
          </Form.Item>
          <label>Finger Print: </label>
          <button className={styles.rescanBtn}>Rescan</button>
        </div>
      </>
    ),
  },
];

const EditModal = () => {
  return (
    <>
      <div className={styles.head}>Edit Employee - E11</div>
      <div className={styles.headDes}>
        Update employee information. Click save when you're done.
      </div>

      <div className={`${styles.yo} customTabs`}>
        <Tabs
          className={styles.tab}
          defaultActiveKey="personal"
          items={items}
          onChange={onChange}
        />
      </div>
    </>
  );
};

export default EditModal;

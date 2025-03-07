import React, { useState } from 'react';
import styles from "./NewNavBar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserPlus,
  faFileInvoice,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import {
  MenuOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, ConfigProvider } from 'antd';
import Register from '../../../pages/HRManager/Registration/Registration';
import HrInput from '../hrInput/hrInput';
import img from "../../../assets/logo.png.png";


const { Header, Sider, Content } = Layout;

const customTheme = {
  token: {
    colorPrimary: '#d10000', 
    colorText: 'rgb(72, 72, 72)',
    colorPrimaryActive	:'rgb(189, 189, 189);',
  },
  components: {
    Menu: {
      itemHeight: 50,
      itemMarginInline: 10,
      itemMarginBlock: 14, // Vertical margin between items
      iconMarginInlineEnd: 16, // Space between icon and text
    },
  },
};

const NewNavBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <ConfigProvider theme={customTheme}>
      <Layout>
        <Sider className={styles.sider} trigger={null} width={"15vw"} collapsible collapsed={collapsed}>
          {!collapsed && (
            <>
              <h1 className={styles.navHeader}>Human <br /> Resources</h1>
              <hr className={styles.line} />
            </>
          )}
                    {collapsed && (
            <>
              <h1 className={styles.navHeader}>H <br /> R</h1>
              <hr className={styles.line} />
            </>
          )}
          <Menu
            className={styles.menu}
            theme="light"
            mode="inline"
            defaultSelectedKeys={['1']}
            items={[
              {
                key: '1',
                icon: <FontAwesomeIcon icon={faUsers} />,
                label: 'Employees',
                
              },
              {
                key: '2',
                icon: <FontAwesomeIcon icon={faUserPlus} />,
                label: 'Registration',
              },
              {
                key: '3',
                icon: <FontAwesomeIcon icon={faDollarSign} />,
                label: 'Payrolls',
              },
              {
                key: '4',
                icon: <FontAwesomeIcon icon={faFileInvoice} />,
                label: 'Reports',
              },
            ]}
          />
        </Sider>
            <div className={styles.headerContent}>
              <Button
                type="text"
                icon={collapsed ? <MenuOutlined /> : <MenuOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
                 <img className={styles.logo} src={img}></img>

            </div>
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <HrInput/>
          </Content>
        </Layout>
    </ConfigProvider>
  );
};

export default NewNavBar;
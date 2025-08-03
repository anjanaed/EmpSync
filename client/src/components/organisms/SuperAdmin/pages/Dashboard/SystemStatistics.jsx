import React, { useEffect, useState } from 'react';
import { Card, Statistic, Table, Spin, message } from 'antd';
import {
  ApartmentOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  ShopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../../../../../contexts/AuthContext.jsx';
import styles from './SystemStatistics.module.css';

const SystemStatistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
   const { superAuthData } = useAuth();
  const urL = import.meta.env.VITE_BASE_URL;

  const token = superAuthData?.accessToken;

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${urL}/super-admin/system-statistics`,{
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      const sortedData = {
        ...response.data,
        usersPerOrganization: response.data.usersPerOrganization.sort((a, b) => {
          const numA = parseInt(a.orgId.replace(/[^\d]/g, ''), 10);
          const numB = parseInt(b.orgId.replace(/[^\d]/g, ''), 10);
          return numA - numB;
        }),
      };

      setStats(sortedData);
    } catch (err) {
      message.error('Failed to fetch system statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const columns = [
    {
      title: 'Organization ID',
      dataIndex: 'orgId',
      key: 'orgId',
      sorter: (a, b) => {
        const numA = parseInt(a.orgId.replace(/[^\d]/g, ''), 10);
        const numB = parseInt(b.orgId.replace(/[^\d]/g, ''), 10);
        return numA - numB;
      },
    },
    {
      title: 'Organization Name',
      dataIndex: 'orgName',
      key: 'orgName',
    },
    {
      title: 'Total Users',
      dataIndex: 'totalUsers',
      key: 'totalUsers',
    },
  ];

  if (loading) {
    return <Spin size="large" className={styles.spinner} />;
  }

  if (!stats) {
    return <div className={styles.centeredMessage} >Statistics not available.</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>System Statistics</h2>

      <div className={styles.cardRow}>
        <Card className={styles.statCard}>
          <Statistic
            title="Total Organizations"
            value={stats.totalOrganizations}
            prefix={<span className={styles.iconOrg}><ApartmentOutlined /></span>}
          />
        </Card>
        <Card className={styles.statCard}>
          <Statistic
            title="Total Users"
            value={stats.totalUsers}
            prefix={<span className={styles.iconUsers}><TeamOutlined /></span>}
          />
        </Card>
        <Card className={styles.statCard}>
          <Statistic
            title="HR Admins"
            value={stats.totalHRAdmins}
            prefix={<span className={styles.iconHR}><UserSwitchOutlined /></span>}
          />
        </Card>
        <Card className={styles.statCard}>
          <Statistic
            title="Kitchen Admins"
            value={stats.totalKitchenAdmins}
            prefix={<span className={styles.iconKitchen}><ShopOutlined /></span>}
          />
        </Card>
        <Card className={styles.statCard}>
          <Statistic
            title="Other Users"
            value={stats.totalOtherUsers}
            prefix={<span className={styles.iconOther}><UserOutlined /></span>}
          />
        </Card>
      </div>

      <div style={{ marginTop: 32 }}>
        <h3 className={styles.title}>Users Per Organization</h3>
        <Table
          columns={columns}
          dataSource={stats.usersPerOrganization}
          rowKey="orgId"
          pagination={{ pageSize: 4 }}
          className={styles.table}
        />
      </div>
    </div>
  );
};

export default SystemStatistics;

import { Layout } from 'antd';
import styles from './AppHeader.module.css';

const { Header } = Layout;

const AppHeader = ({ title = "Super Administrator" }) => {
  return (
    <Header className={styles.header}>
      <span className={styles.title}>{title}</span>
    </Header>
  );
};

export default AppHeader;
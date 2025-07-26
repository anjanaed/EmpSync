import React from 'react';
import UserPayroll from '../../organisms/UserPortal/Payroll/UserPayroll';
import NavBar from '../../organisms/UserPortal/ResponsiveNavbar/ResponsiveNav.jsx';
import { useTheme } from '../../../contexts/ThemeContext';

const PayrollPage = () => {
  const { theme } = useTheme();

  return (
    <div data-theme={theme}>
      <NavBar />
      <UserPayroll />
    </div>
  );
};

export default PayrollPage;

import React from 'react';
import { Button } from 'antd';

const FormFooter = () => (
  <div style={{ 
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    marginTop: '32px'
  }}>
    <Button>Cancel</Button>
    <Button 
      type="primary" 
      htmlType="submit"
      style={{ backgroundColor: '#800020' }}
    >
      Confirm
    </Button>
  </div>
);

export default FormFooter;
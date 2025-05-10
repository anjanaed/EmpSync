import React, { useState } from 'react';
import { Button, Upload, message, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { parseCSV, validateCSVData } from '../CSV reader/csvParser';
import axios from 'axios';

const urL = import.meta.env.VITE_BASE_URL;

const CSVImportButton = ({ onSuccess }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      
      // Parse CSV file
      const ingredients = await parseCSV(file);
      
      // Validate data
      const errors = validateCSVData(ingredients);
      if (errors.length > 0) {
        Modal.error({
          title: 'Validation Errors',
          content: (
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          ),
        });
        return;
      }

      // Upload ingredients to server
      const responses = await Promise.all(
        ingredients.map(ingredient =>
          axios.post(`${urL}/ingredients`, ingredient)
        )
      );

      message.success('Successfully imported ingredients');
      onSuccess(responses.map(response => response.data));
      
    } catch (error) {
      console.error('Error importing CSV:', error);
      message.error('Failed to import ingredients');
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload = (file) => {
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    if (!isCSV) {
      message.error('You can only upload CSV files!');
      return false;
    }
    handleUpload(file);
    return false; // Prevent automatic upload
  };

  return (
    <Upload
      beforeUpload={beforeUpload}
      showUploadList={false}
    >
      <Button
        icon={<UploadOutlined />}
        loading={uploading}
        style={{ marginRight: '10px' }}
      >
        Import CSV
      </Button>
    </Upload>
  );
};

export default CSVImportButton;
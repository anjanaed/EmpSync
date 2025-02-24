import React, { useRef } from 'react';
import { Button } from 'antd';

const ImageUpload = ({ imageUrl, setImageUrl }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div 
        style={{ 
          width: '100%', 
          height: '200px', 
          marginBottom: '8px',
          border: '2px dashed #d9d9d9',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fafafa'
        }}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="meal" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              borderRadius: '6px'
            }} 
          />
        ) : (
          <span style={{ color: '#999' }}>No image selected</span>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <Button 
        block 
        onClick={handleClick}
        style={{ 
          backgroundColor: '#800020',
          color: 'white',
          marginTop: '8px'
        }}
      >
        Choose image
      </Button>
    </div>
  );
};

export default ImageUpload;
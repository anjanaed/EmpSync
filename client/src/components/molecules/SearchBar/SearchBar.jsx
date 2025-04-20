import React from "react";
import { Space,Input } from "antd";

const SearchBar = ({placeholder,onChange, onSearch,styles}) => {
    const { Search } = Input;
  return (
    <div>
      <Space direction="vertical">
        <Search
          placeholder={placeholder}
          onChange={onChange}
          onSearch={onSearch}
          style={{            
            width: 200,
            ...styles,
          }}
        />
      </Space>
    </div>
  );
};

export default SearchBar;

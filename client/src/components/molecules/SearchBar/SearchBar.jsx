import React from "react";
import { Space,Input } from "antd";

const SearchBar = ({placeholder, onSearch,styles}) => {
    const { Search } = Input;
  return (
    <div>
      <Space direction="vertical">
        <Search
          placeholder={placeholder}
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

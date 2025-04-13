import { Tabs } from 'antd';

const onChange = (key) => {
  console.log(key);
};

const items = [
  {
    key: 'personal',
    label: (
      <span>
        Personal Details
      </span>
    ),
    children: 'Personal Details Content',
  },
  {
    key: 'employment',
    label: (
      <span>
        Employment
      </span>
    ),
    children: 'Employment Content',
  },
  {
    key: 'additional',
    label: (
      <span>
        Additional
      </span>
    ),
    children: (<div>Hello</div>),
  },
];


const CusTabs=()=>{

    return(
        <>
        <Tabs defaultActiveKey="personal" items={items} onChange={onChange} />;
        </>
    )
}

export default CusTabs;

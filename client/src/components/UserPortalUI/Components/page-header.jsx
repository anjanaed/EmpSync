import { Typography } from "antd";
import PropTypes from "prop-types";

const { Title, Paragraph } = Typography;

export function PageHeader({ title, description, className }) {
  return (
    <div className={className} style={{ marginBottom: "16px" }}>
      <Title level={2} style={{ marginBottom: "8px" }}>
        {title}
      </Title>
      {description && <Paragraph type="secondary">{description}</Paragraph>}
    </div>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  className: PropTypes.string,
};

PageHeader.defaultProps = {
  description: null,
  className: "",
};
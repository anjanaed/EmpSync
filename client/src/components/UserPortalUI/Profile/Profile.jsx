import { PageHeader } from "../Components/page-header";
import { ProfileForm } from "../Components/profile-form";
import { Card, Layout } from "antd";

const { Content } = Layout;

export default function ProfilePage() {
  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "24px",
        }}
      >
        <Card
          style={{
            width: "100%",
           // Adjusted for better responsiveness
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
          }}
          bodyStyle={{
            padding: "24px",
          }}
        >
          <PageHeader
            title="User Profile"
            description="View and manage your personal information"
            style={{
              marginBottom: "24px",
              textAlign: "center",
            }}
          />
          <ProfileForm />
        </Card>
      </Content>
    </Layout>
  );
}
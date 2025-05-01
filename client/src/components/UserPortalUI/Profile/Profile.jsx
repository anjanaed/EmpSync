import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../../contexts/UserContext"; // Import UserContext
import { PageHeader } from "../Components/page-header";
import { ProfileForm } from "../Components/profile-form";
import { Card, Layout } from "antd";

const { Content } = Layout;

export default function ProfilePage() {
  const location = useLocation();
  const { user, setUser } = useContext(UserContext); // Access UserContext
  const employeeId = location.state?.employeeId?.toUpperCase();

  useEffect(() => {
    if (employeeId) {
      console.log(`Employee ID: ${employeeId}`);
      setUser((prev) => ({ ...prev, employeeId })); // Set employeeId in global state
    } else {
      console.warn("No employee ID found in location state.");
    }
  }, [employeeId, setUser]);

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
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
          }}
        >
          <div style={{ padding: "24px" }}>
            <PageHeader
              title="User Profile"
              description="View and manage your personal information"
              style={{
                marginBottom: "24px",
                textAlign: "center",
              }}
            />
            <ProfileForm employeeId={user.employeeId} /> {/* Use global employeeId */}
          </div>
        </Card>
      </Content>
    </Layout>
  );
}
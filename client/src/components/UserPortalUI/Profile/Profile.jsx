import { PageHeader } from "../Components/page-header";
import { ProfileForm } from "../Components/profile-form";

export default function ProfilePage() {
  return (
    <div style={{ padding: "24px" }}>
      <PageHeader title="User Profile" description="View and manage your personal information" />
      <ProfileForm />
    </div>
  );
}
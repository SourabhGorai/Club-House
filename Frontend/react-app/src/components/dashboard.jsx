import SuperAdminDashboard from "./SuperAdminDashboard";
import TeachersDashboard from "./TeachersDashboard";
import ClubAdminDashboard from "./ClubAdminDashboard";
import UsersDashboard from "./UsersDashboard";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "/login";
    return null;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard />;
      case 'TEACHERS':
        return <TeachersDashboard />;
      case 'CLUB_ADMIN':
        return <ClubAdminDashboard />;
      case 'USERS':
      default:
        return <UsersDashboard />;
    }
  };

  return (
    <div>
      {renderDashboard()}
    </div>
  );
}

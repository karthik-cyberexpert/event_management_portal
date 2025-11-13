import { useAuth } from "@/contexts/AuthContext";
import CoordinatorDashboard from "./coordinator/Dashboard";
import HodDashboard from "./hod/Dashboard";
import DeanIrDashboard from "./dean/IrDashboard";
import PrincipalDashboard from "./principal/Dashboard";
import AdminDashboard from "./admin/Dashboard";

const Index = () => {
  const { profile } = useAuth();

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  switch (profile.role) {
    case 'coordinator':
      return <CoordinatorDashboard />;
    case 'hod':
      return <HodDashboard />;
    case 'dean':
      return <DeanIrDashboard />;
    case 'principal':
      return <PrincipalDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <AdminDashboard />;
  }
};

export default Index;
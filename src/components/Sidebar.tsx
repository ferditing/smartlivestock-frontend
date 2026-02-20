// Sidebar.tsx - Updated
import { Link, useLocation } from "react-router-dom";
import { logout } from "../auth/auth";
import { useToast } from "../context/ToastContext";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  FileText,
  User,
  LogOut,
  PawPrint,
  Stethoscope,
  Package,
  Store,
  ClipboardList,
  Shield,
  BarChart3,
  Settings,
} from "lucide-react";

export default function Sidebar({ role, onNavClick }: { role: string; onNavClick?: () => void }) {
  const location = useLocation();
  const { addToast } = useToast();

  const handleLogout = () => {
    logout();
    addToast('success', 'Logged Out', 'You have been logged out successfully');
  };

  const handleNavClick = (callback?: () => void) => {
    callback?.();
    onNavClick?.();
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "" : "";
  const assignedCounty = typeof window !== "undefined" ? localStorage.getItem("assignedCounty") || "" : "";

  const menuItems = [
    // Common items (hide profile for admin - no /admin/profile yet)
    {
      to: `/${role}/profile`,
      label: "Profile",
      icon: <User className="w-5 h-5" />,
      show: role !== "admin"
    },

    // Farmer items
    {
      to: "/farmer",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      show: role === "farmer"
    },
    {
      to: "/farmer/animals",
      label: "My Animals",
      icon: <PawPrint className="w-5 h-5" />,
      show: role === "farmer"
    },
    {
      to: "/farmer/appointments/new",
      label: "Book Appointment",
      icon: <Calendar className="w-5 h-5" />,
      show: role === "farmer"
    },
    {
      to: "/farmer/marketplace",
      label: "Marketplace",
      icon: <Store className="w-5 h-5" />,
      show: role === "farmer"
    },
    {
      to: "/farmer/orders",
      label: "My Orders",
      icon: <Package className="w-5 h-5" />,
      show: role === "farmer"
    },

    // Vet items
    {
      to: "/vet",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      show: role === "vet"
    },
    {
      to: "/vet/cases",
      label: "Cases",
      icon: <Stethoscope className="w-5 h-5" />,
      show: role === "vet"
    },
    {
      to: "/vet/appointments",
      label: "Appointments",
      icon: <Calendar className="w-5 h-5" />,
      show: role === "vet"
    },

    // Agrovet items
    {
      to: "/agrovet",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      show: role === "agrovet"
    },
    {
      to: "/agrovet/products",
      label: "Products",
      icon: <Package className="w-5 h-5" />,
      show: role === "agrovet"
    },
    {
      to: "/agrovet/orders",
      label: "Orders, Status & Receipts",
      icon: <ClipboardList className="w-5 h-5" />,
      show: role === "agrovet"
    },

    // Common clinical records
    {
      to: "/clinical-records",
      label: "Clinical Records",
      icon: <FileText className="w-5 h-5" />,
      show: role === "farmer" || role === "vet"
    },

    // Admin items
    {
      to: "/admin",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      show: role === "admin"
    },
    {
      to: "/admin/users",
      label: "User Management",
      icon: <Users className="w-5 h-5" />,
      show: role === "admin"
    },
    {
      to: "/admin/providers",
      label: "Provider Approvals",
      icon: <Shield className="w-5 h-5" />,
      show: role === "admin"
    },
    {
      to: "/admin/analytics",
      label: "Disease Analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      show: role === "admin"
    },
    {
      to: "/admin/audit-logs",
      label: "Audit Logs",
      icon: <FileText className="w-5 h-5" />,
      show: role === "admin"
    },
    {
      to: "/admin/settings",
      label: "System Settings",
      icon: <Settings className="w-5 h-5" />,
      show: role === "admin"
    },
    {
      to: "/admin/staff",
      label: "Staff Management",
      icon: <UserPlus className="w-5 h-5" />,
      show: role === "admin"
    },

    // Subadmin items
    {
      to: "/subadmin",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      show: role === "subadmin"
    },
    {
      to: "/subadmin/users",
      label: "County Users",
      icon: <Users className="w-5 h-5" />,
      show: role === "subadmin"
    },
    {
      to: "/subadmin/analytics",
      label: "County Analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      show: role === "subadmin"
    },
    {
      to: "/subadmin/providers",
      label: "Provider Approvals",
      icon: <Shield className="w-5 h-5" />,
      show: role === "subadmin"
    }
  ];

  return (
    <aside className="flex flex-col w-64 bg-gradient-to-b from-green-700 to-green-800 text-white h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <PawPrint className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">SmartLivestock</h2>
            <p className="text-green-200 text-sm">Livestock Management</p>
          </div>
        </div>
        {role === "subadmin" && (userName || assignedCounty) && (
          <div className="mt-4 pt-4 border-t border-green-600/50">
            <p className="text-green-100 text-sm font-medium">Welcome back, {userName || "Subadmin"}</p>
            {assignedCounty && <p className="text-green-200/90 text-xs mt-0.5">{assignedCounty}</p>}
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems
          .filter(item => item.show)
          .map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => handleNavClick()}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.to)
                  ? "bg-white/20 text-white shadow-inner"
                  : "hover:bg-white/10 text-green-100 hover:text-white"
                }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
      </nav>

      <div className="p-4 border-t border-green-600/50">
        <button
          onClick={() => {
            handleLogout();
            handleNavClick();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
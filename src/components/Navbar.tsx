// Navbar.tsx - Updated
import { LogOut, Menu } from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function Navbar() {
  const { addToast } = useToast();

  const logout = async () => {
    try {
      localStorage.clear();
      addToast('success', 'Success', 'Logged out successfully');
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (error) {
      addToast('error', 'Error', 'Failed to logout');
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-6 py-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-2">
        <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SL</span>
          </div>
          <h1 className="font-bold text-xl text-gray-900 hidden sm:block">SmartLivestock</h1>
        </div>
      </div>
      
      <button
        onClick={logout}
        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors duration-200"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  );
}
// Layout.tsx - Updated
import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";

export default function Layout({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-green-700 to-green-800 text-white p-4 flex items-center justify-between z-50 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold">🐄</span>
          </div>
          <span className="font-bold">SmartLivestock</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 top-16"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex pt-16 lg:pt-0">
        {/* Sidebar - Mobile Drawer / Desktop Fixed */}
        <div
          className={`fixed lg:fixed top-0 left-0 w-64 h-screen bg-gradient-to-b from-green-700 to-green-800 text-white z-40 transition-transform duration-300 lg:translate-x-0 overflow-y-auto ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar role={role} onNavClick={() => setMobileMenuOpen(false)} />
        </div>

        <div className="flex-1 min-h-screen lg:ml-64">
          <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
import { Link } from "react-router-dom";
import { logout } from "../auth/auth";

export default function Sidebar({ role }: { role: string }) {

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <aside className="w-64 bg-green-700 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">SmartLivestock</h2>

      {role && (
        <Link to={`/${role}/profile`} className="block py-2 hover:bg-green-600 rounded">
          Profile
        </Link>
      )}
      
      {role === "farmer" && (
        <>
          <Link to="/farmer" className="block py-2 hover:bg-green-600 rounded">
            Dashboard
          </Link>
        </>
      )}

      {role === "farmer" && (
        <>
          <Link to="/farmer/animals" className="block py-2 hover:bg-green-600 rounded">
            My Animals
          </Link>
        </>
      )}
      {role === "farmer" && (
        <>
          <Link to="/farmer/profile" className="block py-2 hover:bg-green-600 rounded">
            My Profile
          </Link>
        </>
      )}
      {role === "farmer" && (
        <>
          <Link to="/farmer/appointments/new" className="block py-2 hover:bg-green-600 rounded">
            Book Appointment
          </Link>
        </>
      )}
      <>
        <Link to="/clinical-records" className="block py-2 hover:bg-green-600 rounded">
          Clinical Records
        </Link>
      </>

      {role === "vet" && (
        <Link to="/vet" className="block py-2 hover:bg-green-600 rounded">
          Cases
        </Link>
      )}
      {role === "vet" && (
        <Link to="/vet/appointments" className="block py-2 hover:bg-green-600 rounded">
          Appointments
        </Link>
      )}
      {role === "vet" && (
        <Link to="/vet" className="block py-2 hover:bg-green-600 rounded">
          Dashboard
        </Link>
      )}

      {role === "agrovet" && (
        <Link to="/agrovet" className="block py-2 hover:bg-green-600 rounded">
          Products
        </Link>
        
      )}
      {role === "agrovet" && (
        <Link to="/agrovet" className="block py-2 hover:bg-green-600 rounded">
          Dashboard
        </Link>
        
      )}


      <div className="border-t border-green-600 pt-4 mt-4">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded text-white font-medium"
        >
          Logout
        </button>
      </div>
      
      
    </aside>
  );
}

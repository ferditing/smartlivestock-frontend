import { Link } from "react-router-dom";

export default function Sidebar({ role }: { role: string }) {
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
      
    </aside>
  );
}

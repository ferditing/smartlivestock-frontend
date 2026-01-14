import { Link } from "react-router-dom";

export default function Sidebar({ role }: { role: string }) {
  return (
    <aside className="w-64 bg-green-700 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">SmartLivestock</h2>

      {role === "farmer" && (
        <>
          <Link to="/farmer" className="block py-2 hover:bg-green-600 rounded">
            Dashboard
          </Link>
        </>
      )}

      {role === "vet" && (
        <Link to="/vet" className="block py-2 hover:bg-green-600 rounded">
          Cases
        </Link>
      )}

      {role === "agro" && (
        <Link to="/agro" className="block py-2 hover:bg-green-600 rounded">
          Products
        </Link>
      )}
    </aside>
  );
}

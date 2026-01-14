export default function Navbar() {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="bg-white shadow px-6 py-3 flex justify-between">
      <h1 className="font-bold">SmartLivestock</h1>
      <button
        onClick={logout}
        className="text-red-600 font-semibold"
      >
        Logout
      </button>
    </div>
  );
}

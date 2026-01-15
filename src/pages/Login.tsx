import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    try {
      console.log("login payload", { email, password });
      const res = await api.post("/auth/login", { email, password });
      const token = res.data?.token;
      const role = res.data?.role ?? res.data?.user?.role;

      if (token) localStorage.setItem("token", token);
      if (role) localStorage.setItem("role", role);

      if (role) navigate(`/${role}`);
      else {
        console.warn('Login succeeded but no role returned', res.data);
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || err?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="border p-2 w-full mb-4"
          placeholder="Password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}

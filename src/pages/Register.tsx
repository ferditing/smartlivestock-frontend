import { useState } from "react";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState<any>({});

  const submit = async () => {
    await api.post("/auth/register", form);
    alert("Registered successfully");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">Register</h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="border p-2 w-full mb-2"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <select
          className="border p-2 w-full mb-2"
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="">Select role</option>
          <option value="farmer">Farmer</option>
          <option value="vet">Vet</option>
          <option value="agro">Agro-vet</option>
        </select>
        <input
          type="password"
          className="border p-2 w-full mb-4"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={submit}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Register
        </button>
      </div>
    </div>
  );
}

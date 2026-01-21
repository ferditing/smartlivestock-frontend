import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import rawKenyaData from "../data/kenya_locations.json";

type LocationState = {
  lat?: number;
  lng?: number;
  county?: string;
  sub_county?: string;
  locality?: string;
};

export default function Register() {
  const navigate = useNavigate();
  const kenyaData: Record<string, string[]> = rawKenyaData;


  const [form, setForm] = useState<any>({});
  const [location, setLocation] = useState<LocationState>({});
  const [gpsTried, setGpsTried] = useState(false);

  // 🔁 Try GPS only for vet/agrovet
  useEffect(() => {
    if (form.role === "vet" || form.role === "agrovet") {
      detectLocation();
    }
  }, [form.role]);

  const detectLocation = () => {
    if (!navigator.geolocation || gpsTried) return;
    setGpsTried(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setLocation((prev) => ({ ...prev, lat, lng }));

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          const addr = data.address || {};

          setLocation((prev) => ({
            ...prev,
            county: addr.county,
            sub_county: addr.state_district,
            locality: addr.village || addr.town || addr.suburb,
          }));
        } catch {
          // Silent fail → dropdown fallback
        }
      },
      () => {
        // GPS failed → fallback UI will handle
      }
    );
  };

  const submit = async () => {
    try {
      await api.post("/auth/register", {
        ...form,
        location,
      });

      alert("Registered successfully");
      navigate("/login");
    } catch (err: any) {
      alert(err?.response?.data?.error || "Registration failed");
    }
  };

  const showLocationFallback =
    form.role === "vet" || form.role === "agrovet";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
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

        <input
          className="border p-2 w-full mb-2"
          placeholder="Phone"
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <select
          className="border p-2 w-full mb-2"
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="">Select role</option>
          <option value="farmer">Farmer</option>
          <option value="vet">Vet</option>
          <option value="agrovet">Agro-vet</option>
        </select>

        {showLocationFallback && (
          <>
            <select
              className="border p-2 w-full mb-2"
              value={location.county || ""}
              onChange={(e) =>
                setLocation({ ...location, county: e.target.value })
              }
            >
              <option value="">Select County</option>
              {Object.keys(kenyaData).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              className="border p-2 w-full mb-2"
              disabled={!location.county}
              value={location.sub_county || ""}
              onChange={(e) =>
                setLocation({ ...location, sub_county: e.target.value })
              }
            >
              <option value="">Select Sub-county</option>
              {location.county && kenyaData[location.county] &&
                kenyaData[location.county].map((sc: string) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
            </select>

            <input
              className="border p-2 w-full mb-2"
              placeholder="Locality (village / estate)"
              value={location.locality || ""}
              onChange={(e) =>
                setLocation({ ...location, locality: e.target.value })
              }
            />
          </>
        )}

        <input
          type="password"
          className="border p-2 w-full mb-4"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={submit}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Register
        </button>

        <p className="text-sm mt-4 text-center">
          Already have an account?{" "}
          <Link className="text-blue-600 underline" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

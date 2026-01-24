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
  const [gpsStatus, setGpsStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");

  // 🔁 Try GPS only for vet/agrovet
  useEffect(() => {
    if (form.role === "vet" || form.role === "agrovet") {
      // don't auto-request if user hasn't interacted — show button instead
      // but if earlier attempt failed, keep status
      if (gpsStatus === "granted") detectLocation();
    }
  }, [form.role]);

  const detectLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported in your browser');
    if (gpsTried) return;
    setGpsTried(true);
    setGpsStatus('requesting');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setLocation((prev) => ({ ...prev, lat, lng }));
        setGpsStatus('granted');

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&accept-language=en`
          );
          const data = await res.json();
          const addr = data.address || {};

          // helpful debug when mapping fails
          console.debug('nominatim reverse', data);

          // normalize and attempt to match to kenyaData keys
          const norm = (s?: string) => (s || "").toLowerCase().replace(/\s+county$/i, '').replace(/\s+/g, ' ').trim();
          const addrCountyRaw = addr.county || addr.region || addr.state || addr.county_district || '';
          const addrSubRaw = addr.state_district || addr.county_district || addr.suburb || addr.town || addr.village || '';

          const countyMatch = Object.keys(kenyaData).find(k => {
            const nk = norm(k);
            const na = norm(addrCountyRaw);
            return nk === na || nk.includes(na) || na.includes(nk);
          });

          let chosenCounty = countyMatch || (addrCountyRaw ? addrCountyRaw.replace(/\s*County$/i, '').trim() : undefined);

          // try to match sub-county within chosen county
          let chosenSub: string | undefined = undefined;
          if (chosenCounty && kenyaData[chosenCounty]) {
            const subs = kenyaData[chosenCounty];
            const matchedSub = subs.find(s => {
              const ns = norm(s);
              const na = norm(addrSubRaw);
              return ns === na || ns.includes(na) || na.includes(ns);
            });
            chosenSub = matchedSub || undefined;
          }

          setLocation((prev) => ({
            ...prev,
            county: chosenCounty || prev.county,
            sub_county: chosenSub || prev.sub_county || (addrSubRaw || undefined),
            locality: addr.village || addr.town || addr.suburb || addr.hamlet || prev.locality,
          }));
        } catch (err) {
          console.warn('reverse geocode failed', err);
          // Silent fail → dropdown fallback
        }
      },
      (err) => {
        setGpsStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
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
          onChange={(e) => {
            const role = e.target.value;
            setForm({ ...form, role });
            // auto-prompt for high-accuracy GPS when registering as a provider
            if (role === 'vet' || role === 'agrovet') {
              // reset so detectLocation will prompt
              setGpsTried(false);
              detectLocation();
            }
          }}
        >
          <option value="">Select role</option>
          <option value="farmer">Farmer</option>
          <option value="vet">Vet</option>
          <option value="agrovet">Agro-vet</option>
        </select>
        {showLocationFallback && (
          <>
            <div className="mb-2">
              <button
                type="button"
                className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                onClick={() => {
                  setGpsTried(false);
                  detectLocation();
                }}
              >
                Use my current location
              </button>

              {gpsStatus === 'requesting' && <span className="text-sm text-gray-600 ml-2">Requesting location…</span>}
              {gpsStatus === 'granted' && <span className="text-sm text-green-600 ml-2">Location found</span>}
              {gpsStatus === 'denied' && <span className="text-sm text-red-600 ml-2">Location permission denied — choose from dropdown</span>}
            </div>

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

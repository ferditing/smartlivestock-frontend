import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchNearbyServices } from "../../api/farmer.api";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type Provider = {
  id: number;
  name: string;
  provider_type: "vet" | "agrovet";
  lat: number;
  lng: number;
  distance_m: number;
};

export default function NearbyServicesMap() {
  const navigate = useNavigate();
  const [pos, setPos] = useState<LatLngExpression | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const coords: LatLngExpression = [
          p.coords.latitude,
          p.coords.longitude,
        ];

        setPos(coords);

        const data = await fetchNearbyServices(
          p.coords.latitude,
          p.coords.longitude
        );

        setProviders(data);
      },
      () => {
        setError("Unable to access location");
      }
    );
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!pos) return <p>Loading nearby services…</p>;

  return (
    <MapContainer center={pos} zoom={13} className="h-[400px] rounded">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Farmer location marker */}
      <Marker position={pos}>
        <Popup>Your location</Popup>
      </Marker>

      {/* Provider markers */}
      {providers
        .filter((p) => p.lat != null && p.lng != null)
        .map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <b>{p.name}</b><br />
              Type: {p.provider_type}<br />
              Distance: {(p.distance_m / 1000).toFixed(1)} km
              <br />
              <button
                className="text-blue-600 underline mt-2"
                onClick={() => navigate(`/providers/${p.id}`)}
              >
                View Products
              </button>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}

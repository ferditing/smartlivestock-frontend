import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { fetchNearbyServices } from "../../api/farmer.api";
import type { LatLngExpression } from "leaflet";

export default function NearbyServicesMap() {
  const [pos, setPos] = useState<LatLngExpression | null>(null);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((p) => {
      const coords: LatLngExpression = [
        p.coords.latitude,
        p.coords.longitude,
      ];
      setPos(coords);
      fetchNearbyServices(coords[0], coords[1]).then(setServices);
    });
  }, []);

  if (!pos) return <p>Loading map…</p>;

  return (
    <MapContainer center={pos} zoom={13} className="h-[400px] rounded">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={pos}>
        <Popup>Your Location</Popup>
      </Marker>
      {services.map((s) => (
        <Marker key={s.id} position={[s.lat, s.lng]}>
          <Popup>
            <b>{s.name}</b><br />
            {s.role}<br />
            {s.phone}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

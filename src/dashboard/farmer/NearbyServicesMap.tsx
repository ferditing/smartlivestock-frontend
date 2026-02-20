import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchNearbyServices } from "../../api/farmer.api";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

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

// filter state type for the UI
type ProviderType = "all" | "vet" | "agrovet";

function ClusterLayer({ providers, onNavigate, role }: { providers: Provider[]; onNavigate: (id: number, action?: string) => void; role: string | null; }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const group = (L as any).markerClusterGroup();

    // Count identical/near-identical coordinates so we can spread them out slightly
    const coordCounts = new Map<string, number>();
    const keyFor = (lat: number, lng: number) => `${lat.toFixed(6)}_${lng.toFixed(6)}`;
    providers
      .filter((p) => p.lat != null && p.lng != null)
      .forEach((p) => {
        const key = keyFor(p.lat, p.lng);
        coordCounts.set(key, (coordCounts.get(key) || 0) + 1);
      });

    const seen = new Map<string, number>();

    providers
      .filter((p) => p.lat != null && p.lng != null)
      .forEach((p) => {
        const key = keyFor(p.lat, p.lng);
        const total = coordCounts.get(key) || 1;
        const index = seen.get(key) || 0;
        seen.set(key, index + 1);

        let lat = p.lat;
        let lng = p.lng;

        if (total > 1) {
          // Spread markers in a small circle (meters -> degrees conversion)
          const radiusMeters = 10 + (index * 6); // 10m base, step a few meters
          const angle = (index / total) * Math.PI * 2;
          const metersToDegLat = 1 / 111320; // approx
          const metersToDegLng = 1 / (111320 * Math.cos((p.lat * Math.PI) / 180));
          lat = p.lat + Math.cos(angle) * radiusMeters * metersToDegLat;
          lng = p.lng + Math.sin(angle) * radiusMeters * metersToDegLng;
        }

        const marker = L.marker([lat, lng]);
        const roleStr = role ? String(role).toLowerCase() : "";
        const isProviderVet = p.provider_type === 'vet';
        const linkText = isProviderVet ? 'Book Appointment' : 'View Products';
        const action = isProviderVet ? 'book' : 'view';
        const popupHtml = `
          <div>
            <b>${p.name}</b><br/>
            Type: ${p.provider_type}<br/>
            Distance: ${(p.distance_m / 1000).toFixed(1)} km<br/>
            <a href="#" data-provider-id="${p.id}" data-action="${action}" style="color:#2563eb;text-decoration:underline;">${linkText}</a>
          </div>
        `;
        // keep popup open until user closes it; open via click
        marker.bindPopup(popupHtml, { autoClose: true, closeOnClick: false, closeButton: true });
        marker.bindTooltip(p.name, { direction: 'top', offset: [0, -10] });

        // open popup on marker click (instead of immediate navigation)
        marker.on('click', () => marker.openPopup());

        // attach click handler to the popup using delegation to be robust
        marker.on('popupopen', () => {
          try {
            const popupEl = marker.getPopup()?.getElement();
            if (!popupEl) return;

            const delegatedHandler = (ev: Event) => {
              const target = ev.target as HTMLElement | null;
              if (!target) return;
              const link = target.closest('a[data-provider-id]') as HTMLAnchorElement | null;
              if (!link) return;
              ev.preventDefault();
              const idAttr = link.getAttribute('data-provider-id');
              const actionAttr = link.getAttribute('data-action');
              const idNum = idAttr ? Number(idAttr) : p.id;
              onNavigate(idNum, actionAttr || undefined);
            };

            popupEl.addEventListener('click', delegatedHandler);
            // remove listener when popup closes to avoid leaks
            const removeOnClose = () => {
              try { popupEl.removeEventListener('click', delegatedHandler); } catch (e) {}
            };
            marker.once('popupclose', removeOnClose);
          } catch (e) {}
        });
        group.addLayer(marker);
      });

    map.addLayer(group);

    return () => {
      try { map.removeLayer(group); } catch (e) {}
    };
  }, [map, providers]);

  return null;
}

export default function NearbyServicesMap() {
  const navigate = useNavigate();
  const [pos, setPos] = useState<LatLngExpression | null>(null);
  const [filterType, setFilterType] = useState<ProviderType>("all");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [error, setError] = useState<string | null>(null);
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;

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

        const data = await fetchNearbyServices(p.coords.latitude, p.coords.longitude);
        setProviders(data);
      },
      () => {
        setError("Unable to access location");
      }
    );
  }, []);
  // Filter providers based on state
  const filteredProviders = useMemo(() => {
    if (filterType === "all") return providers;
    return providers.filter((p) => p.provider_type === filterType);
  }, [providers, filterType]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!pos) return <p>Loading nearby services…</p>;

  return (
    <>
     {/* Filter controls */}
     <div className="flex flex-wrap gap-2 mb-4 px-4 sm:px-0">
      {
        (["all", "vet", "agrovet"] as ProviderType[]).map((type) => (
          <button
           key={type}
           onClick={() => setFilterType(type)}
           className={`px-4 py-1 rounded-full border text-sm capitalize transition-colors ${
            filterType === type
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
           }`}
          >
            {type === "all" ? "All" : type === "vet" ? "Vets" : "Agrovets"}
          </button>
        ))
      }
     </div>
      <MapContainer center={pos} zoom={13} className="h-[300px] sm:h-[400px] rounded-b overflow-hidden" style={{ minHeight: 280 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Farmer location marker */}
        <Marker position={pos}>
          <Popup>Your location</Popup>
        </Marker>

        {/* Provider markers (clustered via leaflet.markercluster) */}
        <ClusterLayer
          providers={filteredProviders}
          role={role}
          onNavigate={(id, action) => {
            const roleStr = role ? String(role).toLowerCase() : "";
            if (action === 'book') {
              if (roleStr === 'farmer') {
                navigate(`/farmer/appointments/new?provider=${id}`);
                return;
              }
              if (roleStr === 'vet') {
                navigate(`/vet/appointments/new?provider=${id}`);
                return;
              }
              // fallback: providers and other roles go to provider details
              navigate(`/providers/${id}`);
              return;
            }
            // default view products
            navigate(`/providers/${id}`);
          }}
        />
      </MapContainer>

      {/* Provider list beneath the map */}
      <div className="mt-4 px-4 sm:px-0 pb-2">
        <h3 className="text-lg font-semibold mb-2">Nearby Providers ({filteredProviders.length})</h3>
        <ul className="space-y-2 max-h-40 sm:max-h-48 overflow-auto">
          {filteredProviders.map((p) => (
            <li key={p.id} className="p-2 border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-600">{p.provider_type} • {(p.distance_m/1000).toFixed(2)} km</div>
              </div>
              <div>
                {p.provider_type === 'vet' && (
                  <button className="text-blue-600 underline" onClick={() => navigate(`/farmer/appointments/new?provider=${p.id}`)}>Book Appointment</button>
                )}
                {p.provider_type === 'agrovet' && (
                  <button className="text-blue-600 underline" onClick={() => navigate(`/providers/${p.id}`)}>View</button>
                )}
              </div>
            </li>
          ))}
          {filteredProviders.length === 0 && (
            <p className="text-gray-500 italic">No {filterType}s found in your area. </p>
          )}
        </ul>
      </div>
    </>
  );
}

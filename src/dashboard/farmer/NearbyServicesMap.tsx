// NearbyServicesMap.tsx – Premium Redesign (SmartLivestock Design System)
// All original geolocation, API, Leaflet, cluster and navigation logic unchanged.

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchNearbyServices } from "../../api/farmer.api";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon   from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  MapPin, Stethoscope, Store, Loader2, AlertCircle,
  Navigation, Calendar, ShoppingBag,
} from "lucide-react";

delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl:markerIcon2x, iconUrl:markerIcon, shadowUrl:markerShadow });

type Provider = {
  id: number; name: string; provider_type:"vet"|"agrovet"; lat: number; lng: number; distance_m: number;
};
type ProviderType = "all"|"vet"|"agrovet";

/* ── Cluster layer (UNCHANGED from original) ─────────────────── */
function ClusterLayer({ providers, onNavigate }: { providers:Provider[]; onNavigate:(id:number, action?:string)=>void }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const group = (L as any).markerClusterGroup();
    const coordCounts = new Map<string, number>();
    const keyFor = (lat:number, lng:number) => `${lat.toFixed(6)}_${lng.toFixed(6)}`;
    providers.filter(p => p.lat != null && p.lng != null).forEach(p => {
      const key = keyFor(p.lat, p.lng);
      coordCounts.set(key, (coordCounts.get(key) || 0) + 1);
    });
    const seen = new Map<string, number>();
    providers.filter(p => p.lat != null && p.lng != null).forEach(p => {
      const key = keyFor(p.lat, p.lng);
      const total = coordCounts.get(key) || 1;
      const index = seen.get(key) || 0;
      seen.set(key, index + 1);
      let lat = p.lat, lng = p.lng;
      if (total > 1) {
        const radiusMeters = 10 + index * 6;
        const angle = (index / total) * Math.PI * 2;
        const mToDegLat = 1 / 111320;
        const mToDegLng = 1 / (111320 * Math.cos((p.lat * Math.PI) / 180));
        lat = p.lat + Math.cos(angle) * radiusMeters * mToDegLat;
        lng = p.lng + Math.sin(angle) * radiusMeters * mToDegLng;
      }
      const marker = L.marker([lat, lng]);
      const isVet = p.provider_type === "vet";
      const linkText = isVet ? "Book Appointment" : "View Products";
      const action   = isVet ? "book" : "view";
      const popupHtml = `<div><b>${p.name}</b><br/>Type: ${p.provider_type}<br/>Distance: ${(p.distance_m/1000).toFixed(1)} km<br/><span data-provider-id="${p.id}" data-action="${action}" role="button" tabindex="0" style="color:#16a34a;text-decoration:underline;cursor:pointer;">${linkText}</span></div>`;
      marker.bindPopup(popupHtml, { autoClose:true, closeOnClick:false, closeButton:true });
      marker.bindTooltip(p.name, { direction:"top", offset:[0,-10] });
      marker.on("click", () => marker.openPopup());
      marker.on("popupopen", () => {
        try {
          const popupEl = marker.getPopup()?.getElement();
          if (!popupEl) return;
          const handler = (ev:Event) => {
            const el = (ev.target as HTMLElement)?.closest("[data-provider-id]") as HTMLElement | null;
            if (!el) return;
            ev.preventDefault(); ev.stopPropagation();
            const idAttr = el.getAttribute("data-provider-id");
            const actionAttr = el.getAttribute("data-action");
            const idNum = idAttr ? Number(idAttr) : p.id;
            if (!Number.isNaN(idNum)) onNavigate(idNum, actionAttr || undefined);
          };
          popupEl.addEventListener("click", handler);
          marker.once("popupclose", () => { try { popupEl.removeEventListener("click", handler); } catch {} });
        } catch {}
      });
      group.addLayer(marker);
    });
    map.addLayer(group);
    return () => { try { map.removeLayer(group); } catch {} };
  }, [map, providers]);
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function NearbyServicesMap() {
  const navigate = useNavigate();
  const [pos,        setPos]        = useState<LatLngExpression | null>(null);
  const [filterType, setFilterType] = useState<ProviderType>("all");
  const [providers,  setProviders]  = useState<Provider[]>([]);
  const [error,      setError]      = useState<string | null>(null);
  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;

  useEffect(() => {
    if (!navigator.geolocation) { setError("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      async p => {
        const coords: LatLngExpression = [p.coords.latitude, p.coords.longitude];
        setPos(coords);
        const data = await fetchNearbyServices(p.coords.latitude, p.coords.longitude);
        setProviders(data);
      },
      () => setError("Unable to access location")
    );
  }, []);

  const filteredProviders = useMemo(() =>
    filterType === "all" ? providers : providers.filter(p => p.provider_type === filterType),
    [providers, filterType]
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center px-4">
      <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-900">Location Error</h3>
        <p className="text-xs text-red-600 mt-1">{error}</p>
      </div>
    </div>
  );

  if (!pos) return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
        <Navigation className="w-5 h-5 text-blue-500 animate-pulse" />
      </div>
      <p className="text-sm font-semibold text-gray-500">Getting your location…</p>
    </div>
  );

  const vetsCount     = providers.filter(p => p.provider_type === "vet").length;
  const agrovetCount  = providers.filter(p => p.provider_type === "agrovet").length;

  return (
    <div className="space-y-4">
      {/* ── Filter chips ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="filter-bar flex-1">
          {(["all","vet","agrovet"] as ProviderType[]).map(type => (
            <button key={type} type="button" onClick={() => setFilterType(type)}
              className={`filter-chip ${filterType === type
                ? type === "all" ? "active" : type === "vet" ? "active-blue" : "active"
                : ""}`}>
              {type === "all" ? "All Providers" : type === "vet" ? "Vets" : "Agrovets"}
              <span className="ml-1 bg-white/60 text-current text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {type === "all" ? providers.length : type === "vet" ? vetsCount : agrovetCount}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 flex-shrink-0">
          <MapPin className="w-3.5 h-3.5 text-green-600" />
          <span className="text-xs font-semibold text-gray-600">{filteredProviders.length} nearby</span>
        </div>
      </div>

      {/* ── Leaflet map ── */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        <MapContainer center={pos} zoom={13}
          className="h-[300px] sm:h-[380px] w-full"
          style={{ minHeight:280 }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={pos}>
            <Popup><strong>Your location</strong></Popup>
          </Marker>
          <ClusterLayer
            providers={filteredProviders}
            onNavigate={(id, action) => {
              const roleStr = role ? String(role).toLowerCase() : "";
              if (action === "book") {
                if (roleStr === "farmer") { navigate(`/farmer/appointments/new?provider=${id}`); return; }
                if (roleStr === "vet")    { navigate(`/vet/appointments/new?provider=${id}`); return; }
                navigate(`/providers/${id}`); return;
              }
              if (roleStr === "farmer") { navigate(`/farmer/providers/${id}`); return; }
              navigate(`/providers/${id}`);
            }}
          />
        </MapContainer>
      </div>

      {/* ── Provider list ── */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3">
          Nearby Providers <span className="text-gray-400 font-normal">({filteredProviders.length})</span>
        </h3>
        {filteredProviders.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-3 text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-xs font-semibold text-gray-400">
              No {filterType === "all" ? "providers" : filterType + "s"} found in your area
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {filteredProviders.map(p => {
              const isVet = p.provider_type === "vet";
              const distKm = (p.distance_m / 1000).toFixed(2);
              return (
                <div key={p.id}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl hover:border-green-200 hover:shadow-sm transition group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isVet ? "bg-blue-50" : "bg-green-50"
                  }`}>
                    {isVet
                      ? <Stethoscope className="w-5 h-5 text-blue-600" />
                      : <Store className="w-5 h-5 text-green-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{p.name}</h4>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {distKm} km away
                      <span className={`ml-1.5 text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                        isVet ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>{p.provider_type}</span>
                    </p>
                  </div>
                  {isVet ? (
                    <button type="button"
                      onClick={() => navigate(`/farmer/appointments/new?provider=${p.id}`)}
                      className="btn btn-primary btn-xs flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3 h-3" /> Book
                    </button>
                  ) : (
                    <button type="button"
                      onClick={() => navigate(`/farmer/providers/${p.id}`)}
                      className="btn btn-outline btn-xs flex items-center gap-1 flex-shrink-0">
                      <ShoppingBag className="w-3 h-3" /> View
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
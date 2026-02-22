import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import ProductCatalog from "../dashboard/agro/ProductCatalog";
import { Store, MapPin, Phone, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "../context/ToastContext";

type ProviderData = {
  id: number;
  name: string;
  provider_type: "vet" | "agrovet";
  contact?: string;
  lat?: number;
  lng?: number;
  product_count?: number;
};

export default function ProviderProducts() {
  const { id } = useParams();
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { addToast } = useToast();
  const userRole = localStorage.getItem('role') || 'farmer';

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Fetch provider data
  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/providers/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        setProvider(response.data);

        // Calculate distance if we have user location and provider location
        if (userLocation && response.data.lat && response.data.lng) {
          const dist = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            response.data.lat,
            response.data.lng
          );
          setDistance(dist);
        }
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || 'Failed to load provider details';
        setError(errorMsg);
        addToast('error', 'Error', errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProvider();
    }
  }, [id, userLocation, addToast]);

  // Haversine formula to calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  if (loading) {
    return (
      <Layout role={userRole}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading provider details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !provider) {
    return (
      <Layout role={userRole}>
        <div className="card p-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Provider</h3>
            <p className="text-gray-600">{error || 'Provider not found'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role={userRole}>
      <div className="space-y-6">
        {/* Provider Header */}
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{provider.name}</h1>
                  <p className="text-green-100">
                    {provider.provider_type === 'vet' ? 'Veterinary Clinic' : 'Agrovet Supplier'} 
                    {distance > 0 && ` • ${distance} km away`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium">
                  {provider.product_count} products
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {provider.contact && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium text-gray-900">{provider.contact}</p>
                  </div>
                </div>
              )}
              {provider.lat && provider.lng && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{provider.lat.toFixed(4)}, {provider.lng.toFixed(4)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Available Products</h2>
              <p className="text-gray-600 mt-1">Browse products from this supplier</p>
            </div>
          </div>

          <ProductCatalog providerId={Number(id)} />
        </div>

        {/* Action Buttons */}
        <div className="card">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row gap-3">
              {provider.contact && (
                <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  {provider.contact}
                </button>
              )}
              <button className="btn-outline flex-1 flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                Get Directions
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
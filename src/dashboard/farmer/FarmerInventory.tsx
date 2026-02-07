// FarmerInventory.tsx - Updated
import { useEffect, useState } from "react";
import Layout from '../../components/Layout';
import { fetchMyAnimals, createAnimal } from "../../api/animals.api";
import { useToast } from "../../context/ToastContext";
import {
  Plus,
  Edit2,
  Trash2,
  PawPrint,
  Tag,
  Scale,
  Calendar,
  Loader2
} from "lucide-react";

export default function FarmerInventory() {
  const userRole = localStorage.getItem('role') || 'farmer';
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    species: "", 
    breed: "", 
    age: "", 
    weight: "", 
    tag_id: "",
    description: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchMyAnimals();
      setAnimals(data || []);
    } catch (error) {
      addToast('error', 'Error', 'Failed to load animals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.species.trim()) {
      addToast('error', 'Validation Error', 'Species is required');
      return;
    }

    setSubmitting(true);
    try {
      await createAnimal({
        species: form.species,
        breed: form.breed || undefined,
        age: form.age ? Number(form.age) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        tag_id: form.tag_id || undefined,
        description: form.description || undefined,
      });
      
      addToast('success', 'Success', 'Animal added successfully');
      
      setForm({ species: "", breed: "", age: "", weight: "", tag_id: "", description: "" });
      setShowForm(false);
      await load();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 'Failed to add animal';
      addToast('error', 'Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getAnimalIcon = (species: string) => {
    const icons: Record<string, string> = {
      cow: "🐄",
      goat: "🐐",
      sheep: "🐑",
      pig: "🐖",
      chicken: "🐔",
      calf: "🐄",
    };
    return icons[species.toLowerCase()] || "🐾";
  };

  return (
    <Layout role={userRole}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Animals</h2>
          <p className="text-gray-600 mt-1">Manage your livestock inventory</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Animal
        </button>
      </div>

      {/* Add Animal Form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Add New Animal</h3>
          </div>
          <form onSubmit={submit} className="card-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Species *
                </label>
                <input
                  className="input-field"
                  placeholder="e.g., Cow, Goat, Sheep"
                  value={form.species}
                  onChange={(e) => setForm({...form, species: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Breed
                </label>
                <input
                  className="input-field"
                  placeholder="e.g., Friesian, Saanen"
                  value={form.breed}
                  onChange={(e) => setForm({...form, breed: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age (years)
                </label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="Enter age"
                  value={form.age}
                  onChange={(e) => setForm({...form, age: e.target.value})}
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="Enter weight"
                  value={form.weight}
                  onChange={(e) => setForm({...form, weight: e.target.value})}
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag ID
                </label>
                <input
                  className="input-field"
                  placeholder="Unique identification tag"
                  value={form.tag_id}
                  onChange={(e) => setForm({...form, tag_id: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="input-field min-h-[100px]"
                placeholder="Additional notes about this animal..."
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Animal
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Animals List */}
      {loading ? (
        <div className="card p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading animals...</span>
          </div>
        </div>
      ) : animals.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <PawPrint className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No animals recorded</h3>
            <p className="text-gray-500 mb-4">Add your first animal to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Animal
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {animals.map(a => (
            <div key={a.id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getAnimalIcon(a.species)}</div>
                    <div>
                      <h3 className="font-bold text-gray-900">{a.species}</h3>
                      {a.breed && (
                        <p className="text-sm text-gray-600">{a.breed}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1 text-gray-400 hover:text-green-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Animal Details */}
                <div className="space-y-3">
                  {a.reg_no && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Registration No.</p>
                        <p className="font-semibold text-green-700">{a.reg_no}</p>
                      </div>
                    </div>
                  )}
                  
                  {a.tag_id && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Tag ID</p>
                        <p className="font-medium text-gray-900">{a.tag_id}</p>
                      </div>
                    </div>
                  )}
                  
                  {a.age !== null && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Age</p>
                        <p className="font-medium text-gray-900">{a.age} years</p>
                      </div>
                    </div>
                  )}
                  
                  {a.weight !== null && (
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Weight</p>
                        <p className="font-medium text-gray-900">{a.weight} kg</p>
                      </div>
                    </div>
                  )}
                </div>

                {a.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{a.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {animals.length > 0 && (
        <div className="card">
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-gray-900">{animals.length}</div>
                <p className="text-sm text-gray-600">Total Animals</p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {animals.filter(a => a.age && a.age > 2).length}
                </div>
                <p className="text-sm text-gray-600">Mature</p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-gray-900">
                    {Number(animals.reduce((sum, a) => sum + (Number(a.weight) || 0), 0)).toFixed(0)}
                  </div>
                <p className="text-sm text-gray-600">Total Weight (kg)</p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {new Set(animals.map(a => a.species)).size}
                </div>
                <p className="text-sm text-gray-600">Species</p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
}
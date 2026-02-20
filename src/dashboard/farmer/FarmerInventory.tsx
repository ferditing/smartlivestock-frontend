// FarmerInventory.tsx - View/Edit modals, responsive layout
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from '../../components/Layout';
import { fetchMyAnimals, createAnimal, updateAnimal, deleteAnimal } from "../../api/animals.api";
import { useToast } from "../../context/ToastContext";
import {
  Plus,
  Edit2,
  Trash2,
  PawPrint,
  Tag,
  Scale,
  Calendar,
  Loader2,
  Eye,
  X,
  FileText
} from "lucide-react";

type Animal = {
  id: number;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
  tag_id?: string;
  reg_no?: string;
  description?: string;
  created_at?: string;
};

const emptyForm = {
  species: "",
  breed: "",
  age: "",
  weight: "",
  tag_id: "",
  description: "",
};

export default function FarmerInventory() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role') || 'farmer';
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewAnimal, setViewAnimal] = useState<Animal | null>(null);
  const [editAnimal, setEditAnimal] = useState<Animal | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Animal | null>(null);
  const [deleting, setDeleting] = useState(false);
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
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err: any) {
      addToast('error', 'Error', err?.response?.data?.error || 'Failed to add animal');
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAnimal || !form.species.trim()) return;
    setSubmitting(true);
    try {
      await updateAnimal(editAnimal.id, {
        species: form.species,
        breed: form.breed || undefined,
        age: form.age ? Number(form.age) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        tag_id: form.tag_id || undefined,
      });
      addToast('success', 'Success', 'Animal updated successfully');
      setEditAnimal(null);
      setForm(emptyForm);
      await load();
    } catch (err: any) {
      addToast('error', 'Error', err?.response?.data?.error || 'Failed to update animal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteAnimal(deleteConfirm.id);
      addToast('success', 'Deleted', 'Animal removed successfully');
      setDeleteConfirm(null);
      await load();
    } catch (err: any) {
      addToast('error', 'Error', err?.response?.data?.error || 'Failed to delete animal');
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (a: Animal) => {
    setEditAnimal(a);
    setForm({
      species: a.species || "",
      breed: a.breed || "",
      age: a.age != null ? String(a.age) : "",
      weight: a.weight != null ? String(a.weight) : "",
      tag_id: a.tag_id || "",
      description: a.description || "",
    });
  };

  const getAnimalIcon = (species: string) => {
    const icons: Record<string, string> = {
      cow: "🐄", goat: "🐐", sheep: "🐑", pig: "🐖", chicken: "🐔", calf: "🐄",
    };
    return icons[species?.toLowerCase()] || "🐾";
  };

  const ModalOverlay = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

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
            className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Species *</label>
                  <input
                    className="input-field w-full"
                    placeholder="e.g., Cow, Goat, Sheep"
                    value={form.species}
                    onChange={(e) => setForm({ ...form, species: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                  <input
                    className="input-field w-full"
                    placeholder="e.g., Friesian, Saanen"
                    value={form.breed}
                    onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age (years)</label>
                  <input
                    className="input-field w-full"
                    type="number"
                    placeholder="Enter age"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    className="input-field w-full"
                    type="number"
                    placeholder="Enter weight"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tag ID</label>
                  <input
                    className="input-field w-full"
                    placeholder="Unique identification tag"
                    value={form.tag_id}
                    onChange={(e) => setForm({ ...form, tag_id: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="input-field w-full min-h-[100px]"
                    placeholder="Additional notes..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Adding...</> : <><Plus className="w-4 h-4" />Add Animal</>}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Animals List - Responsive Grid */}
        {loading ? (
          <div className="card p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading animals...</span>
            </div>
          </div>
        ) : animals.length === 0 ? (
          <div className="card p-8 text-center">
            <PawPrint className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No animals recorded</h3>
            <p className="text-gray-500 mb-4">Add your first animal to get started</p>
            <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" />Add First Animal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {animals.map((a) => (
              <div key={a.id} className="card hover:shadow-lg transition-shadow duration-200 group">
                <div className="card-body">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      onClick={() => setViewAnimal(a)}
                    >
                      <div className="text-2xl flex-shrink-0">{getAnimalIcon(a.species)}</div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{a.species}</h3>
                        {a.breed && <p className="text-sm text-gray-600 truncate">{a.breed}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setViewAnimal(a)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(a); }}
                        className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(a); }}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {a.reg_no && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Registration</p>
                          <p className="font-semibold text-green-700 truncate">{a.reg_no}</p>
                        </div>
                      </div>
                    )}
                    {a.tag_id && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm text-gray-700 truncate">{a.tag_id}</p>
                      </div>
                    )}
                    {a.age != null && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{a.age} years</p>
                      </div>
                    )}
                    {a.weight != null && (
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{a.weight} kg</p>
                      </div>
                    )}
                  </div>
                  {a.description && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 line-clamp-2">{a.description}</p>
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
                  <div className="text-2xl font-bold text-gray-900">{animals.filter((a) => a.age != null && a.age > 2).length}</div>
                  <p className="text-sm text-gray-600">Mature</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-gray-900">{Number(animals.reduce((sum, a) => sum + (Number(a.weight) || 0), 0)).toFixed(0)}</div>
                  <p className="text-sm text-gray-600">Total Weight (kg)</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-gray-900">{new Set(animals.map((a) => a.species)).size}</div>
                  <p className="text-sm text-gray-600">Species</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewAnimal && (
        <ModalOverlay onClose={() => setViewAnimal(null)}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{getAnimalIcon(viewAnimal.species)}</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{viewAnimal.species}</h2>
                  {viewAnimal.breed && <p className="text-gray-600">{viewAnimal.breed}</p>}
                </div>
              </div>
              <button onClick={() => setViewAnimal(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {viewAnimal.reg_no && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Tag className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Registration No.</p>
                    <p className="font-semibold text-green-700">{viewAnimal.reg_no}</p>
                  </div>
                </div>
              )}
              {viewAnimal.tag_id && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Tag className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Tag ID</p>
                    <p className="font-medium text-gray-900">{viewAnimal.tag_id}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Age</p>
                    <p className="font-medium text-gray-900">{viewAnimal.age != null ? `${viewAnimal.age} years` : "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Scale className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Weight</p>
                    <p className="font-medium text-gray-900">{viewAnimal.weight != null ? `${viewAnimal.weight} kg` : "—"}</p>
                  </div>
                </div>
              </div>
              {viewAnimal.description && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p className="text-gray-700">{viewAnimal.description}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button onClick={() => { openEdit(viewAnimal); setViewAnimal(null); }} className="btn-outline flex-1 flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" />Edit
              </button>
              <button onClick={() => navigate(`/animals/${viewAnimal.id}/clinical-records/new`)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />Add Record
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Edit Modal */}
      {editAnimal && (
        <ModalOverlay onClose={() => { setEditAnimal(null); setForm(emptyForm); }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Animal</h2>
              <button onClick={() => { setEditAnimal(null); setForm(emptyForm); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Species *</label>
                  <input className="input-field w-full" value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                  <input className="input-field w-full" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age (years)</label>
                  <input className="input-field w-full" type="number" min="0" step="0.1" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input className="input-field w-full" type="number" min="0" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tag ID</label>
                  <input className="input-field w-full" value={form.tag_id} onChange={(e) => setForm({ ...form, tag_id: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Edit2 className="w-4 h-4" />Save</>}
                </button>
                <button type="button" onClick={() => { setEditAnimal(null); setForm(emptyForm); }} className="btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <ModalOverlay onClose={() => setDeleteConfirm(null)}>
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delete Animal?</h2>
              <p className="text-gray-600 mt-2">
                Are you sure you want to remove <strong>{deleteConfirm.species}</strong> {deleteConfirm.breed ? `(${deleteConfirm.breed})` : ""}? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="btn-primary flex-1 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2">
                {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting...</> : <><Trash2 className="w-4 h-4" />Delete</>}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </Layout>
  );
}

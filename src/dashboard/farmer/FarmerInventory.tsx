// FarmerInventory.tsx – Premium Redesign (SmartLivestock Design System)
// All original API logic, state, modals and validation unchanged.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { fetchMyAnimals, createAnimal, updateAnimal, deleteAnimal } from "../../api/animals.api";
import { useToast } from "../../context/ToastContext";
import {
  Plus, Edit2, Trash2, PawPrint, Tag, Scale,
  Calendar, Loader2, Eye, X, FileText, Search,
  ChevronRight,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────── */
type Animal = {
  id: number; species: string; breed?: string; age?: number;
  weight?: number; tag_id?: string; reg_no?: string;
  description?: string; created_at?: string;
};
const emptyForm = { species: "", breed: "", age: "", weight: "", tag_id: "", description: "" };

/* ── Helpers ─────────────────────────────────────────────────────  */
const SPECIES_EMOJI: Record<string, string> = {
  cow: "🐄", cattle: "🐄", goat: "🐐", sheep: "🐑",
  pig: "🐖", chicken: "🐔", calf: "🐄", donkey: "🫏",
};
const getEmoji = (species: string) =>
  SPECIES_EMOJI[species?.toLowerCase()] || "🐾";

const SPECIES_GRADIENT: Record<string, string> = {
  cow: "from-amber-400 to-amber-600",
  cattle: "from-amber-400 to-amber-600",
  goat: "from-teal-400 to-teal-600",
  sheep: "from-blue-400 to-blue-600",
  pig: "from-rose-400 to-rose-600",
  chicken: "from-orange-400 to-orange-600",
};
const getGrad = (species: string) =>
  SPECIES_GRADIENT[species?.toLowerCase()] || "from-green-500 to-green-700";

/* ── Modal overlay ────────────────────────────────────────────── */
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function FarmerInventory() {
  const navigate  = useNavigate();
  const userRole  = localStorage.getItem("role") || "farmer";
  const { addToast } = useToast();

  const [animals,       setAnimals]       = useState<Animal[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [form,          setForm]          = useState(emptyForm);
  const [submitting,    setSubmitting]    = useState(false);
  const [showForm,      setShowForm]      = useState(false);
  const [viewAnimal,    setViewAnimal]    = useState<Animal | null>(null);
  const [editAnimal,    setEditAnimal]    = useState<Animal | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Animal | null>(null);
  const [deleting,      setDeleting]      = useState(false);
  const [search,        setSearch]        = useState("");

  /* ── Load ── */
  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchMyAnimals();
      setAnimals(data || []);
    } catch {
      addToast("error", "Error", "Failed to load animals");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  /* ── Add ── */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.species.trim()) { addToast("error", "Validation", "Species is required"); return; }
    setSubmitting(true);
    try {
      await createAnimal({
        species: form.species, breed: form.breed || undefined,
        age: form.age ? Number(form.age) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        tag_id: form.tag_id || undefined, description: form.description || undefined,
      });
      addToast("success", "Added", "Animal added successfully");
      setForm(emptyForm); setShowForm(false); await load();
    } catch (err: any) {
      addToast("error", "Error", err?.response?.data?.error || "Failed to add animal");
    } finally { setSubmitting(false); }
  };

  /* ── Edit ── */
  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAnimal || !form.species.trim()) return;
    setSubmitting(true);
    try {
      await updateAnimal(editAnimal.id, {
        species: form.species, breed: form.breed || undefined,
        age: form.age ? Number(form.age) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        tag_id: form.tag_id || undefined,
      });
      addToast("success", "Updated", "Animal updated successfully");
      setEditAnimal(null); setForm(emptyForm); await load();
    } catch (err: any) {
      addToast("error", "Error", err?.response?.data?.error || "Failed to update animal");
    } finally { setSubmitting(false); }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteAnimal(deleteConfirm.id);
      addToast("success", "Deleted", "Animal removed");
      setDeleteConfirm(null); await load();
    } catch (err: any) {
      addToast("error", "Error", err?.response?.data?.error || "Failed to delete");
    } finally { setDeleting(false); }
  };

  const openEdit = (a: Animal) => {
    setEditAnimal(a);
    setForm({
      species: a.species || "", breed: a.breed || "",
      age: a.age != null ? String(a.age) : "",
      weight: a.weight != null ? String(a.weight) : "",
      tag_id: a.tag_id || "", description: a.description || "",
    });
  };

  /* ── Derived ── */
  const filtered = animals.filter(a =>
    !search ||
    a.species.toLowerCase().includes(search.toLowerCase()) ||
    (a.breed || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.tag_id || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalWeight = animals.reduce((s, a) => s + (Number(a.weight) || 0), 0);
  const speciesCount = new Set(animals.map(a => a.species)).size;

  /* ─────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────── */
  return (
    <Layout role={userRole}>
      <div className="space-y-6 animate-fadeInUp">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">My Animals</h1>
            <p className="page-sub">Manage your livestock inventory</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="btn btn-primary btn-md flex items-center gap-2 self-start">
            <Plus className="w-4 h-4" />
            {showForm ? "Cancel" : "Add Animal"}
          </button>
        </div>

        {/* ── Stat strip ── */}
        {animals.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label:"Total Animals", val: animals.length, color:"text-green-600", iconBg:"bg-green-100", icon:<PawPrint className="w-5 h-5 text-green-600"/> },
              { label:"Mature (2y+)",  val: animals.filter(a => (a.age ?? 0) > 2).length, color:"text-blue-600", iconBg:"bg-blue-100", icon:<Calendar className="w-5 h-5 text-blue-600"/> },
              { label:"Total Weight",  val: `${totalWeight.toFixed(0)} kg`, color:"text-amber-600", iconBg:"bg-amber-100", icon:<Scale className="w-5 h-5 text-amber-600"/> },
              { label:"Species",       val: speciesCount, color:"text-purple-600", iconBg:"bg-purple-100", icon:<Tag className="w-5 h-5 text-purple-600"/> },
            ].map(s => (
              <div key={s.label} className="card overflow-hidden">
                <div className="card-body py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{s.label}</p>
                    <p className={`text-2xl font-black sora mt-0.5 ${s.color}`}>{s.val}</p>
                  </div>
                  <div className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    {s.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Add Form ── */}
        {showForm && (
          <div className="card overflow-hidden animate-fadeIn">
            <div className="card-header">
              <div className="card-icon-header">
                <div className="card-icon-wrap card-icon-green">
                  <PawPrint className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 sora text-sm">Add New Animal</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Register a new animal to your inventory</p>
                </div>
              </div>
            </div>
            <form onSubmit={submit} className="card-body space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label:"Species *", key:"species", placeholder:"e.g. Cow, Goat, Sheep", type:"text", required:true },
                  { label:"Breed",     key:"breed",   placeholder:"e.g. Friesian, Saanen", type:"text", required:false },
                  { label:"Age (years)", key:"age", placeholder:"Enter age", type:"number", required:false },
                  { label:"Weight (kg)", key:"weight", placeholder:"Enter weight", type:"number", required:false },
                ].map(f => (
                  <div key={f.key}>
                    <label className="field-label">{f.label}</label>
                    <input className="input-field" type={f.type} placeholder={f.placeholder}
                      value={(form as any)[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      required={f.required} min={f.type === "number" ? 0 : undefined} step={f.type === "number" ? 0.1 : undefined} />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="field-label">Tag ID</label>
                  <input className="input-field" placeholder="Unique identification tag"
                    value={form.tag_id} onChange={e => setForm({ ...form, tag_id: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label">Description / Notes</label>
                  <textarea className="input-field min-h-[90px] resize-none" placeholder="Additional notes..."
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="btn btn-primary btn-md flex items-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {submitting ? "Adding…" : "Add Animal"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }}
                  className="btn btn-outline btn-md">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* ── Search bar ── */}
        {animals.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" className="input-field pl-10"
              placeholder="Search by species, breed, or tag ID…"
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* ── Animals Grid ── */}
        {loading ? (
          <div className="card overflow-hidden">
            <div className="card-body py-14 flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-400">Loading animals…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card overflow-hidden">
            <div className="card-body py-14 flex flex-col items-center text-center gap-4">
              <div className="text-5xl">🐾</div>
              <div>
                <h3 className="text-base font-bold text-gray-700">
                  {search ? "No animals match your search" : "No animals recorded"}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {search ? "Try a different search term" : "Add your first animal to get started"}
                </p>
              </div>
              {!search && (
                <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add First Animal
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(a => (
              <div key={a.id}
                className="card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer glow-card"
                onClick={() => setViewAnimal(a)}>
                {/* Top gradient banner */}
                <div className={`bg-gradient-to-r ${getGrad(a.species)} h-2`} />
                <div className="card-body">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getGrad(a.species)} flex items-center justify-center flex-shrink-0 text-2xl shadow-sm`}>
                        {getEmoji(a.species)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 sora truncate">{a.species}</h3>
                        {a.breed && <p className="text-xs text-gray-500 truncate">{a.breed}</p>}
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={e => e.stopPropagation()}>
                      <button onClick={() => setViewAnimal(a)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition">
                        <Eye className="w-4 h-4" /></button>
                      <button onClick={() => { openEdit(a); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition">
                        <Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteConfirm(a)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition">
                        <Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {/* Info pills */}
                  <div className="space-y-2">
                    {a.reg_no && (
                      <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
                        <Tag className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-green-500">Registration</p>
                          <p className="text-xs font-bold text-green-800 truncate">{a.reg_no}</p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      {a.age != null && (
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2.5 py-2">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400">Age</p>
                            <p className="text-xs font-semibold text-gray-900">{a.age}y</p>
                          </div>
                        </div>
                      )}
                      {a.weight != null && (
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2.5 py-2">
                          <Scale className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400">Weight</p>
                            <p className="text-xs font-semibold text-gray-900">{a.weight} kg</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {a.tag_id && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Tag className="w-3 h-3" />
                        <span className="truncate">{a.tag_id}</span>
                      </div>
                    )}
                  </div>

                  {a.description && (
                    <p className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500 line-clamp-2">
                      {a.description}
                    </p>
                  )}

                  {/* Footer CTA */}
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-end gap-1 text-xs font-semibold text-green-600 group-hover:text-green-700">
                    View details <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══ VIEW MODAL ══ */}
      {viewAnimal && (
        <ModalOverlay onClose={() => setViewAnimal(null)}>
          <div>
            <div className={`bg-gradient-to-r ${getGrad(viewAnimal.species)} p-6 rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getEmoji(viewAnimal.species)}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white sora">{viewAnimal.species}</h2>
                    {viewAnimal.breed && <p className="text-white/80 text-sm">{viewAnimal.breed}</p>}
                  </div>
                </div>
                <button onClick={() => setViewAnimal(null)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {viewAnimal.reg_no && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Tag className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-500">Registration No.</p>
                    <p className="font-bold text-green-800">{viewAnimal.reg_no}</p>
                  </div>
                </div>
              )}
              {viewAnimal.tag_id && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Tag className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tag ID</p>
                    <p className="font-semibold text-gray-900">{viewAnimal.tag_id}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Age</p>
                    <p className="font-semibold text-gray-900">{viewAnimal.age != null ? `${viewAnimal.age} yrs` : "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Scale className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Weight</p>
                    <p className="font-semibold text-gray-900">{viewAnimal.weight != null ? `${viewAnimal.weight} kg` : "—"}</p>
                  </div>
                </div>
              </div>
              {viewAnimal.description && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{viewAnimal.description}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 pb-6 flex gap-3 pt-2">
              <button onClick={() => { openEdit(viewAnimal); setViewAnimal(null); }}
                className="btn btn-outline btn-md flex-1 flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => navigate(`/animals/${viewAnimal.id}/clinical-records/new`)}
                className="btn btn-primary btn-md flex-1 flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" /> Add Record
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ══ EDIT MODAL ══ */}
      {editAnimal && (
        <ModalOverlay onClose={() => { setEditAnimal(null); setForm(emptyForm); }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 sora">Edit Animal</h2>
              </div>
              <button onClick={() => { setEditAnimal(null); setForm(emptyForm); }}
                className="p-2 hover:bg-gray-100 rounded-xl transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={submitEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label:"Species *", key:"species", type:"text", required:true },
                  { label:"Breed",     key:"breed",   type:"text", required:false },
                  { label:"Age (years)", key:"age",   type:"number", required:false },
                  { label:"Weight (kg)", key:"weight",type:"number", required:false },
                ].map(f => (
                  <div key={f.key}>
                    <label className="field-label">{f.label}</label>
                    <input className="input-field" type={f.type}
                      value={(form as any)[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      required={f.required} min={f.type === "number" ? 0 : undefined} step={f.type === "number" ? 0.1 : undefined} />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="field-label">Tag ID</label>
                  <input className="input-field" value={form.tag_id}
                    onChange={e => setForm({ ...form, tag_id: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="btn btn-primary btn-md flex-1 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
                  {submitting ? "Saving…" : "Save Changes"}
                </button>
                <button type="button" onClick={() => { setEditAnimal(null); setForm(emptyForm); }}
                  className="btn btn-outline btn-md">Cancel</button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* ══ DELETE CONFIRM MODAL ══ */}
      {deleteConfirm && (
        <ModalOverlay onClose={() => setDeleteConfirm(null)}>
          <div className="p-6">
            <div className="flex justify-end -mt-2 -mr-2 mb-2">
              <button onClick={() => setDeleteConfirm(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 sora">Delete Animal?</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Are you sure you want to remove <strong>{deleteConfirm.species}</strong>
                {deleteConfirm.breed ? ` (${deleteConfirm.breed})` : ""}? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="btn btn-outline btn-md flex-1">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="btn btn-danger btn-md flex-1 flex items-center justify-center gap-2">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </Layout>
  );
}
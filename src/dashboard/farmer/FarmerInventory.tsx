import { useEffect, useState } from "react";
import { fetchMyAnimals, createAnimal } from "../../api/animals.api";

export default function FarmerInventory() {
    const [animals, setAnimals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ species: "", breed: "", age: "", weight: "", tag_id: "" });

    const load = async () => {
        const data = await fetchMyAnimals();
        setAnimals(data || []);
    };

    useEffect(() => {
        load();
    },[]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.species) return alert('Species is required');
        setLoading(true);
        try{
            await createAnimal({
                species: form.species,
                breed: form.breed || undefined,
                age: form.age ? Number(form.age) : undefined,
                weight: form.weight ? Number(form.weight) : undefined,
                tag_id: form.tag_id || undefined,
            });
            setForm({ species: "", breed: "", age: "", weight: "", tag_id: "" });
            await load();
        }catch(err){
            alert('Failed to add animal');
        }finally{ setLoading(false); }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">My Animals</h2>

            <div className="bg-white p-4 rounded shadow mb-6">
                <h3 className="font-semibold mb-2">Add Animal</h3>
                <form onSubmit={submit} className="grid grid-cols-1 gap-2">
                    <input className="border p-2" placeholder="Species" value={form.species} onChange={e=>setForm({...form, species: e.target.value})} />
                    <input className="border p-2" placeholder="Breed" value={form.breed} onChange={e=>setForm({...form, breed: e.target.value})} />
                    <input className="border p-2" placeholder="Age (years)" type="number" value={form.age} onChange={e=>setForm({...form, age: e.target.value})} />
                    <input className="border p-2" placeholder="Weight (kg)" type="number" value={form.weight} onChange={e=>setForm({...form, weight: e.target.value})} />
                    <input className="border p-2" placeholder="Tag ID" value={form.tag_id} onChange={e=>setForm({...form, tag_id: e.target.value})} />
                    <div>
                        <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit" disabled={loading}>{loading? 'Saving...':'Add Animal'}</button>
                    </div>
                </form>
            </div>

            {animals.length === 0 ? (
                <p className="text-gray-500">No animals recorded yet.</p>
            ) : (
                <div>
                    {animals.map(a =>(
                        <div key={a.id} className="bg-white p-3 rounded shadow mb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <b className="text-lg">{a.species}</b>
                                    <div className="text-sm text-gray-600">
                                        {a.reg_no && <span className="font-semibold text-green-600">Reg No: {a.reg_no}</span>}
                                        {a.reg_no && (a.breed || a.tag_id) && ' • '}
                                        {a.breed && `Breed: ${a.breed}`}
                                        {a.breed && a.tag_id && ' • '}
                                        {a.tag_id && `Tag: ${a.tag_id}`}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-700 text-right">
                                    <div>Age: {a.age ?? '-' } yrs</div>
                                    <div>Weight: {a.weight ?? '-'} kg</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

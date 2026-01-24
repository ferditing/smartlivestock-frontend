import { useEffect, useState } from "react";
import api from "../api/axios";

type VetMeta = {
    license_number? : string;
    specialisation?: string;
    years_of_experience?: number;
    country?: string;
    sub_county?: string;
    locality?: string;
};

type User = {
    id: number;
    name: string;
    email: string;
    role: "vet";
    profile_meta: VetMeta;
};

export default function VetProfile(){
    const [user, setUser] = useState<User | null>(null);
    const [meta, setMeta] = useState<VetMeta>({});
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        api.get("/profile/me").then(res => {
            setUser(res.data);
            setMeta(res.data.profile_meta || {});
        });
    }, []);

    const save = async () => {
        await api.put("/profile/me", {profile_meta: meta});
        alert("Profile updated");
        setEditing(false);
    };

    if (!user) return <p>Loading...</p>

    return (
     <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-6 text-green-700">Veterinarian Profile</h2>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
         <div className="flex items-center justify-between">
            <div>
                <div className="text-lg font-semibold">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
            </div>
            <div>
                {!editing && (
                    <button onClick={() => setEditing(true)} className="text-green-600 underline">Edit Profile</button>
                )}
            </div>
         </div>

         {editing ? (
            <form className="grid grid-cols-1 gap-3">
            <input className="border p-2 rounded" placeholder="License Number" value={meta.license_number || ""} onChange={e => setMeta({...meta, license_number: e.target.value})} />
            <input className="border p-2 rounded" placeholder="Specialisation" value={meta.specialisation || ""} onChange={e => setMeta({...meta, specialisation: e.target.value})} />
            <input className="border p-2 rounded" type="number" placeholder="Years of Experience" value={meta.years_of_experience || ""} onChange={e => setMeta({...meta, years_of_experience: parseInt(e.target.value) || 0})} />
            <input className="border p-2 rounded" placeholder="Country" value={meta.country || ""} onChange={e => setMeta({...meta, country: e.target.value})} />
            <input className="border p-2 rounded" placeholder="Sub County" value={meta.sub_county || ""} onChange={e=> setMeta({...meta, sub_county: e.target.value})} />
            <input className="border p-2 rounded" placeholder="Locality" value={meta.locality || ""} onChange={e => setMeta({...meta, locality: e.target.value})} />
            <div className="flex gap-2">
                <button onClick={save} type="button" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                <button onClick={() => setEditing(false)} type="button" className="px-4 py-2 rounded border">Cancel</button>
            </div>
            </form>
         ) : (
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="text-sm text-gray-500">Licence</div>
                    <div className="font-medium">{meta.license_number || '-'}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-500">Specialisation</div>
                    <div className="font-medium">{meta.specialisation || '-'}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-500">Years</div>
                    <div className="font-medium">{meta.years_of_experience || '-'}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-500">Country</div>
                    <div className="font-medium">{meta.country || '-'}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-500">Sub-County</div>
                    <div className="font-medium">{meta.sub_county || '-'}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-500">Locality</div>
                    <div className="font-medium">{meta.locality || '-'}</div>
                </div>
            </div>
         )}
        </div>
     </div>
    );
}

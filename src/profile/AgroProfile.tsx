import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";

type AgroMeta = {
    shop_name?: string;
    phone?: string;
    county?: string;
    sub_county?: string;
    locality?: string;
};
type User = {
    id: number;
    name: string;
    email: string;
    role: "agrovet";
    profile_meta: AgroMeta;
}

export default function AgroProfile(){
    const [user, setUser] = useState<User | null>(null);
    const [meta, setMeta] = useState<AgroMeta>({});
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        api.get("/profile/me").then(res=> {
            setUser(res.data);
            setMeta(res.data.profile_meta || {});
        });
    }, []);

    const save = async () => {
        await api.put("/profile/me", {profile_meta: meta});
        alert("Profile updated");
        setEditing(false);
    };

    if (!user) return <p>Loading...</p>;

    return (
        <Layout role= "agrovet">
            <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-6 text-green-700">Agrovet Profile</h2>

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
                        <input className="border p-2 rounded" placeholder="Shop Name" value={meta.shop_name || ""} onChange={e => setMeta({...meta, shop_name:e.target.value})} />
                        <input className="border p-2 rounded" placeholder="Phone" value={meta.phone || ""} onChange={e => setMeta({...meta, phone:e.target.value})} />
                        <input className="border p-2 rounded" placeholder="County" value={meta.county || ""} onChange={e => setMeta({...meta, county:e.target.value})} />
                        <input className="border p-2 rounded" placeholder="Sub County" value={meta.sub_county || ""} onChange={e => setMeta({...meta, sub_county:e.target.value})} />
                        <input className="border p-2 rounded" placeholder="Locality" value={meta.locality || ""} onChange={e => setMeta({...meta, locality:e.target.value})} />
                        <div className="flex gap-2">
                            <button onClick={save} type="button" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                            <button onClick={() => setEditing(false)} type="button" className="px-4 py-2 rounded border">Cancel</button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <div className="text-sm text-gray-500">Shop Name</div>
                            <div className="font-medium">{meta.shop_name || '-'}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Phone</div>
                            <div className="font-medium">{meta.phone || '-'}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">County</div>
                            <div className="font-medium">{meta.county || '-'}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Sub County</div>
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
        </Layout>
    )
}
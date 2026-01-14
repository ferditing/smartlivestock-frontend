import { useState } from "react";
import api from "../../api/axios";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const submit = async () => {
    await api.post("/agro/products", { name, price });
    alert("Product added");
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-3">Add Product</h2>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Product name"
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-4"
        placeholder="Price"
        onChange={(e) => setPrice(e.target.value)}
      />

      <button
        onClick={submit}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </div>
  );
}

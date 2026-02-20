// AddProduct.tsx - Updated
import { useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { Plus, Loader2 } from "lucide-react";

type Props = { onAdded?: () => void };

export default function AddProduct({ onAdded }: Props) {
  const [name, setName] = useState("");
  const [company,setCompany]=useState("");
  const [usage,setUsage]=useState("");
  const [quantity,setQuantity]=useState("");
  const [image,setImage]=useState<File|null>(null);
  const [description,setDescription]=useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const submit = async () => {
  // -------- Validation FIRST --------
  if (!name.trim()) {
    addToast('error', 'Error', 'Product name is required');
    return;
  }

  if (!price || isNaN(Number(price)) || Number(price) <= 0) {
    addToast('error', 'Error', 'Please enter a valid price');
    return;
  }

  setLoading(true);

  // -------- Build FormData AFTER validation --------
  const form = new FormData();
  form.append("name", name);
  form.append("price", price);
  form.append("company", company);
  form.append("usage", usage);
  form.append("quantity", quantity);
  form.append("description", description);

  if (image) form.append("image", image);

  try {
    await api.post("/agro/products", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    addToast('success', 'Success', 'Product added successfully');

    // -------- Reset fields --------
    setName("");
    setPrice("");
    setCompany("");
    setUsage("");
    setQuantity("");
    setDescription("");
    setImage(null);

    if (onAdded) onAdded();

  } catch (err: any) {
    console.error("Add product failed", err);
    const errorMessage =
      err?.response?.data?.error || "Failed to add product";

    addToast('error', 'Error', errorMessage);
  } finally {
    setLoading(false);
  }
};


  return (
  <div className="card">
    <div className="card-header">
      <h3 className="text-lg font-semibold text-gray-900">Add New Product</h3>
      <p className="text-sm text-gray-500 mt-1">
        Add a new product to your catalog
      </p>
    </div>

    <div className="card-body space-y-4">

      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Name
        </label>
        <input
          className="input-field"
          placeholder="Enter product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price (KES)
        </label>
        <input
          className="input-field"
          type="number"
          placeholder="Enter price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0"
          step="0.01"
          disabled={loading}
        />
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company
        </label>
        <input
          className="input-field"
          placeholder="Company"
          value={company}
          onChange={e => setCompany(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantity
        </label>
        <input
          className="input-field"
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Usage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Usage / Usefulness
        </label>
        <textarea
          className="input-field"
          placeholder="Usage / Usefulness"
          value={usage}
          onChange={e => setUsage(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          className="input-field"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Image
        </label>
        <input
          type="file"
          onChange={e => setImage(e.target.files?.[0] || null)}
          disabled={loading}
        />
      </div>

    </div>

    <div className="card-footer">
      <button
        onClick={submit}
        disabled={loading}
        className="w-full btn-primary flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Add Product
          </>
        )}
      </button>
    </div>
  </div>
);

}
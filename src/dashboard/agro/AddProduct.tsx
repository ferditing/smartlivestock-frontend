// AddProduct.tsx - Updated
import { useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { Plus, Loader2 } from "lucide-react";

type Props = { onAdded?: () => void };

export default function AddProduct({ onAdded }: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const submit = async () => {
    if (!name.trim()) {
      addToast('error', 'Error', 'Product name is required');
      return;
    }
    
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      addToast('error', 'Error', 'Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      await api.post("/agro/products", { name, price: Number(price) });
      
      addToast('success', 'Success', 'Product added successfully');
      setName("");
      setPrice("");
      
      if (onAdded) onAdded();
    } catch (err: any) {
      console.error("Add product failed", err);
      const errorMessage = err?.response?.data?.error || "Failed to add product";
      addToast('error', 'Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">Add New Product</h3>
        <p className="text-sm text-gray-500 mt-1">Add a new product to your catalog</p>
      </div>
      
      <div className="card-body space-y-4">
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
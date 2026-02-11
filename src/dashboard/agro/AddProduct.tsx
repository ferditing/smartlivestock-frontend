import { useState } from "react";
import { useDropzone } from "react-dropzone";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { Plus, Loader2 } from "lucide-react";

interface Props {
  onAdded?: () => void;
}

export default function AddProductCard({ onAdded }: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [company, setCompany] = useState("");
  const [quantity, setQuantity] = useState("");
  const [usage, setUsage] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Drag & Drop uploader
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: (files) => {
      if (files.length > 0) {
        setImage(files[0]);
      }
    }
  });

  // Submit handler
  const submit = async () => {
    if (!name.trim()) {
      addToast("error", "Error", "Product name is required");
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      addToast("error", "Error", "Please enter a valid price");
      return;
    }

    setLoading(true);

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

      addToast("success", "Success", "Product added successfully");

      // Reset fields
      setName("");
      setPrice("");
      setCompany("");
      setQuantity("");
      setUsage("");
      setDescription("");
      setImage(null);

      if (onAdded) onAdded();

    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.error || "Failed to add product";

      addToast("error", "Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">
          Add New Product
        </h3>
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
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Company */}
        <input
          className="input-field"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          disabled={loading}
        />

        {/* Quantity */}
        <input
          className="input-field"
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={loading}
        />

        {/* Usage */}
        <textarea
          className="input-field"
          placeholder="Usage / Usefulness"
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
          disabled={loading}
        />

        {/* Description */}
        <textarea
          className="input-field"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />

        {/* Drag & Drop Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image
          </label>

          <div
            {...getRootProps()}
            className="border-2 border-dashed p-6 text-center rounded-lg cursor-pointer hover:border-blue-400 transition"
          >
            <input {...getInputProps()} disabled={loading} />

            {image ? (
              <img
                src={URL.createObjectURL(image)}
                className="h-32 mx-auto rounded-lg"
              />
            ) : (
              <p className="text-gray-500">
                Drag image here or click to upload
              </p>
            )}
          </div>
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

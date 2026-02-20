import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { createProduct, updateProduct } from "../../api/agro.api";
import { serverBaseUrl } from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { Plus, Loader2 } from "lucide-react";

export type ProductForForm = {
  id?: number;
  name: string;
  price: number | string;
  company?: string;
  quantity?: number | string;
  usage?: string;
  description?: string;
  image_url?: string | null;
};

interface Props {
  product?: ProductForForm | null;
  onAdded?: () => void;
  onUpdated?: () => void;
}

export default function AddProductCard({ product, onAdded, onUpdated }: Props) {
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [company, setCompany] = useState("");
  const [quantity, setQuantity] = useState("");
  const [usage, setUsage] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(product?.id);

  useEffect(() => {
    if (product) {
      setName(product.name ?? "");
      setPrice(String(product.price ?? ""));
      setCompany(product.company ?? "");
      setQuantity(product.quantity != null ? String(product.quantity) : "");
      setUsage(product.usage ?? "");
      setDescription(product.description ?? "");
    }
  }, [product]);

  // Drag & Drop uploader
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (files) => setImage(files[0]),
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
      if (isEdit && product?.id) {
        await updateProduct(product.id, form);
        addToast("success", "Success", "Product updated successfully");
        if (onUpdated) onUpdated();
      } else {
        await createProduct(form);
        addToast("success", "Success", "Product added successfully");
        setName("");
        setPrice("");
        setCompany("");
        setQuantity("");
        setUsage("");
        setDescription("");
        setImage(null);
        if (onAdded) onAdded();
      }

    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.error ||
        (isEdit ? "Failed to update product" : "Failed to add product");
      addToast("error", "Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit ? "Update product details" : "Add a new product to your catalog"}
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
            className="border-2 border-dashed p-6 text-center rounded-lg cursor-pointer"
          >
            <input {...getInputProps()} />

            {image ? (
              <img src={URL.createObjectURL(image)} className="h-32 mx-auto" alt="" />
            ) : product?.image_url ? (
              <img
                src={`${serverBaseUrl}${product.image_url}`}
                className="h-32 mx-auto"
                alt=""
              />
            ) : (
              <p>Drag image here or click upload</p>
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
              {isEdit ? "Updating..." : "Adding..."}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {isEdit ? "Update Product" : "Add Product"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

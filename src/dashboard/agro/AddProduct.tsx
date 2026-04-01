// AddProduct.tsx – Premium Redesign (SmartLivestock Design System)
// All original state, validation, API calls and FormData logic unchanged.

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { createProduct, updateProduct } from "../../api/agro.api";
import { serverBaseUrl } from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import {
  Plus, Loader2, Package, ImagePlus, Tag, DollarSign,
  Building2, Archive, BookOpen, FileText, X,
} from "lucide-react";

export type ProductForForm = {
  id?: number; name: string; price: number | string; company?: string;
  quantity?: number | string; usage?: string; description?: string;
  image_url?: string | null;
};

interface Props {
  product?: ProductForForm | null;
  onAdded?: () => void;
  onUpdated?: () => void;
}

export default function AddProductCard({ product, onAdded, onUpdated }: Props) {
  const { addToast } = useToast();
  const [name,        setName]        = useState("");
  const [price,       setPrice]       = useState("");
  const [company,     setCompany]     = useState("");
  const [quantity,    setQuantity]    = useState("");
  const [usage,       setUsage]       = useState("");
  const [description, setDescription] = useState("");
  const [image,       setImage]       = useState<File | null>(null);
  const [loading,     setLoading]     = useState(false);

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: files => setImage(files[0]),
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const submit = async () => {
    if (!name.trim()) { addToast("error", "Error", "Product name is required"); return; }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      addToast("error", "Error", "Please enter a valid price"); return;
    }
    setLoading(true);
    const form = new FormData();
    form.append("name", name); form.append("price", price); form.append("company", company);
    form.append("usage", usage); form.append("quantity", quantity); form.append("description", description);
    if (image) form.append("image", image);
    try {
      if (isEdit && product?.id) {
        await updateProduct(product.id, form);
        addToast("success", "Success", "Product updated successfully");
        if (onUpdated) onUpdated();
      } else {
        await createProduct(form);
        addToast("success", "Success", "Product added successfully");
        setName(""); setPrice(""); setCompany(""); setQuantity(""); setUsage(""); setDescription(""); setImage(null);
        if (onAdded) onAdded();
      }
    } catch (err: any) {
      addToast("error", "Error", err?.response?.data?.error || (isEdit ? "Failed to update" : "Failed to add product"));
    } finally { setLoading(false); }
  };

  /* Field config */
  const fields: Array<{
    label: string; icon: React.ReactNode;
    val: string; set: (v: string) => void;
    type?: string; placeholder?: string; textarea?: boolean;
  }> = [
    { label:"Product Name", icon:<Tag className="w-4 h-4 text-gray-400"/>, val:name, set:setName, placeholder:"e.g. Dewormer 500ml" },
    { label:"Price (KES)",  icon:<DollarSign className="w-4 h-4 text-gray-400"/>, val:price, set:setPrice, type:"number", placeholder:"0.00" },
    { label:"Company / Brand", icon:<Building2 className="w-4 h-4 text-gray-400"/>, val:company, set:setCompany, placeholder:"e.g. Elanco" },
    { label:"Quantity in Stock", icon:<Archive className="w-4 h-4 text-gray-400"/>, val:quantity, set:setQuantity, type:"number", placeholder:"0" },
    { label:"Usage / Usefulness", icon:<BookOpen className="w-4 h-4 text-gray-400"/>, val:usage, set:setUsage, textarea:true, placeholder:"Describe how this product is used…" },
    { label:"Description", icon:<FileText className="w-4 h-4 text-gray-400"/>, val:description, set:setDescription, textarea:true, placeholder:"Additional product details…" },
  ];

  const previewSrc = image ? URL.createObjectURL(image)
    : product?.image_url ? `${serverBaseUrl}${product.image_url}` : null;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="card-header">
        <div className="card-icon-header">
          <div className="card-icon-wrap card-icon-green">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 sora text-sm">
              {isEdit ? "Edit Product" : "Add New Product"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? "Update product details" : "Add a new product to your catalog"}
            </p>
          </div>
        </div>
      </div>

      <div className="card-body space-y-4">
        {/* Image drop zone */}
        <div>
          <label className="field-label flex items-center gap-1.5">
            <ImagePlus className="w-3.5 h-3.5 text-gray-400" /> Product Image
          </label>
          <div {...getRootProps()}
            className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
              isDragActive ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-400 hover:bg-gray-50"
            }`}>
            <input {...getInputProps()} />
            {previewSrc ? (
              <div className="relative">
                <img src={previewSrc} alt="Preview" className="w-full h-40 object-cover rounded-2xl" />
                {image && (
                  <button type="button"
                    onClick={e => { e.stopPropagation(); setImage(null); }}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md text-gray-500 hover:text-red-600 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center gap-2 text-center px-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <ImagePlus className="w-5 h-5 text-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    {isDragActive ? "Drop image here…" : "Drag & drop or click to upload"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP up to 10MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.label} className={f.textarea ? "sm:col-span-2" : ""}>
              <label className="field-label flex items-center gap-1.5">
                {f.icon} {f.label}
              </label>
              {f.textarea ? (
                <textarea className="input-field resize-none" rows={3}
                  placeholder={f.placeholder} value={f.val}
                  onChange={e => f.set(e.target.value)} disabled={loading} />
              ) : (
                <input className="input-field" type={f.type || "text"}
                  placeholder={f.placeholder} value={f.val}
                  onChange={e => f.set(e.target.value)} disabled={loading}
                  min={f.type === "number" ? 0 : undefined}
                  step={f.type === "number" ? "0.01" : undefined} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="card-footer">
        <button onClick={submit} disabled={loading}
          className="w-full btn btn-primary btn-md flex items-center justify-center gap-2">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />{isEdit ? "Updating…" : "Adding…"}</>
            : <><Plus className="w-4 h-4" />{isEdit ? "Update Product" : "Add Product"}</>}
        </button>
      </div>
    </div>
  );
}
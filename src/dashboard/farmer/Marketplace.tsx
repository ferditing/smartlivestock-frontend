// Marketplace.tsx – Premium Redesign (SmartLivestock Design System)
// All original API calls, cart logic, payment flow, wishlist and filter logic unchanged.

import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useToast } from "../../context/ToastContext";
import {
  getMarketplaceProducts, addToCart, getCart, updateCartItem, removeFromCart,
  initializePaystackPayment, checkout, type CartItem,
} from "../../api/marketplace.api";
import { getAgrovetShops, type AgrovetShop } from "../../api/agro.api";
import api from "../../api/axios";
import { serverBaseUrl } from "../../api/axios";
import {
  Search, ShoppingCart, Package, Loader2, Plus, Minus, X, Store,
  MapPin, ArrowLeft, Heart, Star, Smartphone, CreditCard,
  MessageSquareText, Info, ChevronRight,
} from "lucide-react";

type Product = {
  id:number; name:string; price:number; quantity:number; provider_id?:number;
  shop_name?:string; image_url?:string; company?:string; description?:string;
  category?:string; rating?:number; ratingCount?:number;
};
type ViewMode = "shops"|"products";

/* ═══════════════════════════════════════════════════════════════
   MARKETPLACE
═══════════════════════════════════════════════════════════════ */
export default function Marketplace() {
  const { addToast } = useToast();

  const [viewMode,       setViewMode]       = useState<ViewMode>("shops");
  const [selectedShop,   setSelectedShop]   = useState<AgrovetShop | null>(null);
  const [shops,          setShops]          = useState<AgrovetShop[]>([]);
  const [shopSearch,     setShopSearch]     = useState("");
  const [nearMeOnly,     setNearMeOnly]     = useState(false);
  const [farmerCounty,   setFarmerCounty]   = useState<string | null>(null);
  const [products,       setProducts]       = useState<Product[]>([]);
  const [cart,           setCart]           = useState<CartItem[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [shopsLoading,   setShopsLoading]   = useState(true);
  const [cartLoading,    setCartLoading]    = useState(false);
  const [search,         setSearch]         = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice,       setMinPrice]       = useState<number|"">("");
  const [maxPrice,       setMaxPrice]       = useState<number|"">("");
  const [sortBy,         setSortBy]         = useState<"relevance"|"price_low_high"|"price_high_low"|"name_az">("relevance");
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [wishlist,       setWishlist]       = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try { const r = window.localStorage.getItem("farmer_marketplace_wishlist"); return r ? JSON.parse(r) : []; } catch { return []; }
  });
  const [page,           setPage]           = useState(1);
  const [total,          setTotal]          = useState(0);
  const [showCart,       setShowCart]       = useState(false);
  const [selectedProduct,setSelectedProduct] = useState<Product | null>(null);

  // Farmer county
  useEffect(() => {
    api.get("/profile/me").then(res => {
      const c = res.data?.county || res.data?.profile_meta?.county;
      if (c) setFarmerCounty(String(c).trim());
    }).catch(() => {});
  }, []);

  // Load shops
  useEffect(() => {
    setShopsLoading(true);
    getAgrovetShops(shopSearch.trim() || undefined)
      .then(setShops).catch(() => { addToast("error","Error","Failed to load shops"); setShops([]); })
      .finally(() => setShopsLoading(false));
  }, [shopSearch]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = { search:search.trim()||undefined, page, limit:12 };
      if (selectedShop) params.provider_id = selectedShop.id;
      const res = await getMarketplaceProducts(params);
      setProducts(res.data || []); setTotal(Number(res.total) || 0);
    } catch { addToast("error","Error","Failed to load products"); setProducts([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (viewMode === "products") loadProducts(); }, [viewMode, selectedShop, page, search]);

  const loadCart = async () => { try { setCart(await getCart()); } catch {} };
  useEffect(() => { loadCart(); }, []);

  const handleAddToCart = async (product: Product, qty=1) => {
    if (cart.length > 0) {
      const existingProviders = Array.from(new Set(cart.map(i => i.provider_id ?? null)));
      const currentProvider   = product.provider_id ?? null;
      if (existingProviders.length > 1 ||
        (existingProviders.length === 1 && existingProviders[0] !== null && existingProviders[0] !== currentProvider)) {
        addToast("error","Different shop","You can only add products from the same agrovet shop."); return;
      }
    }
    if (product.quantity < qty) { addToast("error","Error","Insufficient stock"); return; }
    setCartLoading(true);
    try {
      await addToCart(product.id, qty); await loadCart();
      addToast("success","Added to cart",`"${product.name}" added to your cart.`);
    } catch (err: any) {
      addToast("error","Error",err?.response?.data?.error || "Failed to add to cart");
    } finally { setCartLoading(false); }
  };

  const cartTotal = cart.reduce((s,i) => s + Number(i.price)*i.qty, 0);
  const cartCount = cart.reduce((s,i) => s + i.qty, 0);
  const filteredShops = nearMeOnly && farmerCounty
    ? shops.filter(s => s.county && s.county.toLowerCase() === farmerCounty.toLowerCase())
    : shops;

  const openShop = (shop: AgrovetShop) => { setSelectedShop(shop); setViewMode("products"); setSearch(""); setPage(1); };
  const backToShops = () => { setSelectedShop(null); setViewMode("shops"); setSearch(""); };
  const showAllProducts = () => { setSelectedShop(null); setViewMode("products"); setSearch(""); setPage(1); };

  const maxStock = products.length > 0 ? Math.max(...products.map(p => p.quantity||0), 1) : 1;
  const availableCategories = Array.from(new Set(products.map(p=>(p.category||"").trim()).filter(c=>c.length>0)));
  const minAvailablePrice   = products.length > 0 ? Math.min(...products.map(p=>Number(p.price)||0)) : 0;
  const maxAvailablePrice   = products.length > 0 ? Math.max(...products.map(p=>Number(p.price)||0)) : 0;

  const toggleWishlist = (id: number) => {
    setWishlist(prev => {
      const next = prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id];
      try { window.localStorage.setItem("farmer_marketplace_wishlist", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const filteredAndSortedProducts = products
    .filter(p => {
      if (showWishlistOnly && !wishlist.includes(p.id)) return false;
      if (selectedCategory !== "all" && p.category?.trim() !== selectedCategory) return false;
      const price = Number(p.price)||0;
      if (minPrice !== "" && price < minPrice) return false;
      if (maxPrice !== "" && price > maxPrice) return false;
      return true;
    })
    .sort((a,b) => {
      if (sortBy === "price_low_high") return Number(a.price)-Number(b.price);
      if (sortBy === "price_high_low") return Number(b.price)-Number(a.price);
      if (sortBy === "name_az")        return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <Layout role="farmer">
      <div className="space-y-6 animate-fadeInUp">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Marketplace</h1>
            <p className="page-sub">
              {viewMode === "shops"
                ? "Find agrovets near you, then browse and order products"
                : selectedShop ? `Shopping at ${selectedShop.shopName}` : "Browse all veterinary products"}
            </p>
          </div>
          <button onClick={() => setShowCart(true)}
            className="btn btn-primary btn-md relative flex items-center gap-2 self-start">
            <ShoppingCart className="w-5 h-5" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* ══ SHOPS VIEW ══ */}
        {viewMode === "shops" ? (
          <>
            <div className="card overflow-hidden">
              <div className="card-body flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search by shop name or location…"
                    value={shopSearch} onChange={e => setShopSearch(e.target.value)}
                    className="input-field pl-10 w-full" />
                </div>
                {farmerCounty && (
                  <label className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-100 transition select-none">
                    <input type="checkbox" checked={nearMeOnly} onChange={e => setNearMeOnly(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 accent-green-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      Near me <span className="text-gray-400 font-normal">({farmerCounty})</span>
                    </span>
                  </label>
                )}
              </div>
            </div>

            {shopsLoading ? (
              <div className="card overflow-hidden">
                <div className="card-body py-14 flex flex-col items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                  <p className="text-sm font-semibold text-gray-400">Loading agrovets…</p>
                </div>
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="card overflow-hidden">
                <div className="card-body py-14 flex flex-col items-center text-center gap-4">
                  <Store className="w-10 h-10 text-gray-200" />
                  <p className="text-sm font-semibold text-gray-400">
                    {shopSearch || nearMeOnly ? "No shops match your search" : "No agrovet shops listed yet"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredShops.map(shop => {
                  const isNear = farmerCounty && shop.county && shop.county.toLowerCase() === farmerCounty.toLowerCase();
                  return (
                    <div key={shop.id} onClick={() => openShop(shop)}
                      className="card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-200 group">
                      <div className="card-body">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Store className="w-6 h-6 text-green-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 sora text-sm truncate group-hover:text-green-700 transition">
                              {shop.shopName}
                            </h3>
                            {(shop.county || shop.subCounty) && (
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                {[shop.county, shop.subCounty].filter(Boolean).join(", ")}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-semibold">
                                {shop.productCount} products
                              </span>
                              {isNear && (
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-100 text-green-800">Near you</span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 flex-shrink-0 transition" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="card overflow-hidden border border-gray-100 bg-gray-50/60">
              <div className="card-body flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-gray-600">Want to browse all products without choosing a shop?</p>
                <button onClick={showAllProducts} className="btn btn-outline btn-sm">Browse all products</button>
              </div>
            </div>
          </>
        ) : (

        /* ══ PRODUCTS VIEW ══ */
          <>
            {/* Back + search + filters */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={backToShops} className="btn btn-outline btn-sm flex items-center gap-2 self-start">
                  <ArrowLeft className="w-4 h-4" /> Back to shops
                </button>
                <div className="flex-1 relative max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search products…" value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="input-field pl-10 w-full" />
                </div>
              </div>

              <div className="card overflow-hidden border border-gray-100 bg-gray-50/60">
                <div className="card-body py-3.5">
                  <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
                    <div className="flex-1 flex flex-wrap gap-3">
                      <div className="min-w-[150px]">
                        <label className="field-label text-[10px]">Category</label>
                        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                          className="input-field w-full text-sm">
                          <option value="all">All categories</option>
                          {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="w-28">
                        <label className="field-label text-[10px]">Min price (KES)</label>
                        <input type="number" min={0}
                          value={minPrice === "" ? "" : minPrice}
                          onChange={e => setMinPrice(e.target.value===""?"":Number(e.target.value))}
                          placeholder={minAvailablePrice ? String(minAvailablePrice) : "0"}
                          className="input-field w-full text-sm" />
                      </div>
                      <div className="w-28">
                        <label className="field-label text-[10px]">Max price (KES)</label>
                        <input type="number" min={0}
                          value={maxPrice === "" ? "" : maxPrice}
                          onChange={e => setMaxPrice(e.target.value===""?"":Number(e.target.value))}
                          placeholder={maxAvailablePrice ? String(maxAvailablePrice) : "Any"}
                          className="input-field w-full text-sm" />
                      </div>
                      <div className="min-w-[140px]">
                        <label className="field-label text-[10px]">Sort by</label>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                          className="input-field w-full text-sm">
                          <option value="relevance">Relevance</option>
                          <option value="price_low_high">Price: Low → High</option>
                          <option value="price_high_low">Price: High → Low</option>
                          <option value="name_az">Name: A–Z</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 lg:flex-shrink-0">
                      <button onClick={() => { setSelectedCategory("all"); setMinPrice(""); setMaxPrice(""); setSortBy("relevance"); setShowWishlistOnly(false); }}
                        className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
                        Reset
                      </button>
                      <button onClick={() => setShowWishlistOnly(p => !p)}
                        className={`btn btn-sm flex items-center gap-1.5 ${showWishlistOnly ? "btn-primary" : "btn-outline"}`}>
                        <Heart className={`w-3.5 h-3.5 ${showWishlistOnly ? "fill-pink-400 text-pink-400" : ""}`} />
                        Wishlist
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="card overflow-hidden">
                <div className="card-body py-14 flex flex-col items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                  <p className="text-sm font-semibold text-gray-400">Loading products…</p>
                </div>
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="card overflow-hidden">
                <div className="card-body py-14 flex flex-col items-center text-center gap-4">
                  <Package className="w-10 h-10 text-gray-200" />
                  <p className="text-sm font-semibold text-gray-400">{search ? "No products found" : "No products available"}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredAndSortedProducts.map(product => (
                    <div key={product.id}
                      className="card overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-green-100"
                      onClick={() => setSelectedProduct(product)}>
                      {/* Image */}
                      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-50 via-white to-green-50">
                        {product.image_url
                          ? <img src={`${serverBaseUrl}${product.image_url}`} alt={product.name}
                              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-1" />
                          : <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-16 h-16 text-gray-200 transform group-hover:scale-110 transition-transform duration-500" />
                            </div>}
                        {product.quantity === 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-sm font-black">Out of Stock</span>
                          </div>
                        )}
                        <button onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 shadow-sm rounded-full hover:bg-white transition">
                          <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? "fill-pink-500 text-pink-500" : "text-gray-400"}`} />
                        </button>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                          <span className="text-xs text-white/80 truncate">{product.shop_name || "Agrovet shop"}</span>
                        </div>
                      </div>
                      {/* Body */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 text-sm mb-0.5 line-clamp-2">{product.name}</h3>
                        {product.company && <p className="text-xs text-gray-400 mb-1.5">{product.company}</p>}
                        {/* Stars */}
                        {typeof product.rating === "number" ? (
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="flex">
                              {Array.from({length:5}).map((_,i) => (
                                <Star key={i} className={`w-3 h-3 ${i+1<=Math.round(product.rating!) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                              ))}
                            </div>
                            <span className="text-[10px] text-gray-400">{product.rating.toFixed(1)}{product.ratingCount ? ` (${product.ratingCount})` : ""}</span>
                          </div>
                        ) : <div className="mb-2 text-[10px] text-gray-300">No ratings yet</div>}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-black text-green-600 sora">KES {Number(product.price).toLocaleString()}</span>
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Stock: {product.quantity}</span>
                        </div>
                        {/* Stock bar */}
                        <div className="mb-3">
                          <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className={`h-full rounded-full ${product.quantity===0?"bg-red-400":product.quantity<maxStock*0.3?"bg-amber-400":"bg-green-500"}`}
                              style={{ width:`${Math.min(100,(product.quantity/maxStock)*100||0)}%` }} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={e => { e.stopPropagation(); handleAddToCart(product,1); }}
                            disabled={product.quantity===0||cartLoading}
                            className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1">
                            {cartLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                            Add
                          </button>
                          <button onClick={e => { e.stopPropagation(); setSelectedProduct(product); }}
                            className="btn btn-outline btn-sm flex-1">Details</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {total > 12 && (
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                      className="btn btn-outline btn-sm">Previous</button>
                    <span className="text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-4 py-1.5 rounded-xl">
                      {page} / {Math.ceil(total/12)}
                    </span>
                    <button onClick={() => setPage(p => p+1)} disabled={page>=Math.ceil(total/12)}
                      className="btn btn-outline btn-sm">Next</button>
                  </div>
                )}
              </>
            )}

            {/* ── Product detail modal ── */}
            {selectedProduct && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="sticky top-0 bg-white border-b rounded-t-2xl px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-base font-bold text-gray-900 sora line-clamp-1">{selectedProduct.name}</h2>
                    <button onClick={() => setSelectedProduct(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100">
                        {selectedProduct.image_url
                          ? <img src={`${serverBaseUrl}${selectedProduct.image_url}`} alt={selectedProduct.name}
                              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" />
                          : <Package className="w-24 h-24 text-gray-200" />}
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-black text-gray-900 sora">{selectedProduct.name}</h3>
                          {selectedProduct.company && <p className="text-sm text-gray-500 mt-0.5">By {selectedProduct.company}</p>}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {selectedProduct.category && (
                              <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">{selectedProduct.category}</span>
                            )}
                            {selectedProduct.shop_name && (
                              <span className="text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                                <Store className="w-3 h-3" />{selectedProduct.shop_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-3xl font-black text-green-600 sora">
                          KES {Number(selectedProduct.price).toLocaleString()}
                        </p>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Stock level</p>
                          <p className="text-base font-bold text-gray-900 mb-2">
                            {selectedProduct.quantity} unit{selectedProduct.quantity===1?"":"s"} available
                          </p>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${selectedProduct.quantity===0?"bg-red-400":selectedProduct.quantity<maxStock*0.3?"bg-amber-400":"bg-green-500"}`}
                              style={{ width:`${Math.min(100,(selectedProduct.quantity/maxStock)*100||0)}%` }} />
                          </div>
                        </div>
                        {selectedProduct.description && (
                          <p className="text-sm text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                        )}
                        {/* Usage + Reviews */}
                        <div className="space-y-3">
                          {[
                            { icon:<Info className="w-4 h-4 text-gray-500"/>, title:"Usage & dosage",
                              content:"Follow label directions and consult a vet for accurate dosage. For young/weak animals, start with a lower dose." },
                            { icon:<Info className="w-4 h-4 text-gray-500"/>, title:"Nutritional / composition",
                              content:"Active ingredients vary by brand. Storage: cool, dry place away from sunlight." },
                          ].map(s => (
                            <div key={s.title} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-white/60">
                                {s.icon}
                                <p className="text-xs font-bold text-gray-800">{s.title}</p>
                              </div>
                              <p className="text-xs text-gray-600 p-3 leading-relaxed">{s.content}</p>
                            </div>
                          ))}
                          <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-white/60">
                              <MessageSquareText className="w-4 h-4 text-gray-500" />
                              <p className="text-xs font-bold text-gray-800">Reviews</p>
                              <span className="ml-auto text-[10px] text-gray-400">Mock</span>
                            </div>
                            <div className="p-3 space-y-2">
                              {[{ name:"Farmer A",rating:5,text:"Worked well. Fast delivery." },
                                { name:"Farmer B",rating:4,text:"Good quality, nice packaging." },
                                { name:"Farmer C",rating:3,text:"Okay product, would buy again." }].map((r,i) => (
                                <div key={i} className="bg-white rounded-xl p-2.5 border border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-gray-800">{r.name}</p>
                                    <div className="flex">{Array.from({length:5}).map((_,j) => (
                                      <Star key={j} className={`w-3 h-3 ${j+1<=r.rating?"fill-amber-400 text-amber-400":"text-gray-200"}`} />
                                    ))}</div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">{r.text}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => { handleAddToCart(selectedProduct,1); setSelectedProduct(null); }}
                          disabled={selectedProduct.quantity===0||cartLoading}
                          className="w-full btn btn-primary btn-md">
                          {cartLoading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {showCart && (
          <CartSidebar cart={cart} onClose={() => setShowCart(false)} onUpdate={loadCart} cartTotal={cartTotal} />
        )}
      </div>
    </Layout>
  );
}

/* ══════════════════════════════════════════════════════════════
   CART SIDEBAR (all original logic unchanged)
══════════════════════════════════════════════════════════════ */
function groupCartByShop(cart: CartItem[]) {
  const map = new Map<string|number, CartItem[]>();
  for (const item of cart) {
    const key = item.provider_id ?? "unknown";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries()).map(([key,items]) => {
    const first = items[0];
    return {
      shopName: first?.shop_name || "Unknown shop",
      providerId: typeof key==="number" ? key : undefined,
      items,
      subtotal: items.reduce((s,i) => s+Number(i.price)*i.qty, 0),
    };
  });
}

function CartSidebar({ cart, onClose, onUpdate, cartTotal }:
  { cart:CartItem[]; onClose:()=>void; onUpdate:()=>void; cartTotal:number }) {
  const { addToast } = useToast();
  const [loading,          setLoading]          = useState(false);
  const [email,            setEmail]            = useState("");
  const [mpesaPhone,       setMpesaPhone]       = useState("");
  const [paymentMethod,    setPaymentMethod]    = useState<"paystack"|"mpesa">("paystack");
  const [showCheckout,     setShowCheckout]     = useState(false);

  const cartByShop = groupCartByShop(cart);
  const itemCount  = cart.reduce((s,i) => s+i.qty, 0);
  const singleShop = cartByShop.length===1 ? cartByShop[0] : null;

  const handleUpdateQty = async (id:number, qty:number) => {
    if (qty < 1) return;
    setLoading(true);
    try { await updateCartItem(id,qty); await onUpdate(); }
    catch { addToast("error","Error","Failed to update cart"); }
    finally { setLoading(false); }
  };

  const handleRemove = async (id:number) => {
    setLoading(true);
    try { await removeFromCart(id); await onUpdate(); addToast("success","Removed","Item removed from cart."); }
    catch { addToast("error","Error","Failed to remove item"); }
    finally { setLoading(false); }
  };

  const handleCheckout = async () => {
    if (!singleShop) { addToast("error","Multiple shops","Cart must contain products from a single shop."); return; }
    if (paymentMethod === "paystack") {
      if (!email.trim()) { addToast("error","Error","Please enter your email address"); return; }
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) { addToast("error","Error","Please enter a valid email"); return; }
      setLoading(true);
      try {
        const tryInit = async (amount:number) => {
          const res = await initializePaystackPayment(Math.round(amount), email.trim(), singleShop.providerId);
          return res?.authorization_url || res?.data?.authorization_url || res?.data?.authorizationUrl
            || res?.authorizationUrl || res?.payment_url || res?.data?.payment_url as string|undefined;
        };
        let url = await tryInit(cartTotal);
        if (!url) url = await tryInit(cartTotal*100);
        if (!url) throw new Error("Missing authorization URL");
        window.location.href = url;
      } catch (err:any) {
        addToast("error","Failed",err?.response?.data?.error||"Unable to initialize Paystack payment");
      } finally { setLoading(false); }
      return;
    }
    if (!mpesaPhone.trim()) { addToast("error","Error","Please enter your M-Pesa phone number"); return; }
    setLoading(true);
    try {
      const order = await checkout(mpesaPhone.trim(), singleShop.providerId);
      await onUpdate();
      addToast("success","Order placed",`M-Pesa payment sent. Order #${order.id} created.`);
      onClose();
    } catch (err:any) {
      addToast("error","Failed",err?.response?.data?.error||"M-Pesa payment failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex">
      <div className="ml-auto w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-black text-gray-900 sora">Cart ({itemCount} {itemCount===1?"item":"items"})</h2>
            {singleShop && <p className="text-xs text-gray-400 mt-0.5">Shopping at {singleShop.shopName}</p>}
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-4 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-400">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartByShop.map(({ shopName, items, subtotal }) => (
                <div key={shopName} className="border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="bg-gray-50 px-3.5 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900">{shopName}</p>
                    <p className="text-[10px] text-gray-400">{items.length} product(s) · KES {subtotal.toLocaleString()}</p>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-52 overflow-y-auto">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-3 p-3">
                        <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          {item.image_url
                            ? <img src={`${serverBaseUrl}${item.image_url}`} alt={item.name} className="w-full h-full object-cover" />
                            : <Package className="w-full h-full text-gray-200 p-2.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-xs line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-gray-400">KES {Number(item.price).toLocaleString()} × {item.qty}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <button onClick={() => handleUpdateQty(item.id,item.qty-1)} disabled={loading||item.qty<=1}
                              className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-40 transition">
                              <Minus className="w-3 h-3 text-gray-600" />
                            </button>
                            <span className="text-xs font-black text-gray-900 w-5 text-center">{item.qty}</span>
                            <button onClick={() => handleUpdateQty(item.id,item.qty+1)} disabled={loading||item.qty>=item.stock}
                              className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-40 transition">
                              <Plus className="w-3 h-3 text-gray-600" />
                            </button>
                            <button onClick={() => handleRemove(item.id)} disabled={loading}
                              className="ml-auto w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition disabled:opacity-40">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t p-4 space-y-3 flex-shrink-0">
            {cartByShop.length > 1 && (
              <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-2.5">
                For Paystack checkout, your cart must only contain products from a single shop.
              </p>
            )}
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800">Total</span>
              <span className="text-xl font-black text-green-700 sora">KES {cartTotal.toLocaleString()}</span>
            </div>
            {!showCheckout ? (
              <button onClick={() => setShowCheckout(true)}
                className="w-full btn btn-primary btn-md">Proceed to Checkout</button>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPaymentMethod("paystack")}
                    className={`btn btn-sm flex items-center justify-center gap-1.5 ${paymentMethod==="paystack"?"btn-primary":"btn-outline"}`}>
                    <CreditCard className="w-4 h-4" /> Paystack
                  </button>
                  <button onClick={() => setPaymentMethod("mpesa")}
                    className={`btn btn-sm flex items-center justify-center gap-1.5 ${paymentMethod==="mpesa"?"btn-primary":"btn-outline"}`}>
                    <Smartphone className="w-4 h-4" /> M-Pesa
                  </button>
                </div>
                {paymentMethod === "paystack"
                  ? <input type="email" placeholder="Email for Paystack receipt" value={email}
                      onChange={e => setEmail(e.target.value)} className="input-field w-full" />
                  : <input type="tel" placeholder="M-Pesa phone (e.g. 254712345678)" value={mpesaPhone}
                      onChange={e => setMpesaPhone(e.target.value)} className="input-field w-full" />}
                <button onClick={handleCheckout} disabled={loading} className="w-full btn btn-primary btn-md">
                  {loading && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                  {paymentMethod==="paystack" ? "Pay securely with Paystack" : "Pay with M-Pesa (mock)"}
                </button>
                <button onClick={() => setShowCheckout(false)} className="w-full btn btn-outline btn-sm">Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
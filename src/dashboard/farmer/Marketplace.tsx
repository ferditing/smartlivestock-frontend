import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useToast } from "../../context/ToastContext";
import {
  getMarketplaceProducts,
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  initializePaystackPayment,
  clearCart,
  checkout,
  type CartItem,
} from "../../api/marketplace.api";
import { getAgrovetShops, type AgrovetShop } from "../../api/agro.api";
import api from "../../api/axios";
import { serverBaseUrl } from "../../api/axios";
import {
  Search,
  ShoppingCart,
  Package,
  Loader2,
  Plus,
  Minus,
  X,
  Store,
  MapPin,
  ArrowLeft,
  Heart,
  Star,
  Smartphone,
  CreditCard,
  MessageSquareText,
  Info,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  provider_id?: number;
  shop_name?: string;
  image_url?: string;
  company?: string;
  description?: string;
  category?: string;
  rating?: number;
  ratingCount?: number;
};

type ViewMode = "shops" | "products";

export default function Marketplace() {
  const { addToast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("shops");
  const [selectedShop, setSelectedShop] = useState<AgrovetShop | null>(null);
  const [shops, setShops] = useState<AgrovetShop[]>([]);
  const [shopSearch, setShopSearch] = useState("");
  const [nearMeOnly, setNearMeOnly] = useState(false);
  const [farmerCounty, setFarmerCounty] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<"relevance" | "price_low_high" | "price_high_low" | "name_az">("relevance");
  const [wishlist, setWishlist] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("farmer_marketplace_wishlist");
      return raw ? (JSON.parse(raw) as number[]) : [];
    } catch {
      return [];
    }
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Farmer profile for "Near you" (county)
  useEffect(() => {
    api.get("/profile/me").then((res) => {
      const c = res.data?.county || res.data?.profile_meta?.county;
      if (c) setFarmerCounty(String(c).trim());
    }).catch(() => {});
  }, []);

  // Load agrovet shops (for "Browse by shop")
  useEffect(() => {
    setShopsLoading(true);
    getAgrovetShops(shopSearch.trim() || undefined)
      .then(setShops)
      .catch(() => {
        addToast("error", "Error", "Failed to load shops");
        setShops([]);
      })
      .finally(() => setShopsLoading(false));
  }, [shopSearch]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: { search?: string; page: number; limit: number; provider_id?: number } = {
        search: search.trim() || undefined,
        page,
        limit: 12,
      };
      if (selectedShop) params.provider_id = selectedShop.id;
      const res = await getMarketplaceProducts(params);
      setProducts(res.data || []);
      setTotal(Number(res.total) || 0);
    } catch (err: unknown) {
      addToast("error", "Error", "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === "products") loadProducts();
  }, [viewMode, selectedShop, page, search]);

  const loadCart = async () => {
    try {
      const items = await getCart();
      setCart(items);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleAddToCart = async (product: Product, qty: number = 1) => {
    // Enforce single-shop cart: only allow items from the same agrovet shop
    if (cart.length > 0) {
      const existingProviderIds = Array.from(
        new Set(cart.map((item) => item.provider_id ?? null))
      );

      const currentProviderId = product.provider_id ?? null;

      if (
        existingProviderIds.length > 1 ||
        (existingProviderIds.length === 1 &&
          existingProviderIds[0] !== null &&
          existingProviderIds[0] !== currentProviderId)
      ) {
        addToast(
          "error",
          "Different shop detected",
          "You can only add products from the same agrovet shop. Please complete or clear your current cart before adding items from another shop."
        );
        return;
      }
    }

    if (product.quantity < qty) {
      addToast("error", "Error", "Insufficient stock");
      return;
    }
    setCartLoading(true);
    try {
      await addToCart(product.id, qty);
      await loadCart();
      addToast(
        "success",
        "Added to cart",
        `Product "${product.name}" has been added to your cart.`
      );
    } catch (err: unknown) {
      addToast("error", "Error", (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to add to cart");
    } finally {
      setCartLoading(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const filteredShops = nearMeOnly && farmerCounty
    ? shops.filter((s) => s.county && s.county.toLowerCase() === farmerCounty.toLowerCase())
    : shops;

  const openShop = (shop: AgrovetShop) => {
    setSelectedShop(shop);
    setViewMode("products");
    setSearch("");
    setPage(1);
  };

  const backToShops = () => {
    setSelectedShop(null);
    setViewMode("shops");
    setSearch("");
  };

  const showAllProducts = () => {
    setSelectedShop(null);
    setViewMode("products");
    setSearch("");
    setPage(1);
  };

  const maxStock =
    products.length > 0
      ? Math.max(...products.map((p) => p.quantity || 0), 1)
      : 1;

  const availableCategories = Array.from(
    new Set(
      products
        .map((p) => (p.category || "").trim())
        .filter((c) => c.length > 0)
    )
  );

  const minAvailablePrice =
    products.length > 0
      ? Math.min(...products.map((p) => Number(p.price) || 0))
      : 0;
  const maxAvailablePriceForFilter =
    products.length > 0
      ? Math.max(...products.map((p) => Number(p.price) || 0))
      : 0;

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "farmer_marketplace_wishlist",
            JSON.stringify(next)
          );
        }
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  const filteredAndSortedProducts = products
    .filter((product) => {
      if (showWishlistOnly && !wishlist.includes(product.id)) return false;
      if (selectedCategory !== "all" && product.category?.trim() !== selectedCategory) {
        return false;
      }
      const priceNumber = Number(product.price) || 0;
      if (minPrice !== "" && priceNumber < minPrice) return false;
      if (maxPrice !== "" && priceNumber > maxPrice) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price_low_high") {
        return Number(a.price) - Number(b.price);
      }
      if (sortBy === "price_high_low") {
        return Number(b.price) - Number(a.price);
      }
      if (sortBy === "name_az") {
        return a.name.localeCompare(b.name);
      }
      return 0; // relevance (API order)
    });

  return (
    <Layout role="farmer">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-gray-600 mt-1">
              {viewMode === "shops"
                ? "Find agrovets by name or shop near you, then view products and order"
                : selectedShop
                  ? `Shopping at ${selectedShop.shopName}`
                  : "Browse all veterinary products"}
            </p>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="btn-primary flex items-center gap-2 relative"
          >
            <ShoppingCart className="w-5 h-5" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {viewMode === "shops" ? (
          <>
            {/* Browse by shop: search & filter */}
            <div className="card">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by shop name or location..."
                    value={shopSearch}
                    onChange={(e) => setShopSearch(e.target.value)}
                    className="input-field pl-10 w-full"
                  />
                </div>
                {farmerCounty && (
                  <label className="flex items-center gap-2 whitespace-nowrap cursor-pointer">
                    <input
                      type="checkbox"
                      checked={nearMeOnly}
                      onChange={(e) => setNearMeOnly(e.target.checked)}
                      className="rounded border-gray-300 text-green-600"
                    />
                    <span className="text-sm text-gray-700">Near me ({farmerCounty})</span>
                  </label>
                )}
              </div>
            </div>

            {/* Shops list */}
            {shopsLoading ? (
              <div className="card p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-3" />
                <p className="text-gray-500">Loading agrovets...</p>
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="card p-12 text-center">
                <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {shopSearch || nearMeOnly ? "No shops match your search" : "No agrovet shops listed yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredShops.map((shop) => {
                  const isNear = farmerCounty && shop.county && shop.county.toLowerCase() === farmerCounty.toLowerCase();
                  return (
                    <div
                      key={shop.id}
                      onClick={() => openShop(shop)}
                      className="card hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-green-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Store className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{shop.shopName}</h3>
                          {(shop.county || shop.subCounty) && (
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              {[shop.county, shop.subCounty].filter(Boolean).join(", ")}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">{shop.productCount} products</span>
                            {isNear && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Near you
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="card bg-gray-50 border border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-gray-600">Want to browse all products without choosing a shop?</p>
                <button onClick={showAllProducts} className="btn-outline flex items-center gap-2">
                  Browse all products
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Products view: back + search + filters */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={backToShops}
                  className="btn-outline flex items-center gap-2 self-start"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to shops
                </button>
                <div className="flex-1 relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="input-field pl-10 w-full"
                  />
                </div>
              </div>

              <div className="card border border-gray-100 bg-gray-50/60">
                <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
                  <div className="flex-1 flex flex-wrap gap-3">
                    <div className="min-w-[150px]">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="input-field w-full text-sm"
                      >
                        <option value="all">All categories</option>
                        {availableCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Min price (KES)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={minPrice === "" ? "" : minPrice}
                        onChange={(e) =>
                          setMinPrice(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        placeholder={
                          minAvailablePrice ? String(minAvailablePrice) : "0"
                        }
                        className="input-field w-full text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Max price (KES)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={maxPrice === "" ? "" : maxPrice}
                        onChange={(e) =>
                          setMaxPrice(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        placeholder={
                          maxAvailablePriceForFilter
                            ? String(maxAvailablePriceForFilter)
                            : "Any"
                        }
                        className="input-field w-full text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Sort by
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) =>
                          setSortBy(
                            e.target.value as
                              | "relevance"
                              | "price_low_high"
                              | "price_high_low"
                              | "name_az"
                          )
                        }
                        className="input-field w-full text-sm"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="price_low_high">Price: Low to High</option>
                        <option value="price_high_low">Price: High to Low</option>
                        <option value="name_az">Name: A–Z</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("all");
                        setMinPrice("");
                        setMaxPrice("");
                        setSortBy("relevance");
                        setShowWishlistOnly(false);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
                    >
                      Reset filters
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setShowWishlistOnly((prev) => !prev)
                      }
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        showWishlistOnly
                          ? "bg-pink-50 border-pink-200 text-pink-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Heart
                        className={`w-3 h-3 ${
                          showWishlistOnly ? "fill-pink-500 text-pink-500" : ""
                        }`}
                      />
                      Wishlist only
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="card p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-3" />
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="card p-12 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{search ? "No products found" : "No products available"}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                  {filteredAndSortedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="card group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-green-100 bg-white/90 backdrop-blur-sm"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-gray-50 via-white to-green-50">
                        {product.image_url ? (
                          <img
                            src={`${serverBaseUrl}${product.image_url}`}
                            alt={product.name}
                            className="w-full h-full object-cover transform transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-rotate-1"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-gray-300 transform transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3" />
                          </div>
                        )}
                        {product.quantity === 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-semibold">Out of Stock</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              wishlist.includes(product.id)
                                ? "fill-pink-500 text-pink-500"
                                : "text-gray-400"
                            }`}
                          />
                        </button>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-between p-3">
                          <span className="text-xs text-white/80">
                            {product.shop_name || "Agrovet shop"}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-white/70 bg-black/40 px-2 py-0.5 rounded-full">
                            3D view effect
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                        {product.company && (
                          <p className="text-sm text-gray-500 mb-1">{product.company}</p>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          {typeof product.rating === "number" ? (
                            <>
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, index) => {
                                  const filled =
                                    product.rating !== undefined &&
                                    index + 1 <= Math.round(product.rating);
                                  return (
                                    <Star
                                      key={index}
                                      className={`w-3 h-3 ${
                                        filled
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  );
                                })}
                              </div>
                              <span className="text-xs text-gray-600">
                                {product.rating.toFixed(1)}
                                {product.ratingCount
                                  ? ` (${product.ratingCount})`
                                  : ""}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No ratings yet
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-green-600">
                            KES {Number(product.price).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            Stock: {product.quantity}
                          </span>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">Availability</span>
                            <span className="text-xs font-medium text-gray-700">
                              {product.quantity} unit{product.quantity === 1 ? "" : "s"}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                product.quantity === 0
                                  ? "bg-red-400"
                                  : product.quantity < maxStock * 0.3
                                  ? "bg-amber-400"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  (product.quantity / maxStock) * 100 || 0
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product, 1);
                            }}
                            disabled={product.quantity === 0 || cartLoading}
                            className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-2"
                          >
                            {cartLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" />
                                <span>Add to Cart</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(product);
                            }}
                            className="btn-outline flex-1 text-sm py-2"
                          >
                            View details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {total > 12 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="btn-outline px-4 py-2 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {page} of {Math.ceil(total / 12)}
                    </span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= Math.ceil(total / 12)}
                      className="btn-outline px-4 py-2 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Product detail modal */}
            {selectedProduct && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
                    <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="aspect-square bg-gradient-to-br from-gray-50 via-white to-green-50 rounded-lg overflow-hidden flex items-center justify-center">
                        {selectedProduct.image_url ? (
                          <img
                            src={`${serverBaseUrl}${selectedProduct.image_url}`}
                            alt={selectedProduct.name}
                            className="w-full h-full object-contain transform transition-transform duration-500 ease-out hover:scale-105 hover:-rotate-1"
                          />
                        ) : (
                          <Package className="w-24 h-24 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{selectedProduct.name}</h3>
                        {selectedProduct.company && (
                          <p className="text-gray-600 mb-4">By {selectedProduct.company}</p>
                        )}
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                            {selectedProduct.category || "General"}
                          </span>
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                            {selectedProduct.shop_name || "Agrovet shop"}
                          </span>
                        </div>
                        <div className="mb-4">
                          <span className="text-3xl font-bold text-green-600">
                            KES {Number(selectedProduct.price).toLocaleString()}
                          </span>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">Stock level</p>
                          <p className="text-lg font-semibold mb-2">
                            {selectedProduct.quantity} unit
                            {selectedProduct.quantity === 1 ? "" : "s"} available
                          </p>
                          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                selectedProduct.quantity === 0
                                  ? "bg-red-400"
                                  : selectedProduct.quantity < maxStock * 0.3
                                  ? "bg-amber-400"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  (selectedProduct.quantity / maxStock) * 100 || 0
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                        {selectedProduct.description && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                            <p className="text-gray-600">{selectedProduct.description}</p>
                          </div>
                        )}

                        {/* Extra sections (mock data for now) */}
                        <div className="mt-5 space-y-3">
                          <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 border-b flex items-center gap-2">
                              <Info className="w-4 h-4 text-gray-500" />
                              <p className="text-sm font-semibold text-gray-800">
                                Usage & dosage
                              </p>
                            </div>
                            <div className="p-3 text-sm text-gray-600 space-y-2">
                              <p>
                                - Follow label directions and consult a vet for accurate dosage.
                              </p>
                              <p>
                                - For young/weak animals, start with a lower dose and monitor response.
                              </p>
                              <p className="text-xs text-gray-500">
                                Mock data: replace with real product instructions from backend.
                              </p>
                            </div>
                          </div>

                          <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 border-b flex items-center gap-2">
                              <Info className="w-4 h-4 text-gray-500" />
                              <p className="text-sm font-semibold text-gray-800">
                                Nutritional / composition info
                              </p>
                            </div>
                            <div className="p-3 text-sm text-gray-600 space-y-2">
                              <p>
                                - Active ingredients: varies by brand and formulation.
                              </p>
                              <p>
                                - Storage: keep in a cool, dry place away from sunlight.
                              </p>
                              <p className="text-xs text-gray-500">
                                Mock data: replace with real composition from backend.
                              </p>
                            </div>
                          </div>

                          <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 border-b flex items-center gap-2">
                              <MessageSquareText className="w-4 h-4 text-gray-500" />
                              <p className="text-sm font-semibold text-gray-800">
                                Reviews
                              </p>
                              <span className="ml-auto text-xs text-gray-500">
                                Mock
                              </span>
                            </div>
                            <div className="p-3 space-y-3">
                              {[
                                { name: "Farmer A", rating: 5, text: "Worked well. Fast delivery." },
                                { name: "Farmer B", rating: 4, text: "Good quality, packaging was nice." },
                                { name: "Farmer C", rating: 3, text: "Okay product, would buy again." },
                              ].map((r, idx) => (
                                <div key={idx} className="border border-gray-100 rounded-lg p-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium text-gray-800">{r.name}</p>
                                    <div className="flex items-center gap-0.5">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3 h-3 ${
                                            i + 1 <= r.rating
                                              ? "fill-yellow-400 text-yellow-400"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{r.text}</p>
                                </div>
                              ))}
                              <p className="text-xs text-gray-500">
                                Next step: connect to backend reviews + rating submission.
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            handleAddToCart(selectedProduct, 1);
                            setSelectedProduct(null);
                          }}
                          disabled={selectedProduct.quantity === 0 || cartLoading}
                          className="btn-primary w-full py-3"
                        >
                          {cartLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Add to Cart"}
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
          <CartSidebar
            cart={cart}
            onClose={() => setShowCart(false)}
            onUpdate={loadCart}
            cartTotal={cartTotal}
          />
        )}
      </div>
    </Layout>
  );
}

// Group cart by shop (provider_id / shop_name) for independent payments
function groupCartByShop(cart: CartItem[]): { shopName: string; providerId?: number; items: CartItem[]; subtotal: number }[] {
  const map = new Map<string | number, CartItem[]>();
  for (const item of cart) {
    const key = item.provider_id ?? "unknown";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries()).map(([key, items]) => {
    const first = items[0];
    const shopName = first?.shop_name || "Unknown shop";
    const providerId = typeof key === "number" ? key : undefined;
    const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.qty, 0);
    return { shopName, providerId, items, subtotal };
  });
}

function CartSidebar({
  cart,
  onClose,
  onUpdate,
  cartTotal,
}: {
  cart: CartItem[];
  onClose: () => void;
  onUpdate: () => void;
  cartTotal: number;
}) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "mpesa">(
    "paystack"
  );
  const [showCheckout, setShowCheckout] = useState(false);

  const cartByShop = groupCartByShop(cart);
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const singleShop = cartByShop.length === 1 ? cartByShop[0] : null;

  const handleUpdateQty = async (id: number, qty: number) => {
    if (qty < 1) return;
    setLoading(true);
    try {
      await updateCartItem(id, qty);
      await onUpdate();
    } catch {
      addToast("error", "Error", "Failed to update cart");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: number) => {
    setLoading(true);
    try {
      await removeFromCart(id);
      await onUpdate();
      addToast("success", "Success", "Removed from cart");
    } catch {
      addToast("error", "Error", "Failed to remove item");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!singleShop) {
      addToast(
        "error",
        "Multiple shops in cart",
        "For secure checkout, your cart must contain products from a single agrovet shop. Please clear your cart and try again."
      );
      return;
    }

    if (paymentMethod === "paystack") {
      if (!email.trim()) {
        addToast("error", "Error", "Please enter your email address");
        return;
      }

      // Basic email shape validation
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
        addToast("error", "Error", "Please enter a valid email address");
        return;
      }

      setLoading(true);
      try {
        // Some Paystack implementations expect amount in subunits.
        // We'll attempt with KES amount first, and retry with * 100 if needed.
        const tryInitialize = async (amount: number) => {
          const res = await initializePaystackPayment(
            Math.round(amount),
            email.trim(),
            singleShop.providerId
          );

          const authorizationUrl =
            res?.authorization_url ||
            res?.data?.authorization_url ||
            res?.data?.authorizationUrl ||
            res?.authorizationUrl ||
            res?.payment_url ||
            res?.data?.payment_url;

          return authorizationUrl as string | undefined;
        };

        let authorizationUrl = await tryInitialize(cartTotal);
        if (!authorizationUrl) {
          authorizationUrl = await tryInitialize(cartTotal * 100);
        }

        if (!authorizationUrl) {
          throw new Error("Missing Paystack authorization URL");
        }

        window.location.href = authorizationUrl;
      } catch (err: unknown) {
        addToast(
          "error",
          "Paystack initialization failed",
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error || "Unable to initialize Paystack payment"
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    // M-Pesa (mock STK, but create a real order via backend checkout)
    if (!mpesaPhone.trim()) {
      addToast("error", "Error", "Please enter your M-Pesa phone number");
      return;
    }

    setLoading(true);
    try {
      // Create a real order on the backend using the existing checkout endpoint.
      const order = await checkout(mpesaPhone.trim(), singleShop.providerId);

      // Clear cart locally to reflect backend state (checkout clears it server-side).
      await onUpdate();

      addToast(
        "success",
        "Order placed",
        `M-Pesa payment (mock) succeeded. Your order #${order.id} has been created.`
      );
      onClose();
    } catch (err: unknown) {
      addToast(
        "error",
        "Payment failed",
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "M-Pesa payment failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex">
      <div className="ml-auto w-full max-w-md bg-white h-full flex flex-col shadow-xl">
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold">Cart ({itemCount} {itemCount === 1 ? "item" : "items"})</h2>
            {singleShop && (
              <p className="text-sm text-gray-500 mt-0.5">Shopping at {singleShop.shopName}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cartByShop.map(({ shopName, items, subtotal }) => (
                <div key={shopName} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">{shopName}</p>
                    <p className="text-xs text-gray-500">{items.length} product(s) · KES {subtotal.toLocaleString()}</p>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3">
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {item.image_url ? (
                            <img src={`${serverBaseUrl}${item.image_url}`} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-full h-full text-gray-300 p-2" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                          <p className="text-sm text-gray-600">KES {Number(item.price).toLocaleString()} × {item.qty}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => handleUpdateQty(item.id, item.qty - 1)}
                              disabled={loading || item.qty <= 1}
                              className="p-1 border rounded disabled:opacity-50 text-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-medium w-6 text-center">{item.qty}</span>
                            <button
                              onClick={() => handleUpdateQty(item.id, item.qty + 1)}
                              disabled={loading || item.qty >= item.stock}
                              className="p-1 border rounded disabled:opacity-50 text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleRemove(item.id)}
                              disabled={loading}
                              className="ml-auto text-red-600 hover:text-red-700 text-xs"
                            >
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
        {cart.length > 0 && (
          <div className="border-t p-4 space-y-3 flex-shrink-0">
            {cartByShop.length > 1 && (
              <p className="text-xs text-amber-600">
                Note: For secure Paystack checkout, your cart must only contain
                products from a single agrovet shop.
              </p>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-green-600">KES {cartTotal.toLocaleString()}</span>
            </div>
            {!showCheckout ? (
              <button onClick={() => setShowCheckout(true)} className="btn-primary w-full py-3">
                Proceed to checkout
              </button>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("paystack")}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      paymentMethod === "paystack"
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Paystack
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("mpesa")}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      paymentMethod === "mpesa"
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    M-Pesa
                  </button>
                </div>

                {paymentMethod === "paystack" ? (
                  <input
                    type="email"
                    placeholder="Email for Paystack receipt"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field w-full"
                  />
                ) : (
                  <input
                    type="tel"
                    placeholder="M-Pesa phone (e.g. 254712345678)"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    className="input-field w-full"
                  />
                )}
                <button onClick={handleCheckout} disabled={loading} className="btn-primary w-full py-3">
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    paymentMethod === "paystack"
                      ? "Pay securely with Paystack"
                      : "Pay with M-Pesa (mock)"
                  )}
                </button>
                <button onClick={() => setShowCheckout(false)} className="btn-outline w-full py-2">
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

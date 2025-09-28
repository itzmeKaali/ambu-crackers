import { useEffect, useState } from "react";
import { g, j } from "../api";
import type { Product } from "../types";
import Select from "react-select";
import Default from "../assets/shop/products-def.jpg";
import useToast from "../pages/Toast/useToast";
import { ShoppingCart } from "lucide-react";

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast, ToastContainer } = useToast();
  const [categories, setCategories] = useState<string[]>([]);

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    coupon: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [couponApplied, setCouponApplied] = useState<string | null>(null);

  useEffect(() => {
    g("/api/products")
      .then((data: Product[]) => {
        setProducts(data || []);
        const cats = Array.from(
          new Set(data.map((p) => p.category).filter((c): c is string => Boolean(c)))
        );
        setCategories(cats.sort());
      })
      .catch(() => setProducts([]));
  }, []);

  const filteredProducts = category
    ? products.filter((p) => p.category === category)
    : products;

  function add(p: Product) {
    setCart((c) => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }));
  }

  function remove(p: Product) {
    setCart((c) => {
      const newCart = { ...c };
      if (newCart[p.id] > 1) newCart[p.id] -= 1;
      else delete newCart[p.id];
      return newCart;
    });
  }

  const items = products
    .filter((p) => cart[p.id])
    .map((p) => ({ ...p, quantity: cart[p.id] }));

  const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  function validateCustomer() {
    const errs: { [key: string]: string } = {};
    if (!customer.name.trim()) errs.name = "Full Name is required";
    if (!customer.phone.trim()) errs.phone = "Phone Number is required";
    if (!customer.address.trim()) errs.address = "Shipping Address is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function placeOrder() {
    if (!validateCustomer()) return;

    if (!items.length) {
      addToast("Add at least one product.", "warning");
      return;
    }

    const payload = {
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      customer_address: customer.address,
      items: items.map((p) => ({
        id: p.id,
        name: p.name,
        mrp: p.mrp,
        price: p.price,
        quantity: p.quantity,
      })),
      total,
      coupon_code: customer.coupon || null,
    };

    try {
      setLoading(true);
      const res = await j("/api/orders/quick-checkout", "POST", payload);
      addToast(`✅ Order placed! ID: ${res?.order_id || "-"}`, "success");
      setCart({});
      setCustomer({ name: "", email: "", phone: "", address: "", coupon: "" });
      setErrors({});
      setCouponApplied(null);
      setShowCart(false);
    } catch {
      addToast("❌ Failed to place order. Try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  const totalCartItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  // Helper for currency formatting
  const formatCurrency = (n: number) => `₹${n.toFixed(2)}`;

  // Cart items for overlay
  const selectedRows = products.filter((p) => cart[p.id]).map((p) => ({
    ...p,
    quantity: cart[p.id],
    amount: cart[p.id] * p.price,
  }));

  // Coupon/discount state for overlay
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);

  // Coupon code for overlay
  const [couponCode, setCouponCode] = useState("");

  // Coupon applying state
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Placing order state for overlay
  const [placing, setPlacing] = useState(false);

  // Overlay errors for customer info
  const [overlayErrors, setOverlayErrors] = useState<{ [key: string]: string }>({});

  // Overlay customer info
  const [overlayCustomer, setOverlayCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Sync overlay customer info with main customer state when cart opens
  useEffect(() => {
    if (showCart) {
      setOverlayCustomer({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      });
      setOverlayErrors({});
      setCouponCode("");
      setDiscountPercentage(0);
      setAppliedCouponCode(null);
    }
  }, [showCart]);

  // Calculate subtotal and discount amount
  const subtotal = selectedRows.reduce((sum, r) => sum + r.amount, 0);
  const discountAmount = (subtotal * discountPercentage) / 100;
  const finalTotal = subtotal - discountAmount;

  // Validate overlay customer info
  function validateOverlayCustomer() {
    const errs: { [key: string]: string } = {};
    if (!overlayCustomer.name.trim()) errs.name = "Full Name is required";
    if (!overlayCustomer.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(overlayCustomer.email)) errs.email = "Enter valid email.";
    if (!overlayCustomer.phone.trim()) errs.phone = "Phone Number is required";
    else if (!/^[0-9]{10}$/.test(overlayCustomer.phone)) errs.phone = "Enter valid 10-digit phone.";
    if (!overlayCustomer.address.trim()) errs.address = "Shipping Address is required";
    setOverlayErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // Overlay place order
  async function overlayPlaceOrder() {
    if (!validateOverlayCustomer()) return;
    if (!selectedRows.length) {
      addToast("Add at least one product.", "warning");
      return;
    }
    const payload = {
      customer_name: overlayCustomer.name,
      customer_email: overlayCustomer.email,
      customer_phone: overlayCustomer.phone,
      customer_address: overlayCustomer.address,
      items: selectedRows.map((p) => ({
        id: p.id,
        name: p.name,
        mrp: p.mrp,
        price: p.price,
        quantity: p.quantity,
      })),
      total: finalTotal,
      coupon_code: appliedCouponCode,
    };
    try {
      setPlacing(true);
      const res = await j("/api/orders/quick-checkout", "POST", payload);
      addToast(`✅ Order placed! ID: ${res?.order_id || "-"}`, "success");
      setCart({});
      setOverlayCustomer({ name: "", email: "", phone: "", address: "" });
      setOverlayErrors({});
      setDiscountPercentage(0);
      setAppliedCouponCode(null);
      setCouponCode("");
      setShowCart(false);
    } catch {
      addToast("❌ Failed to place order. Try again.", "error");
    } finally {
      setPlacing(false);
    }
  }

  // Overlay apply coupon
  async function overlayApplyCoupon() {
    if (!couponCode.trim()) {
      addToast("Please enter a coupon code", "info");
      return;
    }
    
    setApplyingCoupon(true);
    try {
      const response = await g(`/api/orders/apply-coupon?code=${encodeURIComponent(couponCode.trim())}`);
      
      if (response && typeof response.discount_value === "number" && response.discount_value > 0) {
        setDiscountPercentage(response.discount_value);
        setAppliedCouponCode(couponCode.trim());
        addToast(`✅ Coupon applied! You got ${response.discount_value}% off.`, "success");
      } else {
        addToast("❌ Invalid coupon code.", "error");
      }
    } catch (error: any) {
      console.error("Coupon apply error:", error);
      addToast("❌ Invalid coupon code", "error");
    } finally {
      setApplyingCoupon(false);
    }
  }

  // Remove applied coupon
  function removeCoupon() {
    setDiscountPercentage(0);
    setAppliedCouponCode(null);
    setCouponCode("");
    addToast("Coupon removed", "info");
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-orange-50 via-white to-red-50 pb-24 font-sans relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-red-700 mb-8">
          ✨ Premium Fireworks Collection
        </h2>

        {/* Category Filter */}
        <div className="mb-8 max-w-sm mx-auto">
          <Select
            options={categoryOptions}
            value={categoryOptions.find((opt) => opt.value === category)}
            onChange={(opt) => setCategory(opt?.value || "")}
            classNamePrefix="react-select"
            placeholder="Select category"
          />
        </div>

        {/* Product Grid */}
        <div className="grid gap-4 sm:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((p) => (
            <div key={p.id} className="flex flex-col bg-white rounded-lg shadow overflow-hidden">
              <div className="relative w-full h-36 sm:h-40 md:h-44 lg:h-48 bg-gray-100 overflow-hidden">
                <img
                  src={p.image_url || Default}
                  alt={p.name}
                  className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                />
                {cart[p.id] > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                    {cart[p.id]}
                  </span>
                )}
              </div>

              <div className="p-3 flex flex-col flex-1">
                <h4 className="text-sm sm:text-base font-medium text-gray-800 line-clamp-2 mb-1">
                  {p.name}
                </h4>
                {p.mrp && p.mrp > p.price && (
                  <p className="text-xs text-gray-400 line-through">₹ {p.mrp}</p>
                )}
                <p className="text-lg font-bold text-green-600 mb-2">₹ {p.price}</p>

                <button
                  onClick={() => add(p)}
                  className="w-full py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold rounded hover:scale-105 transition-transform flex items-center justify-center gap-1"
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Cart Button */}
        {totalCartItems > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="fixed bottom-5 left-5 bg-gradient-to-r from-red-600 to-orange-500 text-white p-4 rounded-full shadow-lg z-50 animate-bounce flex items-center justify-center"
          >
            <ShoppingCart size={22} />
            <span className="absolute -top-1 -right-1 bg-white text-red-600 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold border border-red-300">
              {totalCartItems}
            </span>
          </button>
        )}

        {/* Full-page Cart Overlay */}
        {showCart && (
          <div className="fixed inset-0 z-50 bg-white overflow-y-auto min-h-screen p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-red-600 flex items-center space-x-3">
                  <ShoppingCart size={30} /> <span>Your Cart</span>
                </h2>
                <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Close cart">✕</button>
              </div>

              {selectedRows.length === 0 ? (
                <div className="text-center text-gray-500 py-20 text-lg">
                  <p className="mb-4">Your cart is empty.</p>
                  <button onClick={() => setShowCart(false)} className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center justify-center mx-auto">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop Table for Cart */}
                  <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm mb-8">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-red-50 to-orange-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tl-lg">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">MRP</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {selectedRows.map((r) => (
                          <tr key={r.id} className="hover:bg-red-50 transition-colors duration-200">
                            <td className="px-6 py-4 flex items-center space-x-3">
                              <img src={r.image_url || Default} alt={r.name} className="w-16 h-16 object-cover rounded-md shadow-sm border border-gray-100" />
                              <div className="font-medium text-gray-900 text-base">{r.name}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 line-through">{formatCurrency(r.mrp)}</td>
                            <td className="px-6 py-4 text-base font-semibold text-red-600">{formatCurrency(r.price)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setCart((c) => ({ ...c, [r.id]: Math.max(0, (c[r.id] || 0) - 1) }))}
                                  className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-150 transform hover:scale-105"
                                  aria-label="Decrease quantity"
                                >
                                  -
                                </button>
                                <span className="px-3 py-1 min-w-[40px] text-center rounded-md border border-gray-300 bg-gray-50 text-gray-800 font-semibold text-sm shadow-inner">
                                  {r.quantity}
                                </span>
                                <button
                                  onClick={() => setCart((c) => ({ ...c, [r.id]: (c[r.id] || 0) + 1 }))}
                                  className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors duration-150 transform hover:scale-105"
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-lg font-extrabold text-gray-800">{formatCurrency(r.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4 border border-blue-100">
                    <h3 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-4 flex items-center space-x-2">
                      <span>Customer Information & Checkout</span>
                    </h3>
                    <form onSubmit={(e) => { e.preventDefault(); overlayPlaceOrder(); }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="mb-4">
                          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                          <input value={overlayCustomer.name} onChange={(e) => setOverlayCustomer((c) => ({ ...c, name: e.target.value }))}
                            className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all ${overlayErrors.name ? "border-red-500" : "border-gray-300"}`} />
                          {overlayErrors.name && <p className="mt-1 text-xs text-red-600">{overlayErrors.name}</p>}
                        </div>
                        <div className="mb-4">
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                          <input type="email" value={overlayCustomer.email} onChange={(e) => setOverlayCustomer((c) => ({ ...c, email: e.target.value }))}
                            className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all ${overlayErrors.email ? "border-red-500" : "border-gray-300"}`} />
                          {overlayErrors.email && <p className="mt-1 text-xs text-red-600">{overlayErrors.email}</p>}
                        </div>
                        <div className="mb-4">
                          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                          <input type="tel" value={overlayCustomer.phone} onChange={(e) => setOverlayCustomer((c) => ({ ...c, phone: e.target.value }))}
                            className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all ${overlayErrors.phone ? "border-red-500" : "border-gray-300"}`} />
                          {overlayErrors.phone && <p className="mt-1 text-xs text-red-600">{overlayErrors.phone}</p>}
                        </div>
                        <div className="mb-4">
                          <label htmlFor="coupon" className="block text-sm font-semibold text-gray-700 mb-2">Coupon Code (Optional)</label>
                          {appliedCouponCode ? (
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <span className="text-green-700 font-medium">✅ {appliedCouponCode} applied ({discountPercentage}% off)</span>
                              <button 
                                type="button" 
                                onClick={removeCoupon}
                                className="ml-auto px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <input 
                                value={couponCode} 
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="Enter coupon code"
                                className="flex-1 rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all border-gray-300" 
                              />
                              <button 
                                type="button" 
                                onClick={overlayApplyCoupon}
                                disabled={applyingCoupon || !couponCode.trim()}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {applyingCoupon ? "Applying..." : "Apply"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">Shipping Address</label>
                        <textarea value={overlayCustomer.address} onChange={(e) => setOverlayCustomer((c) => ({ ...c, address: e.target.value }))}
                          rows={3} className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all ${overlayErrors.address ? "border-red-500" : "border-gray-300"}`} />
                        {overlayErrors.address && <p className="mt-1 text-xs text-red-600">{overlayErrors.address}</p>}
                      </div>

                      {/* Order Summary */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h4 className="font-semibold text-gray-700 mb-3">Order Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(subtotal)}</span>
                          </div>
                          {discountPercentage > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount ({discountPercentage}% off):</span>
                              <span>-{formatCurrency(discountAmount)}</span>
                            </div>
                          )}
                          <hr className="my-2" />
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span className="text-indigo-700">{formatCurrency(finalTotal)}</span>
                          </div>
                        </div>
                      </div>

                      <button type="submit" disabled={placing} className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold text-lg shadow-lg hover:scale-[1.01] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                        {placing ? "Placing Order..." : `Place Order - ${formatCurrency(finalTotal)}`}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
      <ToastContainer />
    </div>
  );
}
import React, { useEffect, useState, useMemo } from "react";
import { g, j } from "../api";
import type { Product } from "../types";
import Select from "react-select";
import useToast from "../pages/Toast/useToast";
import { FaPlus, FaMinus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ShoppingCart } from "lucide-react";

// ---------------- Subcomponents ---------------- //
function Field({ id, label, children, error }: { id: string; label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div>{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function ProductCardMobile({ r, setQty, formatCurrency }: { r: any; setQty: React.Dispatch<React.SetStateAction<Record<string, number>>>; formatCurrency: (n: number) => string; }) {
  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center space-x-4">
      <img src={r.image_url || "/default-image.jpg"} alt={r.name} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
      <div className="flex-grow">
        <h4 className="text-base font-bold text-gray-800 mb-1 leading-tight">{r.name}</h4>
        <div className="flex items-baseline space-x-2 mb-2">
          <span className="text-sm text-gray-400 line-through">{formatCurrency(r.mrp)}</span>
          <span className="text-lg font-extrabold text-red-600">{formatCurrency(r.price)}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <button onClick={() => setQty((q) => ({ ...q, [r.id]: Math.max(0, (q[r.id] || 0) - 1) }))}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
              <FaMinus className="text-sm" />
            </button>
            <span className="px-3 py-1 min-w-[35px] text-center rounded-md border border-gray-200 bg-white text-gray-800 font-medium text-sm">{r.quantity}</span>
            <button onClick={() => setQty((q) => ({ ...q, [r.id]: (q[r.id] || 0) + 1 }))}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
              <FaPlus className="text-sm" />
            </button>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Amount</div>
            <div className="text-lg font-bold text-gray-700">{formatCurrency(r.amount)}</div>
          </div>
        </div>
      </div>
    </article>
  );
}

// ---------------- Main Component ---------------- //
const ITEMS_PER_PAGE = 10;

export default function QuickCheckout() {
  const [products, setProducts] = useState<Product[]>([]);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [cust, setCust] = useState({ name: "", email: "", phone: "", address: "" });
  const [couponCode, setCouponCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    g("/api/products")
      .then((data) => mounted && setProducts(Array.isArray(data) ? data : []))
      .catch(() => mounted && setProducts([]))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
  const categoryOptions = useMemo(() => [
    { value: "", label: "All Categories" },
    ...categories.map((c) => ({ value: c, label: c })),
  ], [categories]);

  const filteredProducts = useMemo(() => (
    category ? products.filter((p) => p.category === category) : products
  ), [products, category]);

  const rows = useMemo(() => filteredProducts.map((p) => ({
    ...p,
    quantity: qty[p.id] || 0,
    amount: (qty[p.id] || 0) * p.price,
  })), [filteredProducts, qty]);

  const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE);
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return rows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [rows, currentPage]);

  const subtotal = rows.reduce((s, r) => s + (r.amount || 0), 0);
  const discountAmount = (subtotal * discountPercentage) / 100;
  const totalAmount = subtotal - discountAmount;
  const formatCurrency = (n: number) => `₹${n.toFixed(2)}`;

  const selectedRows = rows.filter(r => r.quantity > 0); // Only selected items in cart

  useEffect(() => { setCurrentPage(1); }, [category]);
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!cust.name.trim()) newErrors.name = "Name is required.";
    if (!cust.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(cust.email)) newErrors.email = "Enter valid email.";
    if (!cust.phone.trim()) newErrors.phone = "Phone is required.";
    else if (!/^[0-9]{10}$/.test(cust.phone)) newErrors.phone = "Enter valid 10-digit phone.";
    if (!cust.address.trim()) newErrors.address = "Address is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function placeOrder() {
    if (!validate()) return;
    const items = selectedRows.map((r) => ({
      id: r.id, name: r.name, mrp: r.mrp, price: r.price, quantity: r.quantity
    }));
    if (!items.length) { addToast("Add at least one product.", "warning"); return; }

    const payload = {
      customer_name: cust.name, customer_email: cust.email, customer_phone: cust.phone,
      customer_address: cust.address, items, total: totalAmount, coupon_code: appliedCouponCode
    };

    try {
      setPlacing(true);
      const res = await j("/api/orders/quick-checkout", "POST", payload);
      addToast(`✅ Order #${res?.order_id || "-"} confirmed! Email sent (check spam folder if needed)`, "success");      
      setQty({}); 
      setCust({ name: "", email: "", phone: "", address: "" }); 
      setErrors({}); 
      setDiscountPercentage(0);
      setAppliedCouponCode(null);
      setCouponCode("");
    } catch {
      addToast("❌ Failed to place order. Try again.", "error");
    } finally { setPlacing(false); setShowCart(false); }
  }

  const applyCoupon = async () => {
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
  };

  // Remove applied coupon
  function removeCoupon() {
    setDiscountPercentage(0);
    setAppliedCouponCode(null);
    setCouponCode("");
    addToast("Coupon removed", "info");
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center font-sans">
      <div className="w-full max-w-7xl space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center">Quick Checkout</h1>

        {/* Category + Products */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl p-6 relative">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Products</h2>
              <div className="w-full sm:w-64">
                <Select
                  options={categoryOptions}
                  value={categoryOptions.find((opt) => opt.value === category)}
                  onChange={(opt) => setCategory(opt?.value || "")}
                  classNamePrefix="react-select"
                  styles={{ control: (base) => ({ ...base, borderRadius: "0.75rem", borderColor: "#e5e7eb", padding: "4px", boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)" }) }}
                />
              </div>
            </div>

            {loading && <div className="text-center text-gray-600 py-10">Loading products…</div>}
            {!loading && rows.length === 0 && <div className="text-center text-gray-500 py-10">No products found.</div>}

            {/* Mobile View - Product Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-4 mb-6">
              {rows.map((r) => (
                <ProductCardMobile key={r.id} r={r} setQty={setQty} formatCurrency={formatCurrency} />
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tl-lg">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">MRP</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-6 py-4 flex items-center space-x-3">
                        <img src={r.image_url || "/default-image.jpg"} alt={r.name} className="w-16 h-16 object-cover rounded-md shadow-sm border border-gray-100" />
                        <div className="font-medium text-gray-900 text-base">{r.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 line-through">{formatCurrency(r.mrp)}</td>
                      <td className="px-6 py-4 text-base font-semibold text-green-600">{formatCurrency(r.price)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setQty((q) => ({ ...q, [r.id]: Math.max(0, (q[r.id] || 0) - 1) }))}
                            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-150 transform hover:scale-105"
                            aria-label="Decrease quantity"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="px-3 py-1 min-w-[40px] text-center rounded-md border border-gray-300 bg-gray-50 text-gray-800 font-semibold text-sm shadow-inner">
                            {r.quantity}
                          </span>
                          <button
                            onClick={() => setQty((q) => ({ ...q, [r.id]: (q[r.id] || 0) + 1 }))}
                            className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors duration-150 transform hover:scale-105"
                            aria-label="Increase quantity"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-lg font-extrabold text-gray-800">{formatCurrency(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/*{totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-6">
                <button onClick={goToPrevPage} disabled={currentPage === 1} className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform">
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
                <button onClick={goToNextPage} disabled={currentPage === totalPages} className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform">
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}*/}
          </div>
        </section>

        {/* Floating Cart Button */}
        {selectedRows.length > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="fixed bottom-5 left-5 bg-gradient-to-r from-red-600 to-orange-500 text-white p-4 rounded-full shadow-lg z-50 animate-bounce flex items-center justify-center transform hover:scale-110 transition-transform"
            aria-label={`View cart with ${selectedRows.length} items`}
          >
            <ShoppingCart size={22} />
            <span className="absolute -top-1 -right-1 bg-white text-red-600 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold border border-red-300">
              {selectedRows.length}
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
                    <FaChevronLeft className="mr-2" /> Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  {/* Mobile Cards for Cart */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden mb-6">
                    {selectedRows.map((r) => <ProductCardMobile key={r.id} r={r} setQty={setQty} formatCurrency={formatCurrency} />)}
                  </div>

                  {/* Desktop Table for Cart */}
                  <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg shadow-sm mb-8">
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
                              <img src={r.image_url || "/default-image.jpg"} alt={r.name} className="w-16 h-16 object-cover rounded-md shadow-sm border border-gray-100" />
                              <div className="font-medium text-gray-900 text-base">{r.name}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 line-through">{formatCurrency(r.mrp)}</td>
                            <td className="px-6 py-4 text-base font-semibold text-red-600">{formatCurrency(r.price)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setQty((q) => ({ ...q, [r.id]: Math.max(0, (q[r.id] || 0) - 1) }))}
                                  className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-150 transform hover:scale-105"
                                  aria-label="Decrease quantity"
                                >
                                  <FaMinus className="text-xs" />
                                </button>
                                <span className="px-3 py-1 min-w-[40px] text-center rounded-md border border-gray-300 bg-gray-50 text-gray-800 font-semibold text-sm shadow-inner">
                                  {r.quantity}
                                </span>
                                <button
                                  onClick={() => setQty((q) => ({ ...q, [r.id]: (q[r.id] || 0) + 1 }))}
                                  className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors duration-150 transform hover:scale-105"
                                  aria-label="Increase quantity"
                                >
                                  <FaPlus className="text-xs" />
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
                    <form onSubmit={(e) => { e.preventDefault(); placeOrder(); }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <Field id="name" label="Full Name" error={errors.name}>
                          <input value={cust.name} onChange={(e) => setCust((c) => ({ ...c, name: e.target.value }))}
                            className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all ${errors.name ? "border-red-500" : "border-gray-300"}`} />
                        </Field>
                        <Field id="email" label="Email" error={errors.email}>
                          <input type="email" value={cust.email} onChange={(e) => setCust((c) => ({ ...c, email: e.target.value }))}
                            className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all ${errors.email ? "border-red-500" : "border-gray-300"}`} />
                        </Field>
                        <Field id="phone" label="Phone Number" error={errors.phone}>
                          <input type="tel" value={cust.phone} onChange={(e) => setCust((c) => ({ ...c, phone: e.target.value }))}
                            className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all ${errors.phone ? "border-red-500" : "border-gray-300"}`} />
                        </Field>
                        <Field id="coupon" label="Coupon Code (Optional)">
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
                                onClick={applyCoupon}
                                disabled={applyingCoupon || !couponCode.trim()}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {applyingCoupon ? "Applying..." : "Apply"}
                              </button>
                            </div>
                          )}
                        </Field>
                      </div>
                      <Field id="address" label="Shipping Address" error={errors.address}>
                        <textarea value={cust.address} onChange={(e) => setCust((c) => ({ ...c, address: e.target.value }))}
                          rows={3} className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all ${errors.address ? "border-red-500" : "border-gray-300"}`} />
                      </Field>

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
                            <span className="text-indigo-700">{formatCurrency(totalAmount)}</span>
                          </div>
                        </div>
                      </div>

                      <button type="submit" disabled={placing} className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold text-lg shadow-lg hover:scale-[1.01] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                        {placing ? "Placing Order..." : `Place Order - ${formatCurrency(totalAmount)}`}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <ToastContainer />
      </div>
    </main>
  );
}
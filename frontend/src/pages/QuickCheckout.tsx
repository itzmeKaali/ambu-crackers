import React, { useEffect, useState } from "react";
import TableQty from "../components/TableQty";
import { g, j } from "../api";
import type { Product } from "../types";

// QuickCheckout_Refined_Design.jsx
// Single-file, production-ready Tailwind + React component.
// - Accessible form controls
// - Improved responsive layout (grid on desktop, stacked on mobile)
// - Reusable subcomponents (Field, ProductRow/ProductCard)
// - Lightweight micro-interactions and animations via Tailwind
// - Clear validation UI, better spacing, and semantic markup

export default function QuickCheckout() {
  const [products, setProducts] = useState<Product[]>([]);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [cust, setCust] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    g("/api/products")
      .then((data) => mounted && setProducts(Array.isArray(data) ? data : []))
      .catch(() => mounted && setProducts([]))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Derived rows and total
  const rows = products.map((p) => ({
    ...p,
    quantity: qty[p.id] || 0,
    amount: (qty[p.id] || 0) * p.price,
  }));
  const total = rows.reduce((s, r) => s + (r.amount || 0), 0);

  // Helpers
  const formatCurrency = (n: number) => `₹${n.toFixed(2)}`;

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!cust.name.trim()) newErrors.name = "Name is required.";
    if (!cust.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(cust.email)) {
      newErrors.email = "Enter a valid email.";
    }
    if (!cust.phone.trim()) {
      newErrors.phone = "Phone is required.";
    } else if (!/^[0-9]{10}$/.test(cust.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number.";
    }
    if (!cust.address.trim()) newErrors.address = "Address is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function placeOrder() {
    if (!validate()) {
      // scroll to first error for better UX
      const el = document.querySelector("[aria-invalid='true']");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const items = rows
      .filter((r) => r.quantity > 0)
      .map((r) => ({
        id: r.id,
        name: r.name,
        mrp: r.mrp,
        price: r.price,
        quantity: r.quantity,
      }));

    if (items.length === 0) {
      setErrors((prev) => ({ ...prev, items: "Please add at least one product." }));
      return;
    }

    const payload = {
      customer_name: cust.name,
      customer_email: cust.email,
      customer_phone: cust.phone,
      customer_address: cust.address,
      items,
      total,
    };

    try {
      setPlacing(true);
      const res = await j("/api/orders/quick-checkout", "POST", payload);
      // success toast - keep simple for single file
      alert(`Order placed! ID: ${res?.order_id || "-"}`);
      // reset
      setQty({});
      setCust({ name: "", email: "", phone: "", address: "" });
      setErrors({});
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  // --- Small presentational subcomponents ---
  function Field({
    id,
    label,
    children,
    error,
  }: {
    id: string;
    label: string;
    children: React.ReactNode;
    error?: string;
  }) {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-semibold text-red-700 mb-2">
          {label}
        </label>
        <div>{children}</div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  function ProductRow({ r }: { r: any }) {
    return (
      <tr className="group hover:bg-yellow-50 transition-colors" key={r.id}>
        <td className="px-3 py-3 whitespace-nowrap">
          <div className="text-sm font-semibold text-gray-800">{r.name}</div>
          <div className="text-xs text-gray-500">HSN: {r.hsn || "-"}</div>
        </td>
        <td className="px-3 py-3 text-sm text-gray-600">{formatCurrency(r.mrp)}</td>
        <td className="px-3 py-3 text-sm font-bold text-red-600">{formatCurrency(r.price)}</td>
        <td className="px-3 py-3">
          <TableQty value={r.quantity} onChange={(n) => setQty((q) => ({ ...q, [r.id]: n }))} />
        </td>
        <td className="px-3 py-3 text-sm font-extrabold text-orange-700">{formatCurrency(r.amount)}</td>
      </tr>
    );
  }

  function ProductCard({ r }: { r: any }) {
    return (
      <article
        aria-label={`${r.name} — ₹${r.price}`}
        className="relative p-4 rounded-2xl shadow-md border border-red-50 bg-gradient-to-br from-white via-red-50 to-orange-50"
      >
        {r.mrp > r.price && (
          <div className="absolute -top-2 -left-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-br-2xl">SAVE ₹{r.mrp - r.price}</div>
        )}
        <h4 className="text-lg font-extrabold text-gray-800 mb-2">{r.name}</h4>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-sm text-gray-400 line-through">{formatCurrency(r.mrp)}</span>
          <span className="text-2xl font-bold text-red-600">{formatCurrency(r.price)}</span>
        </div>
        <div className="flex items-center justify-between">
          <TableQty value={r.quantity} onChange={(n) => setQty((q) => ({ ...q, [r.id]: n }))} />
          <div className="text-right">
            <div className="text-sm text-gray-600">Amount</div>
            <div className="text-lg font-extrabold text-orange-700">{formatCurrency(r.amount)}</div>
          </div>
        </div>
      </article>
    );
  }

  // --- Render ---
  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-red-50 via-yellow-50 to-orange-100 flex items-start justify-center">
      <div className="w-full max-w-6xl">
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-red-700 tracking-tight">Quick Checkout</h1>
          <p className="mt-1 text-sm text-gray-600">Fast, accessible checkout — optimized for phones and desktops.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Customer */}
          <div className="lg:col-span-1 bg-white/90 p-6 rounded-3xl shadow-md border border-red-50">
            <h2 className="text-lg font-bold text-red-600 mb-4">Customer Details</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                placeOrder();
              }}
              className="flex flex-col gap-4"
            >
              <Field id="name" label="Full name" error={errors.name}>
                <input
                  id="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "err-name" : undefined}
                  className={`w-full rounded-lg border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-300 shadow-sm ${errors.name ? "border-red-500" : "border-red-200"}`}
                  placeholder="e.g. M. Kumar"
                  value={cust.name}
                  onChange={(e) => setCust((s) => ({ ...s, name: e.target.value }))}
                />
              </Field>

              <Field id="email" label="Email" error={errors.email}>
                <input
                  id="email"
                  type="email"
                  aria-invalid={!!errors.email}
                  className={`w-full rounded-lg border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-300 shadow-sm ${errors.email ? "border-red-500" : "border-red-200"}`}
                  placeholder="you@example.com"
                  value={cust.email}
                  onChange={(e) => setCust((s) => ({ ...s, email: e.target.value }))}
                />
              </Field>

              <Field id="phone" label="Phone" error={errors.phone}>
                <input
                  id="phone"
                  inputMode="numeric"
                  aria-invalid={!!errors.phone}
                  className={`w-full rounded-lg border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-300 shadow-sm ${errors.phone ? "border-red-500" : "border-red-200"}`}
                  placeholder="10-digit phone"
                  value={cust.phone}
                  onChange={(e) => setCust((s) => ({ ...s, phone: e.target.value }))}
                />
              </Field>

              <Field id="address" label="Address" error={errors.address}>
                <textarea
                  id="address"
                  aria-invalid={!!errors.address}
                  className={`w-full rounded-lg border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-300 shadow-sm resize-none min-h-[90px] ${errors.address ? "border-red-500" : "border-red-200"}`}
                  placeholder="Street, city, pincode"
                  value={cust.address}
                  onChange={(e) => setCust((s) => ({ ...s, address: e.target.value }))}
                />
              </Field>

              <div className="mt-2">
                <button
                  type="submit"
                  disabled={placing}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-400 text-white font-bold shadow-lg hover:scale-[1.02] transform transition"
                >
                  {placing ? "Placing order..." : "Place Order"}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Products & Total */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/95 p-6 rounded-3xl shadow-md border border-red-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-red-600">Items</h2>
                <div className="text-sm text-gray-600">Selected: {rows.filter((r) => r.quantity > 0).length}</div>
              </div>

              {/* Desktop Table */}
              <div className="mt-4 hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm md:text-base rounded-xl overflow-hidden">
                  <thead className="bg-gradient-to-r from-red-100 to-yellow-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-red-700">Product</th>
                      <th className="px-3 py-2 text-left font-semibold text-red-700">MRP</th>
                      <th className="px-3 py-2 text-left font-semibold text-red-700">Price</th>
                      <th className="px-3 py-2 text-left font-semibold text-red-700">Qty</th>
                      <th className="px-3 py-2 text-left font-semibold text-red-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows.map((r) => (
                      <ProductRow key={r.id} r={r} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Grid */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                {rows.map((r) => (
                  <ProductCard key={r.id} r={r} />
                ))}
              </div>

              {errors.items && <p className="mt-3 text-sm text-red-600">{errors.items}</p>}
            </div>

            {/* Summary / Checkout bar */}
            <div className="sticky bottom-4">
              <div className="bg-white/95 p-5 rounded-3xl shadow-lg border border-red-50 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="text-2xl font-extrabold text-red-700">{formatCurrency(total)}</div>
                  <div className="text-xs text-gray-500 mt-1">Incl. taxes where applicable</div>
                </div>

                <div className="w-full md:w-auto flex gap-3">
                  <button
                    onClick={() => setQty({})}
                    className="px-4 py-2 rounded-xl border border-red-200 text-sm font-semibold hover:bg-red-50 transition"
                  >
                    Reset
                  </button>

                  <button
                    onClick={placeOrder}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-400 text-white font-bold hover:scale-105 transition"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Loading state */}
        {loading && (
          <div className="mt-6 text-center text-gray-600">Loading products…</div>
        )}
      </div>
    </main>
  );
}

import React, { useEffect, useState } from "react";
import { g, j } from "../api";
import type { Product } from "../types";

// ---------------- Subcomponents ---------------- //
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
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-red-700 mb-2"
      >
        {label}
      </label>
      <div>{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function ProductRow({
  r,
  setQty,
  formatCurrency,
}: {
  r: any;
  setQty: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  formatCurrency: (n: number) => string;
}) {
  return (
    <>
      {/* 🖥️ Desktop Table Row */}
      <tr
        key={r.id}
        className="hidden md:table-row group hover:bg-gradient-to-r hover:from-yellow-50 hover:to-red-50 transition-colors duration-200 border-b border-gray-200"
      >
        {/* Product */}
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="text-sm font-semibold text-gray-900">{r.name}</div>
        </td>

        {/* MRP */}
        <td className="px-4 py-4 text-sm text-gray-500 line-through">
          {formatCurrency(r.mrp)}
        </td>

        {/* Price */}
        <td className="px-4 py-4 text-sm font-bold text-green-600">
          {formatCurrency(r.price)}
        </td>

        {/* Qty with + - */}
        <td className="px-4 py-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                setQty((q) => ({ ...q, [r.id]: Math.max(0, (q[r.id] || 0) - 1) }))
              }
              className="w-9 h-9 flex items-center justify-center rounded-full bg-red-100 text-red-600 font-bold text-lg shadow-sm hover:bg-red-200 hover:scale-105 transition"
            >
              −
            </button>
            <span className="px-4 py-1 min-w-[45px] text-center rounded-md border border-gray-200 bg-gray-50 text-gray-800 font-semibold">
              {r.quantity}
            </span>
            <button
              onClick={() =>
                setQty((q) => ({ ...q, [r.id]: (q[r.id] || 0) + 1 }))
              }
              className="w-9 h-9 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-lg shadow-sm hover:bg-green-200 hover:scale-105 transition"
            >
              +
            </button>
          </div>
        </td>

        {/* Amount */}
        <td className="px-4 py-4 text-sm font-extrabold text-red-700">
          {formatCurrency(r.amount)}
        </td>
      </tr>

      {/* 📱 Mobile Card */}
      <div
        key={r.id}
        className="md:hidden p-4 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col space-y-4 mb-4 transition hover:shadow-xl"
      >
        {/* Product Info */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{r.name}</h3>
            <p className="text-xs text-gray-500">HSN: {r.hsn || "—"}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(r.mrp)}
              </span>
              <span className="text-base font-bold text-green-600">
                {formatCurrency(r.price)}
              </span>
            </div>
          </div>

          {/* Amount */}
          <span className="text-lg font-extrabold text-red-700">
            {formatCurrency(r.amount)}
          </span>
        </div>

        {/* Qty Controller */}
        <div className="flex items-center justify-center space-x-4 pt-2">
          <button
            onClick={() =>
              setQty((q) => ({ ...q, [r.id]: Math.max(0, (q[r.id] || 0) - 1) }))
            }
            className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-red-600 font-bold text-2xl shadow hover:bg-red-200 hover:scale-105 transition"
          >
            −
          </button>
          <span className="px-5 py-2 min-w-[55px] text-center rounded-lg border border-gray-200 bg-gray-50 text-gray-800 font-bold text-lg">
            {r.quantity}
          </span>
          <button
            onClick={() =>
              setQty((q) => ({ ...q, [r.id]: (q[r.id] || 0) + 1 }))
            }
            className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-2xl shadow hover:bg-green-200 hover:scale-105 transition"
          >
            +
          </button>
        </div>
      </div>
    </>
  );
}


function ProductCard({
  r,
  setQty,
  formatCurrency,
}: {
  r: any;
  setQty: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  formatCurrency: (n: number) => string;
}) {
  return (
    <article
      aria-label={`${r.name} — ₹${r.price}`}
      className="relative p-5 rounded-2xl shadow-lg border border-red-100 bg-gradient-to-br from-white via-red-50 to-orange-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* 🔖 Discount Ribbon */}
      {r.mrp > r.price && (
        <div className="absolute -top-2 -left-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-tr-xl rounded-bl-2xl shadow">
          SAVE ₹{r.mrp - r.price}
        </div>
      )}

      {/* 🏷️ Product Title */}
      <h4 className="text-lg font-extrabold text-gray-800 mb-2">{r.name}</h4>

      {/* 💰 Price Section */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-sm text-gray-400 line-through">
          {formatCurrency(r.mrp)}
        </span>
        <span className="text-2xl font-bold text-red-600 drop-shadow-sm">
          {formatCurrency(r.price)}
        </span>
      </div>

      {/* ➕➖ Qty & Amount */}
      <div className="flex items-center justify-between">
        {/* Qty Controller */}
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setQty((q) => ({ ...q, [r.id]: Math.max(0, (q[r.id] || 0) - 1) }))
            }
            className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 text-red-600 font-bold text-2xl shadow hover:scale-110 active:scale-95 transition"
          >
            −
          </button>

          <span className="px-5 py-2 min-w-[55px] text-center rounded-full border border-gray-300 bg-white text-gray-900 font-bold text-lg shadow-sm">
            {r.quantity}
          </span>

          <button
            onClick={() =>
              setQty((q) => ({ ...q, [r.id]: (q[r.id] || 0) + 1 }))
            }
            className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200 text-green-600 font-bold text-2xl shadow hover:scale-110 active:scale-95 transition"
          >
            +
          </button>
        </div>

        {/* Amount */}
        <div className="text-right">
          <div className="text-xs text-gray-500">Amount</div>
          <div className="text-xl font-extrabold text-orange-700">
            {formatCurrency(r.amount)}
          </div>
        </div>
      </div>
    </article>
  );
}


// ---------------- Main Component ---------------- //
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
      setErrors((prev) => ({
        ...prev,
        items: "Please add at least one product.",
      }));
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
      alert(`Order placed! ID: ${res?.order_id || "-"}`);
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

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-red-50 via-yellow-50 to-orange-100 flex items-start justify-center">
      <div className="w-full max-w-6xl">
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-red-700 tracking-tight">
            Quick Checkout
          </h1>
          {/* <p className="mt-1 text-sm text-gray-600">
            Fast, accessible checkout — optimized for phones and desktops.
          </p> */}
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Customer */}
          <div className="lg:col-span-1 bg-white/90 p-6 rounded-3xl shadow-md border border-red-50">
            <h2 className="text-lg font-bold text-red-600 mb-4">
              Customer Details
            </h2>

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
                  className={`w-full rounded-lg border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-300 shadow-sm ${errors.name ? "border-red-500" : "border-red-200"
                    }`}
                  placeholder="e.g. M. Kumar"
                  value={cust.name}
                  onChange={(e) =>
                    setCust((s) => ({ ...s, name: e.target.value }))
                  }
                />
              </Field>

              <Field id="email" label="Email" error={errors.email}>
                <input
                  id="email"
                  type="email"
                  aria-invalid={!!errors.email}
                  className={`w-full rounded-lg border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-300 shadow-sm ${errors.email ? "border-red-500" : "border-red-200"
                    }`}
                  placeholder="you@example.com"
                  value={cust.email}
                  onChange={(e) =>
                    setCust((s) => ({ ...s, email: e.target.value }))
                  }
                />
              </Field>

              <Field id="phone" label="Phone" error={errors.phone}>
                <input
                  id="phone"
                  inputMode="numeric"
                  aria-invalid={!!errors.phone}
                  className={`w-full rounded-lg border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-300 shadow-sm ${errors.phone ? "border-red-500" : "border-red-200"
                    }`}
                  placeholder="10-digit phone"
                  value={cust.phone}
                  onChange={(e) =>
                    setCust((s) => ({ ...s, phone: e.target.value }))
                  }
                />
              </Field>

              <Field id="address" label="Address" error={errors.address}>
                <textarea
                  id="address"
                  aria-invalid={!!errors.address}
                  className={`w-full rounded-lg border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-300 shadow-sm resize-none min-h-[90px] ${errors.address ? "border-red-500" : "border-red-200"
                    }`}
                  placeholder="Street, city, pincode"
                  value={cust.address}
                  onChange={(e) =>
                    setCust((s) => ({ ...s, address: e.target.value }))
                  }
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
                <div className="text-sm text-gray-600">
                  Selected: {rows.filter((r) => r.quantity > 0).length}
                </div>
              </div>

              {/* Desktop Table */}
              {/* Desktop Table */}
              <div className="mt-6 hidden md:block overflow-x-auto rounded-2xl shadow-lg border border-gray-200 bg-white">
                <table className="min-w-full text-sm md:text-base">
                  <thead>
                    <tr className="bg-gradient-to-r from-red-200 via-yellow-100 to-red-100 text-red-800">
                      <th className="px-4 py-3 text-left font-semibold tracking-wide">Product</th>
                      <th className="px-4 py-3 text-left font-semibold tracking-wide">MRP</th>
                      <th className="px-4 py-3 text-left font-semibold tracking-wide">Price</th>
                      <th className="px-4 py-3 text-left font-semibold tracking-wide">Qty</th>
                      <th className="px-4 py-3 text-left font-semibold tracking-wide">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rows.map((r) => (
                      <ProductRow
                        key={r.id}
                        r={r}
                        setQty={setQty}
                        formatCurrency={formatCurrency}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5 md:hidden">
                {rows.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                  >
                    <ProductCard
                      r={r}
                      setQty={setQty}
                      formatCurrency={formatCurrency}
                    />
                  </div>
                ))}
              </div>


              {errors.items && (
                <p className="mt-3 text-sm text-red-600">{errors.items}</p>
              )}
            </div>

            {/* Summary / Checkout bar */}
            <div className="sticky bottom-4">
              <div className="bg-white/95 p-5 rounded-3xl shadow-lg border border-red-50 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="text-2xl font-extrabold text-red-700">
                    {formatCurrency(total)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Incl. taxes where applicable
                  </div>
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

        {loading && (
          <div className="mt-6 text-center text-gray-600">
            Loading products…
          </div>
        )}
      </div>
    </main>
  );
}

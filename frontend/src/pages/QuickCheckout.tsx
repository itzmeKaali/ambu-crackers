import { useEffect, useState } from "react";
import { g, j } from "../api";
import type { Product } from "../types";
import TableQty from "../components/TableQty";

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

  useEffect(() => {
    g("/api/products").then(setProducts);
  }, []);

  const rows = products.map((p) => ({
    ...p,
    quantity: qty[p.id] || 0,
    amount: (qty[p.id] || 0) * p.price,
  }));
  const total = rows.reduce((s, r) => s + r.amount, 0);

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
    if (!validate()) return;

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
    const res = await j("/api/orders/quick-checkout", "POST", payload);
    alert(`Order placed! ID: ${res.order_id}`);
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-red-50 via-yellow-50 to-orange-100 py-6 px-3 sm:px-6">
      <div className="w-full max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-red-600 mb-8 text-center drop-shadow">
          Quick Checkout
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white/90 rounded-3xl shadow-lg p-6 sm:p-10">
          {/* Customer Details */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-red-600 mb-2">
              Customer Details
            </h3>

            {/* Name */}
            <div>
              <input
                className={`w-full rounded-lg border px-4 py-3 text-base focus:outline-none ${
                  errors.name
                    ? "border-red-500 focus:ring-2 focus:ring-red-400"
                    : "border-red-300 focus:ring-2 focus:ring-red-400"
                } bg-white shadow-sm`}
                placeholder="Name"
                value={cust.name}
                onChange={(e) => setCust({ ...cust, name: e.target.value })}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                className={`w-full rounded-lg border px-4 py-3 text-base focus:outline-none ${
                  errors.email
                    ? "border-red-500 focus:ring-2 focus:ring-red-400"
                    : "border-red-300 focus:ring-2 focus:ring-red-400"
                } bg-white shadow-sm`}
                placeholder="Email"
                value={cust.email}
                onChange={(e) => setCust({ ...cust, email: e.target.value })}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <input
                className={`w-full rounded-lg border px-4 py-3 text-base focus:outline-none ${
                  errors.phone
                    ? "border-red-500 focus:ring-2 focus:ring-red-400"
                    : "border-red-300 focus:ring-2 focus:ring-red-400"
                } bg-white shadow-sm`}
                placeholder="Phone"
                value={cust.phone}
                onChange={(e) => setCust({ ...cust, phone: e.target.value })}
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <textarea
                className={`w-full rounded-lg border px-4 py-3 text-base focus:outline-none resize-none min-h-[90px] ${
                  errors.address
                    ? "border-red-500 focus:ring-2 focus:ring-red-400"
                    : "border-red-300 focus:ring-2 focus:ring-red-400"
                } bg-white shadow-sm`}
                placeholder="Address"
                value={cust.address}
                onChange={(e) => setCust({ ...cust, address: e.target.value })}
              />
              {errors.address && (
                <p className="text-red-600 text-sm mt-1">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-xl font-bold text-red-600 mb-4">Items</h3>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm md:text-base rounded-xl overflow-hidden shadow-lg">
                <thead className="bg-gradient-to-r from-red-200 to-yellow-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-bold text-red-700">
                      Product
                    </th>
                    <th className="px-3 py-2 text-left font-bold text-red-700">
                      MRP
                    </th>
                    <th className="px-3 py-2 text-left font-bold text-red-700">
                      Ambu Price
                    </th>
                    <th className="px-3 py-2 text-left font-bold text-red-700">
                      Qty
                    </th>
                    <th className="px-3 py-2 text-left font-bold text-red-700">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-yellow-100">
                      <td className="px-3 py-2 text-gray-800 font-semibold">
                        {r.name}
                      </td>
                      <td className="px-3 py-2 text-gray-600">₹{r.mrp}</td>
                      <td className="px-3 py-2 text-orange-600 font-bold">
                        ₹{r.price}
                      </td>
                      <td className="px-3 py-2">
                        <TableQty
                          value={r.quantity}
                          onChange={(n) =>
                            setQty((q) => ({ ...q, [r.id]: n }))
                          }
                        />
                      </td>
                      <td className="px-3 py-2 text-red-700 font-bold">
                        ₹{r.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-6">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="relative bg-gradient-to-br from-white via-red-50 to-orange-50 rounded-2xl shadow-lg border border-red-100 overflow-hidden p-5"
                >
                  {/* Discount Ribbon */}
                  {r.mrp > r.price && (
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-br-2xl shadow-md">
                      SAVE ₹{r.mrp - r.price}
                    </div>
                  )}

                  {/* Product Name */}
                  <h4 className="text-lg sm:text-xl font-extrabold text-gray-800 mb-3">
                    {r.name}
                  </h4>

                  {/* Price Section */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm text-gray-400 line-through">
                      ₹{r.mrp}
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      ₹{r.price}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-red-200 to-orange-200 mb-4" />

                  {/* Quantity & Amount */}
                  <div className="flex items-center justify-between">
                    <TableQty
                      value={r.quantity}
                      onChange={(n) => setQty((q) => ({ ...q, [r.id]: n }))}
                    />
                    <span className="text-lg sm:text-xl font-extrabold text-orange-700">
                      ₹{r.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {errors.items && (
              <p className="text-red-600 text-sm mt-2">{errors.items}</p>
            )}

            {/* Total + Place Order */}
            <div className="sticky bottom-0 mt-6 p-4 rounded-xl bg-gradient-to-r from-yellow-100 to-red-100 shadow border-t-2 border-red-300 flex flex-col sm:flex-row items-center justify-between">
              <b className="text-xl text-red-700">Total: ₹{total}</b>
              <button
                className="mt-4 sm:mt-0 px-6 py-3 w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-400 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
                onClick={placeOrder}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

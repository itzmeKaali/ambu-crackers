import { useState, useEffect } from "react";
import { g, j } from "../../api";

type OrderItem = {
  id: string;
  name: string;
  mrp: number;
  price: number;
  quantity: number;
};

type Order = {
  order_id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  items: OrderItem[];
  total: number;
  status: "NOT_ENQUIRED" | "IN_PROGRESS" | "DELIVERED" | "ABORTED";
  order_pdf?: string; // optional
};

const STATUS_OPTIONS = ["NOT_ENQUIRED", "IN_PROGRESS", "DELIVERED", "ABORTED"];

// ---------------- Component ---------------- //
export default function AdminOrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Fetch Orders ---------- //
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await g("/api/admin/orders");
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
    })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  // ---------- Update Status ---------- //
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await j(`/api/admin/orders/${orderId}/status`, "PATCH", { status: newStatus });
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === orderId ? { ...o, status: newStatus as Order["status"] } : o
        )
      );
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Loading orders...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Orders Dashboard</h1>

      {/* ---------------- Desktop Table ---------------- */}
      <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-x-auto border border-gray-200">
        <table className="min-w-full text-left text-gray-700">
          <thead>
            <tr className="bg-gray-100 uppercase text-gray-600 text-sm">
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.order_id} className="hover:bg-gray-50 transition duration-200">
                <td className="px-6 py-4 text-sm">{formatDate(order.created_at)}</td>
                <td className="px-6 py-4 text-xs text-gray-500">{order.order_id}</td>
                <td className="px-6 py-4">
                  <div className="font-semibold">{order.customer_name}</div>
                  <div className="text-xs text-gray-500">{order.customer_phone}</div>
                  <div className="text-xs text-gray-500">{order.customer_email}</div>
                </td>
                <td className="px-6 py-4 space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="text-sm flex items-center gap-2">
                      <span className="font-semibold">{item.quantity}x</span>
                      <span>{item.name}</span>
                      <span className="text-xs text-gray-500">₹{item.price}</span>
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 text-sm whitespace-pre-line">
                  {order.customer_address}
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">₹{order.total}</td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                    className="border rounded-lg px-2 py-1 text-sm"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-sm">
                  {order.order_pdf ? (
                    <a
                      href={order.order_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View PDF
                    </a>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- Mobile Cards ---------------- */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => (
          <div
            key={order.order_id}
            className="bg-white rounded-2xl shadow-lg p-4 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs text-gray-500">{formatDate(order.created_at)}</div>
              <div className="text-xs text-gray-500">#{order.order_id}</div>
            </div>

            <div className="font-semibold text-gray-900">{order.customer_name}</div>
            <div className="text-xs text-gray-500 mb-1">{order.customer_phone}</div>
            <div className="text-xs text-gray-500 mb-2">{order.customer_email}</div>

            <div className="mb-2 space-y-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="text-sm flex items-center gap-2">
                  <span className="font-semibold">{item.quantity}x</span>
                  <span>{item.name}</span>
                  <span className="text-xs text-gray-500">₹{item.price}</span>
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-600 mb-2 whitespace-pre-line">
              Address: {order.customer_address}
            </div>

            <div className="font-bold text-gray-900 mb-2">Total: ₹{order.total}</div>

            <div className="mb-2">
              <label className="text-xs text-gray-500 block mb-1">Status</label>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                className="border rounded-lg px-2 py-1 text-sm w-full"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              {order.order_pdf ? (
                <a
                  href={order.order_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:underline"
                >
                  View PDF
                </a>
              ) : (
                <span className="text-gray-400 text-sm">No PDF</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

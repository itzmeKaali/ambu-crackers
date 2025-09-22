import { useState, useEffect } from "react";

// ---------------- Types ---------------- //
type OrderItem = {
  name: string;
  quantity: number;
};

type Order = {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  destination: string;
  delivery: string;
  cost: number;
  status: "Shipped" | "Not delivered" | "Delivered" | "Returned" | "Cancelled";
  payment: "Paid" | "Not paid";
};

// ---------------- Component ---------------- //
export default function AdminOrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Fetch Orders from JSONPlaceholder Mock ----------
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
        if (!res.ok) throw new Error("Failed to fetch orders");

        const data = await res.json();

        // Transform JSONPlaceholder data to Order type
        const mockOrders: Order[] = data.map((item: any) => ({
          id: item.id.toString(),
          createdAt: new Date().toISOString(),
          customerName: `Customer ${item.id}`,
          customerPhone: `9876543${item.id}0`,
          items: [
            { name: "Dosa", quantity: 2 },
            { name: "Idli", quantity: 1 },
          ],
          destination: `Address ${item.id}`,
          delivery: "Fast",
          cost: 50 + item.id * 10,
          status: "Delivered",
          payment: item.id % 2 === 0 ? "Paid" : "Not paid",
        }));

        setOrders(mockOrders);
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
    return `${d.toLocaleDateString(undefined, { day: "2-digit", month: "short" })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
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
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Destination</th>
              <th className="px-6 py-4">Delivery</th>
              <th className="px-6 py-4">Cost</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition duration-200">
                <td className="px-6 py-4 text-sm">{formatDate(order.createdAt)}</td>
                <td className="px-6 py-4">
                  <div className="font-semibold">{order.customerName}</div>
                  <div className="text-xs text-gray-500">{order.customerPhone}</div>
                </td>
                <td className="px-6 py-4 space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="text-sm flex items-center gap-2">
                      <span className="font-semibold">{item.quantity}x</span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 text-sm">{order.destination}</td>
                <td className="px-6 py-4 text-sm">{order.delivery}</td>
                <td className="px-6 py-4 font-bold text-gray-900">${order.cost.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.payment === "Paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.payment}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Shipped"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- Mobile Cards ---------------- */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
              <div
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  order.payment === "Paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {order.payment}
              </div>
            </div>

            <div className="font-semibold text-gray-900">{order.customerName}</div>
            <div className="text-xs text-gray-500 mb-2">{order.customerPhone}</div>

            <div className="mb-2 space-y-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="text-sm flex items-center gap-2">
                  <span className="font-semibold">{item.quantity}x</span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Destination: {order.destination}</span>
              <span>Delivery: {order.delivery}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Cost: ${order.cost.toFixed(2)}</span>
              <span>Status: 
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    order.status === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "Shipped"
                      ? "bg-blue-100 text-blue-800"
                      : order.status === "Cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.status}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

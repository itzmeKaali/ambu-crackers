import { useState, useEffect } from "react";
import { g, j } from "../../api"; // Assuming these are correctly configured
import { FaExternalLinkAlt, FaFilePdf, FaChevronDown, FaChevronUp, FaSort, FaExclamationTriangle, FaBoxOpen, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';

// --- Types ---
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
  status?: "NOT_ENQUIRED" | "IN_PROGRESS" | "DELIVERED" | "ABORTED";
  order_pdf?: string;
};

const STATUS_OPTIONS: Order["status"][] = ["NOT_ENQUIRED", "IN_PROGRESS", "DELIVERED", "ABORTED"];

// ---------------- Helper Functions ---------------- //
const getStatusClass = (status?: Order["status"]): string => {
  switch (status) {
    case "DELIVERED": return "bg-green-100 text-green-800 border-green-200";
    case "IN_PROGRESS": return "bg-blue-100 text-blue-800 border-blue-200";
    case "ABORTED": return "bg-red-100 text-red-800 border-red-200";
    case "NOT_ENQUIRED":
    default: return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
};

const formatDate = (date: string): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return "Invalid Date";
  }
  return `${d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const formatCurrency = (amount?: number): string => {
  return `₹${(amount ?? 0).toFixed(2)}`;
};

// ---------------- Component ---------------- //
export default function AdminOrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<keyof Order>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null); // To disable select during update

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await g("/api/admin/orders");
        // Ensure items is an array for all orders, default to empty array if missing
        const processedData = data.map((order: Order) => ({
          ...order,
          items: order.items || [],
        }));
        const sortedData = processedData.sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrders(sortedData);
      } catch (err: any) {
        console.error("API Fetch Error:", err);
        setError(err.message || "An unknown error occurred while fetching orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // We can safely cast newStatus here as it comes from a select populated by STATUS_OPTIONS
    const typedNewStatus = newStatus as Order["status"];
    const originalStatus = orders.find(o => o.order_id === orderId)?.status;
    setIsUpdatingStatus(orderId); // Set updating status for this order
    try {
      setOrders(prev => prev.map(o =>
        o.order_id === orderId ? { ...o, status: typedNewStatus } : o
      ));
      await j(`/api/admin/orders/${orderId}/status`, "PATCH", { status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      // Revert to original status if update fails
      alert(`Failed to update status for order ${orderId}. Please try again.`);
      if (originalStatus) {
        setOrders(prev => prev.map(o =>
          o.order_id === orderId ? { ...o, status: originalStatus } : o
        ));
      }
    } finally {
      setIsUpdatingStatus(null); // Clear updating status
    }
  };

  const handleSort = (key: keyof Order) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc'); // Default to descending for new sort key
    }
  };

  // Ensure order.status is treated as a string for filtering
  const filteredOrders = orders.filter(order => statusFilter === "ALL" || (order.status ?? 'NOT_ENQUIRED') === statusFilter);

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue: any = a[sortKey];
    let bValue: any = b[sortKey];

    // Type-specific comparisons
    if (sortKey === 'created_at') {
      aValue = new Date(a.created_at).getTime();
      bValue = new Date(b.created_at).getTime();
    } else if (sortKey === 'customer_name' || sortKey === 'order_id') {
      aValue = String(aValue ?? '').toLowerCase();
      bValue = String(bValue ?? '').toLowerCase();
    } else if (sortKey === 'total') {
      aValue = Number(aValue ?? 0);
      bValue = Number(bValue ?? 0);
    }
    // Handle 'status' sorting by ensuring both are strings
    else if (sortKey === 'status') {
      aValue = String(a.status ?? 'NOT_ENQUIRED');
      bValue = String(b.status ?? 'NOT_ENQUIRED');
    }


    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = sortedOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // --- Loading, Error, Empty States ---
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-8">
      <FaSpinner className="animate-spin h-12 w-12 text-indigo-600 mb-4" />
      <p className="text-xl font-medium text-gray-700">Loading orders...</p>
      <p className="text-sm text-gray-500 mt-1">Fetching the latest order data.</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-50 p-8 border border-red-300 m-4 rounded-lg">
      <FaExclamationTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-red-800 mb-2">Error Fetching Data</h2>
      <p className="text-lg text-red-600 text-center">**{error}**</p>
      <p className="text-sm text-red-500 mt-2">Please check your network connection or API endpoint configuration.</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );

  if (orders.length === 0 && statusFilter === "ALL") return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-8">
      <FaBoxOpen className="h-12 w-12 text-indigo-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Found</h2>
      <p className="text-lg text-gray-600">The order list is currently empty. Start by adding new orders!</p>
    </div>
  );

  if (filteredOrders.length === 0 && statusFilter !== "ALL") return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-8">
      <FaBoxOpen className="h-12 w-12 text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold text-gray-700 mb-2">No Orders Matching Filter</h2>
      <p className="text-lg text-gray-500">No orders found with status: **{statusFilter.replace('_', ' ')}**.</p>
      <button
        onClick={() => setStatusFilter("ALL")}
        className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors"
      >
        Show All Orders
      </button>
    </div>
  );

  return (
    <div >
      {/* Header + Status Filter */}
      <header className="mb-6 md:mb-8 border-b border-gray-200 pb-4 md:pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2">
            <span className="text-indigo-600">📦</span> Orders Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Manage and update order statuses. ({filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} visible of {orders.length} total)
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 sr-only sm:not-sr-only">Filter by Status:</label>
          <select
            id="status-filter"
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-800 bg-white shadow-sm
                       focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition duration-200 ease-in-out"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="ALL">All Orders</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>
                {(status ?? 'NOT_ENQUIRED').replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-full">
        <table className="min-w-full text-left text-gray-700 table-auto text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-gray-600 uppercase font-semibold text-xs tracking-wider">
              {(['created_at', 'order_id', 'customer_name', 'items', 'customer_address', 'total', 'status', 'order_pdf'] as const).map((key) => {
                let label = key.replace(/_/g, ' ');
                if (key === 'created_at') label = 'Order Date';
                if (key === 'customer_name') label = 'Customer Info';
                if (key === 'customer_address') label = 'Shipping Address';
                if (key === 'order_pdf') label = 'Invoice';
                if (key === 'items') label = 'Order Items';
                if (key === 'total') label = 'Total Amount';
                if (key === 'status') label = 'Status'; // Added for clarity

                const isSortable = ['created_at', 'order_id', 'customer_name', 'total', 'status'].includes(key); // Added 'status'
                return (
                  <th
                    key={key}
                    className={`px-4 py-3 ${isSortable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
                    onClick={() => isSortable && handleSort(key as keyof Order)}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {isSortable && (
                        <FaSort
                          size={12}
                          className={`ml-1 text-gray-400 transform transition-transform ${sortKey === key ? (sortDirection === 'desc' ? 'rotate-180 text-indigo-500' : 'rotate-0 text-indigo-500') : ''}`}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedOrders.map(order => {
              const isExpanded = order.order_id === expandedOrderId;
              return (
                <tr key={order.order_id} className="hover:bg-indigo-50 transition duration-200 align-top text-sm">
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 font-mono text-gray-500">#{order.order_id.substring(0, 8)}...</td>
                  <td className="px-4 py-3 min-w-[180px]">
                    <div className="font-semibold text-gray-900">{order.customer_name}</div>
                    <div className="text-xs text-blue-600 truncate">{order.customer_email}</div>
                    <div className="text-xs text-gray-500">{order.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3 min-w-[220px] max-w-sm">
                    {/* Ensure items is an array before mapping */}
                    {(order.items || []).slice(0, 2).map((item, idx) => (
                      <div key={item.id || idx} className="flex justify-between items-center text-gray-700 text-xs mb-1 last:mb-0">
                        <span className="truncate">{item.quantity}x {item.name}</span>
                        <span className="text-gray-500">{formatCurrency(item.price)}</span>
                      </div>
                    ))}
                    {/* Check length against a potentially empty array */}
                    {(order.items || []).length > 2 && (
                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.order_id)}
                        className="text-indigo-600 text-xs mt-2 flex items-center gap-1 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded"
                      >
                        {isExpanded ? (
                          <>Hide items <FaChevronUp size={10} /></>
                        ) : (
                          <>+{order.items.length - 2} more items <FaChevronDown size={10} /></>
                        )}
                      </button>
                    )}
                    {isExpanded && (order.items || []).slice(2).map((item, idx) => (
                      <div key={item.id || `expanded-${idx}`} className="flex justify-between items-center text-gray-700 text-xs mt-1 mb-1 last:mb-0">
                        <span className="truncate">{item.quantity}x {item.name}</span>
                        <span className="text-gray-500">{formatCurrency(item.price)}</span>
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 max-w-xs whitespace-pre-line text-xs text-gray-600">{order.customer_address}</td>
                  <td className="px-4 py-3 font-bold text-indigo-700 whitespace-nowrap">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <select
                        value={order.status ?? 'NOT_ENQUIRED'} // Ensure a default value
                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                        disabled={isUpdatingStatus === order.order_id} // Disable during update
                        className={`relative z-10 block w-full appearance-none rounded-full px-3 py-1.5 text-xs font-semibold
                                    ${getStatusClass(order.status ?? 'NOT_ENQUIRED')} border focus:outline-none focus:ring-2 focus:ring-offset-1
                                    ${isUpdatingStatus === order.order_id ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>
                            {(status ?? 'NOT_ENQUIRED').replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                      {isUpdatingStatus === order.order_id && (
                        <FaSpinner className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-indigo-600 animate-spin z-20" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {order.order_pdf ? (
                      <a
                        href={order.order_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-full inline-flex p-2"
                        title="View Invoice PDF"
                      >
                        <FaFilePdf size={18} />
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 border border-gray-300 rounded-lg text-sm transition-colors
                          ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Next
          </button>
        </div>
      )}

      {/* Mobile Cards */}
      <div className="md:hidden space-y-5 mt-4">
        {paginatedOrders.map(order => {
          const isExpanded = order.order_id === expandedOrderId;
          return (
            <div key={order.order_id} className="bg-white rounded-xl shadow-md p-5 border border-gray-200 transition duration-300 hover:shadow-lg">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{order.customer_name}</h2>
                  <p className="text-xs text-gray-500 mt-1">Order ID: <span className="font-mono">#{order.order_id.substring(0, 8)}...</span></p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(order.status ?? 'NOT_ENQUIRED')} border`}>
                  {(order.status ?? 'NOT_ENQUIRED').replace('_', ' ')}
                </span>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="text-3xl font-extrabold text-indigo-700">{formatCurrency(order.total)}</div>
                <div className="text-sm text-gray-600">{formatDate(order.created_at)}</div>
              </div>

              <div className="mb-4">
                <label htmlFor={`status-select-${order.order_id}`} className="text-xs font-medium text-gray-600 block mb-1">Update Status:</label>
                <div className="relative">
                  <select
                    id={`status-select-${order.order_id}`}
                    value={order.status ?? 'NOT_ENQUIRED'}
                    onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                    disabled={isUpdatingStatus === order.order_id}
                    className={`relative z-10 block w-full appearance-none rounded-lg px-4 py-2 text-base font-semibold
                                ${getStatusClass(order.status ?? 'NOT_ENQUIRED')} border focus:outline-none focus:ring-2 focus:ring-offset-1
                                ${isUpdatingStatus === order.order_id ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>
                        {(status ?? 'NOT_ENQUIRED').replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  {isUpdatingStatus === order.order_id && (
                    <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-600 animate-spin z-20" />
                  )}
                  <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-0" />
                </div>
              </div>

              <button
                onClick={() => setExpandedOrderId(isExpanded ? null : order.order_id)}
                className="w-full text-center text-sm font-semibold text-indigo-600 py-3 border-t border-gray-100 mt-2 flex justify-center items-center gap-2 hover:bg-indigo-50 rounded-b-xl -mx-5 px-5"
              >
                {isExpanded ? (
                  <>Hide Details <FaEyeSlash size={14} /></>
                ) : (
                  <>View Details <FaEye size={14} /></>
                )}
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Items Ordered ({order.items.length}):</h3>
                    <ul className="space-y-2">
                      {(order.items || []).map((item, idx) => ( // Ensure items is an array
                        <li key={item.id || idx} className="flex justify-between text-sm text-gray-700 border-b border-dashed border-gray-100 pb-2 last:border-b-0 last:pb-0">
                          <span className="flex-grow">{item.quantity}x {item.name}</span>
                          <span className="font-medium text-gray-600">{formatCurrency(item.price)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Shipping Address:</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{order.customer_address}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Contact Information:</h3>
                    <p className="text-sm text-gray-600">{order.customer_phone}</p>
                    <p className="text-sm text-gray-600 break-all">{order.customer_email}</p>
                  </div>
                  {order.order_pdf ? (
                    <a
                      href={order.order_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-indigo-600 text-sm font-medium hover:underline pt-2"
                    >
                      <FaExternalLinkAlt size={12} /> View Invoice PDF
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm pt-2 block">No Invoice PDF Available</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
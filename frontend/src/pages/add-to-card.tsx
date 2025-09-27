import Default from "../assets/shop/products-def.jpg";
import { ShoppingCart } from "lucide-react";

interface CartPageProps {
  items: any[];
  cart: Record<string, number>;
  add: (p: any) => void;
  remove: (p: any) => void;
  total: number;
  customer: any;
  setCustomer: (c: any) => void;
  errors: Record<string, string>;
  couponApplied: string | null;
  applyCoupon: () => void;
  placeOrder: () => void;
  setShowCart: (val: boolean) => void;
  loading: boolean;
}

export default function CartPage({
  items, cart, add, remove, total,
  customer, setCustomer, errors,
  couponApplied, applyCoupon, placeOrder,
  setShowCart, loading
}: CartPageProps) {
  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto min-h-screen font-sans">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-red-600 flex items-center gap-2">
            <ShoppingCart size={24} /> Your Cart
          </h2>
          <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">✕</button>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-20 text-lg">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {items.map(it => (
              <div key={it.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={it.image_url || Default} alt={it.name} className="w-16 h-16 rounded-md object-contain border border-gray-200" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{it.name}</p>
                    <p className="text-xs text-gray-600">₹ {it.price.toFixed(2)} × {it.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => remove(it)} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition">−</button>
                  <span className="text-gray-700 w-5 text-center">{it.quantity}</span>
                  <button onClick={() => add(it)} className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition">+</button>
                </div>
              </div>
            ))}

            <div className="mt-6 border-t border-gray-200 pt-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Customer Information</h3>
              <input placeholder="Full Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full p-2 border rounded" />
              <input placeholder="Email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="w-full p-2 border rounded" />
              <input placeholder="Phone" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full p-2 border rounded" />
              <textarea placeholder="Address" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full p-2 border rounded" />
              <div className="flex gap-2 items-end">
                <input placeholder="Coupon" value={customer.coupon} onChange={e => setCustomer({...customer, coupon: e.target.value})} className="flex-1 p-2 border rounded" />
                <button onClick={applyCoupon} className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition">Apply</button>
              </div>
              <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-4">
                <span className="text-lg font-bold">Total: ₹ {total.toFixed(2)}</span>
                <button onClick={placeOrder} disabled={loading} className="py-2 px-6 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded shadow">{loading ? "Placing..." : "Place Order"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

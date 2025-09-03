import { useEffect, useState } from 'react'
import { g, j } from '../api'
import type { Product } from '../types'
import TableQty from '../components/TableQty'

export default function QuickCheckout() {
  const [products, setProducts] = useState<Product[]>([]);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [cust, setCust] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => { g('/api/products').then(setProducts); }, []);

  const rows = products.map(p => ({ ...p, quantity: qty[p.id] || 0, amount: (qty[p.id] || 0) * p.price }));
  const total = rows.reduce((s, r) => s + r.amount, 0);

  async function placeOrder() {
    const items = rows.filter(r => r.quantity > 0).map(r => ({ id: r.id, name: r.name, mrp: r.mrp, price: r.price, quantity: r.quantity }));
    if (items.length === 0) { alert('Add at least one item'); return; }
    const payload = {
      customer_name: cust.name,
      customer_email: cust.email,
      customer_phone: cust.phone,
      customer_address: cust.address,
      items, total
    };
    const res = await j('/api/orders/quick-checkout', 'POST', payload);
    alert(`Order placed! ID: ${res.order_id}`);
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-red-50 via-yellow-50 to-orange-100 py-8 px-2">
      <div className="w-full max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-extrabold text-red-600 mb-8 text-center drop-shadow">Quick Checkout</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/80 rounded-3xl shadow-lg p-6 md:p-10">
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-red-600 mb-2">Customer Details</h3>
            <input className="rounded-lg border border-red-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white shadow" placeholder="Name" value={cust.name} onChange={e => setCust({ ...cust, name: e.target.value })} />
            <input className="rounded-lg border border-red-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white shadow" placeholder="Email" value={cust.email} onChange={e => setCust({ ...cust, email: e.target.value })} />
            <input className="rounded-lg border border-red-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white shadow" placeholder="Phone" value={cust.phone} onChange={e => setCust({ ...cust, phone: e.target.value })} />
            <textarea className="rounded-lg border border-red-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white shadow resize-none min-h-[80px]" placeholder="Address" value={cust.address} onChange={e => setCust({ ...cust, address: e.target.value })} />
          </div>
          <div className="overflow-x-auto">
            <h3 className="text-xl font-bold text-red-600 mb-2">Items</h3>
            <table className="min-w-full text-sm md:text-base rounded-xl overflow-hidden shadow-lg">
              <thead className="bg-gradient-to-r from-red-200 to-yellow-100">
                <tr>
                  <th className="px-2 py-2 text-left font-bold text-red-700">Product</th>
                  <th className="px-2 py-2 text-left font-bold text-red-700">MRP</th>
                  <th className="px-2 py-2 text-left font-bold text-red-700">Ambu Price</th>
                  <th className="px-2 py-2 text-left font-bold text-red-700">Qty</th>
                  <th className="px-2 py-2 text-left font-bold text-red-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-b border-yellow-100">
                    <td className="px-2 py-2 text-gray-800 font-medium">{r.name}</td>
                    <td className="px-2 py-2 text-gray-600">₹{r.mrp}</td>
                    <td className="px-2 py-2 text-orange-600 font-bold">₹{r.price}</td>
                    <td className="px-2 py-2"><TableQty value={r.quantity} onChange={n => setQty(q => ({ ...q, [r.id]: n }))} /></td>
                    <td className="px-2 py-2 text-red-700 font-bold">₹{r.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 p-4 rounded-xl bg-gradient-to-r from-yellow-100 to-red-100 shadow border-t-2 border-red-300">
              <b className="text-xl text-red-700">Total: ₹{total}</b>
              <button className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-400 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300" onClick={placeOrder}>Place Order</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { g } from '../api';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import Select from 'react-select';

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    g('/api/products' + (category ? `?category=${encodeURIComponent(category)}` : ''))
      .then(setProducts);
  }, [category]);

  function add(p: Product) {
    setCart(c => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }));
  }

  const items = products.filter(p => (cart[p.id] || 0) > 0).map(p => ({ ...p, quantity: cart[p.id] || 0 }));

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Sparklers', label: 'Sparklers' },
    { value: 'Flower Pots', label: 'Flower Pots' },
    { value: 'Rockets', label: 'Rockets' },
    { value: 'Chakkars', label: 'Chakkars' },
    { value: 'Bombs', label: 'Bombs' },
    { value: 'Fancy', label: 'Fancy' },
    { value: 'Gift Box', label: 'Gift Box' },
    { value: 'One Sound', label: 'One Sound' },
    { value: 'Lakshmi', label: 'Lakshmi' },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-red-50 via-yellow-50 to-orange-100">
      <div className="flex-1 flex flex-col justify-start items-center w-full">
        <div className="w-full max-w-7xl px-2 sm:px-4 md:px-8 py-8 mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-red-600 mb-8 text-center drop-shadow">Shop Crackers</h2>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 w-full">
            <div className="w-full sm:w-1/2 md:w-1/3">
              <Select
                options={categoryOptions}
                value={categoryOptions.find(opt => opt.value === category)}
                onChange={opt => setCategory(opt?.value || '')}
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '1rem',
                    borderColor: '#f87171',
                    boxShadow: '0 2px 8px #fbbf24a0',
                    fontWeight: 'bold',
                    background: 'linear-gradient(90deg,#fff7ed,#fffde4)',
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#f87171' : state.isFocused ? '#fde68a' : '#fff',
                    color: state.isSelected ? '#fff' : '#b91c1c',
                    fontWeight: state.isSelected ? 'bold' : 'normal',
                  }),
                }}
              />
            </div>
          </div>

          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-amber-200 flex flex-col h-full">
                <ProductCard p={p} onAdd={add} />
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-xl bg-gradient-to-r from-red-100 to-yellow-100 shadow-lg p-8 border-t-4 border-red-400 w-full">
            <h3 className="text-2xl md:text-3xl font-bold text-red-600 mb-4">Your Cart</h3>
            {items.length === 0 ? (
              <p className="text-gray-500">No items yet.</p>
            ) : (
              <ul className="mb-4">
                {items.map(it => (
                  <li key={it.id} className="text-lg text-gray-700 font-medium mb-2">
                    {it.name} <span className="text-red-600">× {it.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-yellow-700 font-semibold">Proceed to Quick Checkout to finalize your quantities and place order.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

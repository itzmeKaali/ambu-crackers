import { useEffect, useState } from "react";
import { g } from "../api";
import type { Product } from "../types";
import Select from "react-select";
import Default from "../assets/shop/products-def.jpg";

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false); // for mobile floating cart

  useEffect(() => {
    g(
      "/api/products" +
        (category ? `?category=${encodeURIComponent(category)}` : "")
    ).then(setProducts);
  }, [category]);

  function add(p: Product) {
    setCart((c) => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }));
  }

  function remove(p: Product) {
    setCart((c) => {
      const newCart = { ...c };
      if (newCart[p.id] > 1) {
        newCart[p.id] -= 1;
      } else {
        delete newCart[p.id];
      }
      return newCart;
    });
  }

  const items = products
    .filter((p) => cart[p.id])
    .map((p) => ({ ...p, quantity: cart[p.id] }));

  const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "Sparklers", label: "Sparklers" },
    { value: "Flower Pots", label: "Flower Pots" },
    { value: "Rockets", label: "Rockets" },
    { value: "Chakkars", label: "Chakkars" },
    { value: "Bombs", label: "Bombs" },
    { value: "Fancy", label: "Fancy" },
    { value: "Gift Box", label: "Gift Box" },
    { value: "One Sound", label: "One Sound" },
    { value: "Lakshmi", label: "Lakshmi" },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-red-50 to-orange-50 pb-20 md:pb-10">
      <div className="w-full max-w-7xl px-3 sm:px-6 md:px-10 py-8 mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent text-center mb-6 sm:mb-8">
          Shop Crackers
        </h2>

        {/* Category Filter */}
        <div className="mb-6 max-w-xs sm:max-w-md mx-auto">
          <Select
            options={categoryOptions}
            value={categoryOptions.find((opt) => opt.value === category)}
            onChange={(opt) => setCategory(opt?.value || "")}
            classNamePrefix="react-select"
          />
        </div>

        {/* Product Grid */}
        <div className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="relative rounded-xl bg-white/90 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Floating cart badge */}
              {cart[p.id] > 0 && (
                <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold shadow-md">
                  {cart[p.id]}
                </div>
              )}

              {/* Product Image */}
              <img
                src={Default}
                alt={p.name}
                className="aspect-square w-full object-cover"
              />

              {/* Product Info */}
              <div className="p-2 sm:p-3 flex flex-col flex-1">
                <h4 className="font-semibold text-sm sm:text-base text-gray-800 truncate">
                  {p.name}
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm mb-2">
                  ₹ {p.price}
                </p>

                <button
                  onClick={() => add(p)}
                  className="mt-auto w-full py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm sm:text-base font-medium shadow hover:scale-[1.02] transition"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Cart */}
        <div className="hidden md:block mt-10 rounded-2xl bg-white/90 backdrop-blur-lg shadow-lg border border-red-100 p-6">
          <h3 className="text-lg sm:text-xl font-bold text-red-600 mb-4">
            🛒 Your Cart
          </h3>
          {items.length === 0 ? (
            <p className="text-gray-500">No items in your cart yet.</p>
          ) : (
            <div className="space-y-3">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between bg-gradient-to-r from-white/90 to-red-50/80 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={Default}
                      alt={it.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {it.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        ₹ {it.price} × {it.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => remove(it)}
                      className="px-2 py-1 bg-red-500 text-white rounded font-bold"
                    >
                      −
                    </button>
                    <span className="font-semibold text-gray-700 text-sm">
                      {it.quantity}
                    </span>
                    <button
                      onClick={() => add(it)}
                      className="px-2 py-1 bg-green-500 text-white rounded font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center border-t pt-3 mt-3">
                <p className="text-base sm:text-lg font-bold text-gray-800">
                  Total: ₹ {total}
                </p>
                <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold shadow hover:scale-105 transition">
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Floating Cart Button (Mobile) */}
        {items.length > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="md:hidden fixed bottom-16 right-5 px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white text-sm font-semibold shadow-lg z-40"
          >
            Cart ({items.length})
          </button>
        )}

        {/* Mobile Cart Popup */}
        {showCart && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end z-50">
            <div className="w-full bg-white rounded-t-2xl shadow-2xl p-4 max-h-[75vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-red-600">🛒 Your Cart</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 text-lg"
                >
                  ✕
                </button>
              </div>

              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between bg-gradient-to-r from-white/90 to-red-50/80 p-2 rounded-lg mb-2"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={Default}
                      alt={it.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {it.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        ₹ {it.price} × {it.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => remove(it)}
                      className="px-2 py-1 bg-red-500 text-white rounded font-bold"
                    >
                      −
                    </button>
                    <span className="font-semibold text-gray-700 text-sm">
                      {it.quantity}
                    </span>
                    <button
                      onClick={() => add(it)}
                      className="px-2 py-1 bg-green-500 text-white rounded font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center border-t pt-3 mt-3">
                <p className="text-base font-bold text-gray-800">
                  Total: ₹ {total}
                </p>
                <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold shadow-md">
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

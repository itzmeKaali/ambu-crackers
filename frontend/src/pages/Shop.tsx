import { useEffect, useState } from "react";
import { g } from "../api";
import type { Product } from "../types";
import Select from "react-select";
import Default from "../assets/shop/products-def.jpg";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    g(
      "/api/products" +
      (category ? `?category=${encodeURIComponent(category)}` : "")
    ).then(setProducts);
  }, [category]);
  console.log("category",category)
  function add(p: Product) {
    setCart((c) => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }));
  }

  function remove(p: Product) {
    setCart((c) => {
      const newCart = { ...c };
      if (newCart[p.id] > 1) newCart[p.id] -= 1;
      else delete newCart[p.id];
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
useEffect(()=>{
  console.log("producta",products)
},[])
  // ✅ Export Products → PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(" Products List", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [[ "Name", "Price (₹)", "Category"]],
      body: products.map((p) => [ p.name, p.price, p.category || "-"]),
    });

    doc.save("products.pdf");
  };

  // ✅ Export Products → Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      products.map((p) => ({
        Name: p.name,
        Price: p.price,
        Category: p.category || "-",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "products.xlsx");
  };





  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-orange-50 via-white to-red-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 mb-10 tracking-tight">
          ✨ Premium Fireworks Collection
        </h2>

        {/* Export Buttons */}
        <div className="flex gap-3">
          <button
            onClick={exportPDF}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium shadow hover:scale-105 transition"
          >
            📄 Export PDF
          </button>
          <button
            onClick={exportExcel}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium shadow hover:scale-105 transition"
          >
            📊 Export Excel
          </button>
        </div>


        {/* Category Filter */}
        <div className="mb-10 max-w-sm mx-auto">
          <Select
            options={categoryOptions}
            value={categoryOptions.find((opt) => opt.value === category)}
            onChange={(opt) => setCategory(opt?.value || "")}
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "0.75rem",
                borderColor: "#f87171",
                padding: "4px",
              }),
            }}
          />
        </div>

        {/* Product Grid */}
        <div className="grid gap-6 sm:gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col rounded-xl overflow-hidden bg-white border border-gray-100 shadow hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {cart[p.id] > 0 && (
                  <span className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full shadow">
                    {cart[p.id]}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <h4 className="font-semibold text-gray-800 text-base sm:text-lg truncate group-hover:text-red-600 transition-colors">
                  {p.name}
                </h4>
                <p className="text-lg font-bold text-green-600 mt-1">
                  ₹ {p.price}
                </p>

                <button
                  onClick={() => add(p)}
                  className="mt-auto w-full py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium shadow hover:scale-[1.02] active:scale-95 transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Section (Desktop Sidebar) */}
        <div className="hidden md:block mt-14">
          <div className="rounded-xl bg-white shadow-xl border border-red-100 p-6">
            <h3 className="text-xl font-bold text-red-600 mb-4">🛒 Your Cart</h3>
            {items.length === 0 ? (
              <p className="text-gray-500">Your cart is empty.</p>
            ) : (
              <div className="space-y-3">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={Default}
                        alt={it.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{it.name}</p>
                        <p className="text-sm text-gray-600">
                          ₹ {it.price} × {it.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => remove(it)}
                        className="px-2 py-1 bg-red-500 text-white rounded font-bold"
                      >
                        −
                      </button>
                      <span className="font-semibold text-gray-700">
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
                  <p className="text-lg font-bold text-gray-800">
                    Total: ₹ {total}
                  </p>
                  <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold shadow hover:scale-105 transition">
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Cart (Mobile) */}
        {items.length > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="md:hidden fixed bottom-16 right-5 px-5 py-3 rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white text-sm font-semibold shadow-xl z-40"
          >
            Cart ({items.length})
          </button>
        )}

        {/* Mobile Cart Drawer */}
        {showCart && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end z-50">
            <div className="w-full bg-white rounded-t-2xl shadow-2xl p-4 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-red-600">🛒 Your Cart</h3>
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
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-2"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={Default}
                      alt={it.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{it.name}</p>
                      <p className="text-sm text-gray-600">
                        ₹ {it.price} × {it.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => remove(it)}
                      className="px-2 py-1 bg-red-500 text-white rounded font-bold"
                    >
                      −
                    </button>
                    <span className="font-semibold text-gray-700">
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
                <p className="text-lg font-bold text-gray-800">
                  Total: ₹ {total}
                </p>
                <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold shadow hover:scale-105 transition">
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

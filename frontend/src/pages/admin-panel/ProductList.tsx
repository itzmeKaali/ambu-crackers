import { useState } from "react";
import { j } from "../../api";
import type { Product } from "../../types";

interface ProductListProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  token: string;
}

export default function ProductList({ products, setProducts, token }: ProductListProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});
  const [file, setFile] = useState<File | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setForm({ ...form, image_url: URL.createObjectURL(selectedFile) });
    }
  };

  // Update product
  async function updateProduct() {
    if (!editingProduct) return;

    let image_url = form.image_url;
    if (file) {
      const meta = await j("/api/admin/upload-url", "POST", { filename: file.name }, token);
      await fetch(meta.upload_url, {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
        body: file,
      });
      image_url = meta.public_url;
    }

    const payload = { ...form, image_url };
    await j(`/api/admin/products/${editingProduct.id}`, "PUT", payload, token);

    setProducts(products.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p)));

    setEditingProduct(null);
    setFile(null);
    setForm({});
  }

  // Remove product
  async function removeProduct(id: string) {
    await j(`/api/admin/products/${id}`, "DELETE", {}, token);
    setProducts(products.filter((p) => p.id !== id));
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50 min-h-screen w-full">
      <h2 className="text-3xl md:text-4xl font-bold text-red-700 mb-6">Products</h2>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto w-full">
        <table className="w-full border-collapse rounded-xl overflow-hidden shadow-lg">
          <thead className="bg-red-100 text-gray-800 uppercase text-sm">
            <tr>
              <th className="py-3 px-6 text-left">Image & Name</th>
              <th className="py-3 px-6 text-left">MRP</th>
              <th className="py-3 px-6 text-left">Price</th>
              <th className="py-3 px-6 text-left">Category</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {products.map((p) => (
              <tr
                key={p.id}
                className="bg-white hover:shadow-lg transition-all transform hover:scale-[1.01] border-b border-gray-200"
              >
                <td className="py-4 px-6 flex items-center gap-4">
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-16 h-16 rounded-lg object-cover shadow-sm"
                    />
                  )}
                  <span className="font-semibold">{p.name}</span>
                </td>
                <td className="py-4 px-6">{p.mrp}</td>
                <td className="py-4 px-6">{p.price}</td>
                <td className="py-4 px-6">{p.category}</td>
                <td className="py-4 px-6 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setForm(p);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeProduct(p.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white shadow-lg rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            {p.image_url && (
              <img
                src={p.image_url}
                alt={p.name}
                className="w-full sm:w-24 h-24 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">{p.name}</h3>
              <p className="text-gray-600 mt-1">MRP: {p.mrp}</p>
              <p className="text-gray-600 mt-1">Price: {p.price}</p>
              <p className="text-gray-600 mt-1">Category: {p.category}</p>
            </div>
            <div className="flex gap-2 mt-3 sm:mt-0">
              <button
                onClick={() => {
                  setEditingProduct(p);
                  setForm(p);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Edit
              </button>
              <button
                onClick={() => removeProduct(p.id)}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

 {/* Edit Modal */}
{editingProduct && (
  <div className="fixed inset-0 flex justify-center items-center z-50">
    {/* Correct translucent overlay */}
    <div
      className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      style={{ pointerEvents: "auto" }}
    ></div>

    {/* Modal content */}
    <div className="relative bg-white p-6 rounded-xl w-80 md:w-96 z-10 flex flex-col gap-4 shadow-xl">
      <h3 className="text-xl font-bold mb-2 text-red-700">Edit Product</h3>

      {/* Name */}
      <div className="flex flex-col">
        <label className="text-gray-700 text-sm mb-1">Name</label>
        <input
          type="text"
          value={form.name || ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border rounded px-3 py-2 focus:ring-2 focus:ring-red-300 focus:outline-none"
        />
      </div>

      {/* Category */}
      <div className="flex flex-col">
        <label className="text-gray-700 text-sm mb-1">Category</label>
        <input
          type="text"
          value={form.category || ""}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border rounded px-3 py-2 focus:ring-2 focus:ring-red-300 focus:outline-none"
        />
      </div>

      {/* MRP */}
      <div className="flex flex-col">
        <label className="text-gray-700 text-sm mb-1">MRP</label>
        <input
          type="number"
          value={form.mrp || 0}
          onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })}
          className="border rounded px-3 py-2 focus:ring-2 focus:ring-red-300 focus:outline-none"
        />
      </div>

      {/* Price */}
      <div className="flex flex-col">
        <label className="text-gray-700 text-sm mb-1">Price</label>
        <input
          type="number"
          value={form.price || 0}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          className="border rounded px-3 py-2 focus:ring-2 focus:ring-red-300 focus:outline-none"
        />
      </div>

      {/* File Upload */}
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={() => {
            setEditingProduct(null);
            setForm({});
            setFile(null);
          }}
          className="px-3 py-1 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
        >
          Cancel
        </button>
        <button
          onClick={updateProduct}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

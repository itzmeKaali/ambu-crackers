import { useState } from "react";
import { auth, signOut } from "../firebase";
import { j } from "../api";
import type { Product } from "../types";

// Props for AdminPanel
interface AdminPanelProps {
  user: any;
  token: string;
  me: any;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

/* ===========================
   Product Form Component
=========================== */
function ProductForm({ token, products, setProducts }: any) {
  const [form, setForm] = useState<Partial<Product>>({ is_active: true });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setPreview(selectedFile ? URL.createObjectURL(selectedFile) : null);
  };

  async function uploadImage(): Promise<string | undefined> {
    if (!file) return undefined;
    const meta = await j(
      "/api/admin/upload-url",
      "POST",
      { filename: file.name },
      token
    );
    await fetch(meta.upload_url, {
      method: "PUT",
      headers: { "Content-Type": "application/octet-stream" },
      body: file,
    });
    return meta.public_url as string;
  }

  async function saveProduct() {
    const image_url = await uploadImage();
    const { name, mrp, price, category, is_active, description } = form;

    if (!name?.trim()) return alert("Product name is required.");
    if (mrp === undefined || mrp < 0 || price === undefined || price < 0)
      return alert("Price and MRP must be valid non-negative numbers.");
    if (!category?.trim()) return alert("Category cannot be empty.");

    const payload = { name, mrp, price, category, is_active, description, image_url };
    const newProduct = await j("/api/admin/products", "POST", payload, token);

    setProducts([newProduct, ...products]);
    setForm({ is_active: true });
    setFile(null);
    setPreview(null);
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 flex flex-col gap-6">
      <h3 className="text-2xl font-bold text-red-600 mb-4">Create New Product</h3>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          saveProduct();
        }}
      >
        <input
          className="rounded-lg border border-red-300 px-4 py-2 shadow focus:ring-2 focus:ring-red-400"
          placeholder="Product Name"
          value={form.name || ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          className="rounded-lg border border-red-300 px-4 py-2 shadow min-h-[80px]"
          placeholder="Description"
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="rounded-lg border border-red-300 px-4 py-2 shadow"
          placeholder="Category"
          value={form.category || ""}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="MRP"
            value={form.mrp || 0}
            onChange={(e) => setForm({ ...form, mrp: parseFloat(e.target.value) })}
            min={0}
            step={0.01}
            className="rounded-lg border border-red-300 px-4 py-2 shadow"
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price || 0}
            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
            min={0}
            step={0.01}
            className="rounded-lg border border-red-300 px-4 py-2 shadow"
          />
        </div>

        <label className="flex items-center gap-2 font-medium text-red-600">
          <input
            type="checkbox"
            checked={!!form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Active
        </label>

        <input type="file" accept="image/*" onChange={handleFileChange} />

        {preview && (
          <div className="mt-2 w-[120px] flex flex-col gap-2">
            <img
              src={preview}
              alt="Preview"
              className="rounded-lg w-20 h-20 object-cover shadow"
            />
            <div className="flex gap-4">
              <a
                href={preview}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View
              </a>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="mt-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-400 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
        >
          Save Product
        </button>
      </form>
    </div>
  );
}

/* ===========================
   Product List Component
=========================== */
function ProductList({ products, setProducts, token }: any) {
  async function updateProduct(p: Product) {
    const payload = { ...p };
    await j(`/api/admin/products/${p.id}`, "PUT", payload, token);
    alert("Product updated successfully!");
  }

  async function removeProduct(id: string) {
    await j(`/api/admin/products/${id}`, "DELETE", {}, token);
    setProducts(products.filter((x: Product) => x.id !== id));
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 flex flex-col gap-6">
      <h3 className="text-2xl font-bold text-red-600 mb-4">Existing Products</h3>

      {products.map((p: Product) => (
        <div key={p.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <input
              value={p.name}
              onChange={(e) =>
                setProducts(
                  products.map((x: Product) =>
                    x.id === p.id ? { ...x, name: e.target.value } : x
                  )
                )
              }
              className="rounded-lg border border-red-300 px-2 py-1 shadow"
            />
            <input
              value={p.category || ""}
              onChange={(e) =>
                setProducts(
                  products.map((x: Product) =>
                    x.id === p.id ? { ...x, category: e.target.value } : x
                  )
                )
              }
              className="rounded-lg border border-red-300 px-2 py-1 shadow"
            />
            <input
              type="number"
              value={p.mrp}
              onChange={(e) =>
                setProducts(
                  products.map((x: Product) =>
                    x.id === p.id ? { ...x, mrp: parseFloat(e.target.value) } : x
                  )
                )
              }
              className="rounded-lg border border-red-300 px-2 py-1 shadow"
              min={0}
              step={0.01}
            />
            <input
              type="number"
              value={p.price}
              onChange={(e) =>
                setProducts(
                  products.map((x: Product) =>
                    x.id === p.id ? { ...x, price: parseFloat(e.target.value) } : x
                  )
                )
              }
              className="rounded-lg border border-red-300 px-2 py-1 shadow"
              min={0}
              step={0.01}
            />
            <label className="flex items-center gap-2 font-medium text-red-600">
              <input
                type="checkbox"
                checked={p.is_active}
                onChange={(e) =>
                  setProducts(
                    products.map((x: Product) =>
                      x.id === p.id ? { ...x, is_active: e.target.checked } : x
                    )
                  )
                }
              />
              Active
            </label>
          </div>

          {p.image_url && (
            <div className="relative w-full max-w-xs">
              <img
                src={p.image_url}
                alt={p.name}
                className="rounded-xl shadow-lg w-full object-cover"
              />
              <button
                type="button"
                className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full shadow hover:bg-red-700 transition"
                onClick={() =>
                  setProducts(
                    products.map((x: Product) =>
                      x.id === p.id ? { ...x, image_url: undefined } : x
                    )
                  )
                }
              >
                X
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => updateProduct(p)}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-400 text-white font-bold rounded-xl shadow"
            >
              Update
            </button>
            <button
              onClick={() => removeProduct(p.id)}
              className="px-4 py-2 bg-gradient-to-r from-gray-300 to-red-200 text-red-700 font-bold rounded-xl shadow"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===========================
   Admin Panel Wrapper
=========================== */
export default function AdminPanel({
  user,
  token,
  me,
  products,
  setProducts,
}: AdminPanelProps) {
  if (!me?.admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-yellow-50 to-orange-100 p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md">
          <p className="text-red-600 font-semibold mb-4">
            Logged in as {user.email}. This account is not an admin.
          </p>
          <button
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-400 text-white font-bold rounded-xl shadow"
            onClick={() => signOut(auth)}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-orange-100 p-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-red-600">
            Admin Panel — Products
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">
              Logged in as{" "}
              <span className="text-red-600 font-bold">{user.email}</span>
            </span>
            <button
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-400 text-white font-bold rounded-xl shadow"
              onClick={() => signOut(auth)}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProductForm
            token={token}
            products={products}
            setProducts={setProducts}
          />
          <ProductList
            products={products}
            setProducts={setProducts}
            token={token}
          />
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { auth, signOut } from "../firebase";
import type { Product } from "../types";
import ProductForm from './admin-panel/add-prodect';
import ProductList from './admin-panel/ProductList';

interface AdminPanelProps {
  user: any;
  token: string;
  me: any;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

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
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md w-full">
          <p className="text-red-600 font-semibold mb-4 break-words">
            Logged in as {user.email}. This account is not an admin.
          </p>
          <button
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-400 text-white font-bold rounded-xl shadow w-full"
            onClick={() => signOut(auth)}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState("add"); // "add" or "list"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 sm:p-6 md:p-8 w-full">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-6 w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-700">
            Admin Panel
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <span className="text-gray-700 text-sm sm:text-base font-medium break-words">
              Logged in as <span className="font-bold text-blue-700">{user.email}</span>
            </span>
            <button
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-bold rounded-lg shadow transition duration-200 w-full sm:w-auto"
              onClick={() => signOut(auth)}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
          <button
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold transition duration-200 ${
              activeTab === "add"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50"
            }`}
            onClick={() => setActiveTab("add")}
          >
            Add Product
          </button>
          <button
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold transition duration-200 ${
              activeTab === "list"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50"
            }`}
            onClick={() => setActiveTab("list")}
          >
            All Products
          </button>
        </div>

        {/* Main Content */}
        <div className="w-full bg-white rounded-2xl shadow-lg p-6 md:p-8 mt-2">
          {activeTab === "add" && (
            <ProductForm token={token} products={products} setProducts={setProducts} />
          )}
          {activeTab === "list" && (
            <ProductList products={products} setProducts={setProducts} token={token} />
          )}
        </div>
      </div>
    </div>
  );
}

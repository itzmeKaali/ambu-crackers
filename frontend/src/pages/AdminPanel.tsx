import { useState } from "react";
import { auth, signOut } from "../firebase";
import type { Product } from "../types";
import ProductForm from "./admin-panel/add-prodect";
import ProductList from "./admin-panel/ProductList";
import AdminOrderList from "./admin-panel/Order";
import AdminOffer from "./admin-panel/Offfer";

import {
  HomeIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon, // For close button
  Bars3Icon, // For open button
} from "@heroicons/react/24/solid";

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

  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true); // Toggle state

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: HomeIcon },
    { id: "add", label: "Add Product", icon: PlusCircleIcon },
    { id: "list", label: "All Products", icon: ClipboardDocumentListIcon },
    { id: "AdminOffer", label: "Offers", icon: TagIcon },
    { id: "AdminOrderList", label: "Orders", icon: ShoppingBagIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex">
      {/* Sidebar - Desktop */}
      {sidebarOpen && (
        <aside className="hidden md:flex flex-col w-64 bg-white shadow-xl rounded-r-2xl p-6 gap-6 transition-all duration-300">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-extrabold text-blue-700">Admin Panel</h2>
            <button onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="w-6 h-6 text-gray-600 hover:text-red-500" />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white shadow"
                      : "text-blue-700 hover:bg-blue-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="mt-auto">
            <span className="block text-sm text-gray-600 mb-2">
              Logged in as <span className="font-bold">{user.email}</span>
            </span>
            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg w-full transition"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>
      )}

      {/* Sidebar Toggle Button */}
      {!sidebarOpen && (
        <div className="hidden md:flex items-center justify-center w-12 bg-white shadow rounded-l-lg cursor-pointer">
          <button onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="w-6 h-6 text-gray-600 hover:text-blue-600" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-8">
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-blue-700">Admin Panel</h2>
          <button
            onClick={() => signOut(auth)}
            className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg"
          >
            Logout
          </button>
        </div>

        {/* Content Card */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {activeTab === "dashboard" && (
            <div className="text-center text-gray-700">
              <h3 className="text-2xl font-bold text-blue-700 mb-4">
                Welcome, Admin 👋
              </h3>
              <p className="text-base">
                Use the navigation to manage products, offers, and orders.
              </p>
            </div>
          )}
          {activeTab === "add" && (
            <ProductForm
              token={token}
              products={products}
              setProducts={setProducts}
            />
          )}
          {activeTab === "list" && (
            <ProductList
              products={products}
              setProducts={setProducts}
              token={token}
            />
          )}
          
          {activeTab === "AdminOffer" && <AdminOffer                  token={token}
 />}
          {activeTab === "AdminOrderList" && <AdminOrderList />}
        </div>
      </main>

      {/* Bottom Tab Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white shadow-t p-2 flex justify-around border-t border-gray-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center text-xs ${
                activeTab === item.id ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

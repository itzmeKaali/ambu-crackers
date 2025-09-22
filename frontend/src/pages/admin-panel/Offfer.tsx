import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface Coupon {
  id: string;
  title: string;
  discount: number;
  companyName: string;
  theme: string; // color theme
}

const COLORS = [
  "from-pink-100 to-pink-300",
  "from-blue-100 to-blue-300",
  "from-green-100 to-green-300",
  "from-yellow-100 to-yellow-300",
  "from-purple-100 to-purple-300",
  "from-red-100 to-red-300",
  "from-indigo-100 to-indigo-300",
  "from-teal-100 to-teal-300",
];

export default function AdminOffer() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [companyName, setCompanyName] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  // Load coupons from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("coupons");
    if (stored) {
      setCoupons(JSON.parse(stored));
    }
  }, []);

  // Save coupons to localStorage
  useEffect(() => {
    localStorage.setItem("coupons", JSON.stringify(coupons));
  }, [coupons]);

  // Show confetti when coupons added
  useEffect(() => {
    if (coupons.length > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [coupons.length]);

  // Add new coupon
  const addCoupon = () => {
    if (!title || !discount || !companyName) return;

    const randomTheme = COLORS[Math.floor(Math.random() * COLORS.length)];

    const newCoupon: Coupon = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      discount,
      companyName,
      theme: randomTheme,
    };

    setCoupons((prev) => [...prev, newCoupon]);

    // reset form
    setTitle("");
    setDiscount(0);
    setCompanyName("");
  };

  // Delete coupon
  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="p-4 sm:p-8">
      {/* Screen-wide confetti */}
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={250}
          colors={["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"]}
        />
      )}

      {/* Coupon Creation Form */}
      <div className="max-w-xl mx-auto mb-8 bg-white p-5 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-lg font-bold mb-3 text-gray-800">
          Create New Voucher
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Coupon Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <input
            type="number"
            placeholder="Discount %"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <input
            type="text"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>
        <button
          onClick={addCoupon}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow hover:bg-blue-700 transition"
        >
          Add Voucher
        </button>
      </div>

      {/* Coupon List */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Current Vouchers
        </h2>

        {coupons.length === 0 && (
          <div className="bg-gray-50 p-5 rounded-lg shadow-inner text-center text-gray-500 text-base italic border border-gray-200">
            <p>No vouchers created yet. Add one above 👆</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`relative overflow-hidden bg-gradient-to-br ${coupon.theme} text-gray-800 p-4 rounded-xl shadow-lg border-2 border-dashed border-gray-300 group`}
            >
              {/* Multiple Fireworks spark loop inside */}
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1.3, 0.5],
                      rotate: [0, 90, 180],
                    }}
                    transition={{
                      duration: 2 + i,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                    className="absolute"
                  >
                    <Sparkles
                      className={`w-8 h-8 ${
                        i % 2 === 0 ? "text-yellow-400" : "text-pink-500"
                      }`}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCoupon(coupon.id);
                }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-90 hover:opacity-100 transition duration-200 z-20"
                aria-label="Remove coupon"
              >
                ×
              </button>

              {/* Coupon Content */}
              <div className="relative flex flex-col h-full justify-between z-10">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold leading-tight text-gray-900 mb-1">
                    {coupon.title}
                  </h3>

                  <div className="flex items-baseline mb-1">
                    <p className="text-2xl sm:text-3xl font-extrabold text-blue-800 leading-none">
                      {coupon.discount}
                    </p>
                    <span className="text-sm sm:text-lg font-bold text-blue-700 ml-1">
                      % OFF
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Valid for:</span>{" "}
                    {coupon.companyName}
                  </p>
                </div>

                <div className="border-t border-dashed border-gray-400 pt-1 text-[11px] sm:text-xs text-gray-600">
                  <p>
                    Voucher ID:{" "}
                    <span className="font-mono text-gray-800">{coupon.id}</span>
                  </p>
                  <p className="mt-1">
                    <strong>Conditions:</strong> See terms & conditions.
                  </p>
                </div>
              </div>

              {/* Perforated coupon cutout edges (top & bottom) */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full flex justify-between px-2">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-white rounded-full border border-gray-300"
                    ></div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 w-full flex justify-between px-2">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-white rounded-full border border-gray-300"
                    ></div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

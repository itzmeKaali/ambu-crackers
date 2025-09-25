import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { g, j } from "../../api";

interface Coupon {
  id: string;
  title: string;
  discount: number;
  theme: string;
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
  const [showConfetti, setShowConfetti] = useState(false);
  const token = localStorage.getItem("token");

  // Load vouchers
  useEffect(() => {
    if (!token) return;
    g("/api/vouchers", token)
      .then((data: any[]) => {
        setCoupons(
          (data || []).map((v) => ({
            id: v.code,
            title: v.code,
            discount: v.discount_value,
            theme: COLORS[Math.floor(Math.random() * COLORS.length)],
          }))
        );
      })
      .catch(() => setCoupons([]));
  }, [token]);

  // Confetti effect
  useEffect(() => {
    if (coupons.length > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [coupons.length]);

  // Add new voucher
  const addCoupon = async () => {
    if (!title || !discount) return;
    try {
      const payload = {
        code: title.trim(),
        discount_type: "percentage",
        discount_value: discount,
      };
      const data = await j("/api/vouchers", "POST", payload, token);
      setCoupons((prev) => [
        ...prev,
        {
          id: data.code,
          title: data.code,
          discount: data.discount_value,
          theme: COLORS[Math.floor(Math.random() * COLORS.length)],
        },
      ]);
      setTitle("");
      setDiscount(0);
    } catch (err: any) {
      alert(err.message || "Failed to add voucher");
    }
  };

  // Delete voucher
  const deleteCoupon = async (id: string) => {
    try {
      await j(`/api/vouchers/${id}`, "DELETE", undefined, token);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete voucher");
    }
  };

  return (
    <div className="p-4 sm:p-8">
      {showConfetti && <Confetti recycle={false} numberOfPieces={250} />}

      {/* Form */}
      <div className="max-w-xl mx-auto mb-8 bg-white p-5 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-lg font-bold mb-3">Create New Voucher</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Coupon Code"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Discount %"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={addCoupon}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-md"
        >
          Add Voucher
        </button>
      </div>

      {/* List */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Current Vouchers</h2>
        {coupons.length === 0 ? (
          <div className="bg-gray-50 p-5 rounded-lg text-center text-gray-500 italic">
            No vouchers created yet. Add one above 👆
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`relative overflow-hidden bg-gradient-to-br ${coupon.theme} p-4 rounded-xl shadow-lg`}
              >
                <button
                  onClick={() => deleteCoupon(coupon.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6"
                >
                  ×
                </button>
                <div>
                  <h3 className="text-lg font-bold">{coupon.title}</h3>
                  <p className="text-xl font-extrabold">{coupon.discount}% OFF</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

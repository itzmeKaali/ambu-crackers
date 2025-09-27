import { useEffect, useState } from "react";
import { g, j } from "../api";
import type { Product } from "../types";
import Select from "react-select";
import Default from "../assets/shop/products-def.jpg";
import useToast from "../pages/Toast/useToast";
import { ShoppingCart } from "lucide-react";
import CartPage from "./add-to-card"; // your full-page cart component

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast, ToastContainer } = useToast();
  const [categories, setCategories] = useState<string[]>([]);

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    coupon: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [couponApplied, setCouponApplied] = useState<string | null>(null);

  useEffect(() => {
    g("/api/products")
      .then((data: Product[]) => {
        setProducts(data || []);
        const cats = Array.from(
          new Set(data.map((p) => p.category).filter((c): c is string => Boolean(c)))
        );
        setCategories(cats.sort());
      })
      .catch(() => setProducts([]));
  }, []);

  const filteredProducts = category
    ? products.filter((p) => p.category === category)
    : products;

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
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  function validateCustomer() {
    const errs: { [key: string]: string } = {};
    if (!customer.name.trim()) errs.name = "Full Name is required";
    if (!customer.phone.trim()) errs.phone = "Phone Number is required";
    if (!customer.address.trim()) errs.address = "Shipping Address is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

async function applyCoupon() {
  const code = customer.coupon?.trim();
  if (!code) {
    addToast("Enter a coupon code", "info");
    return;
  }

  try {
    // Sending total as subtotal
    const res = await j("/api/orders/apply-coupon", "GET", { coupon_code: code, total });
    if (res && res.discount_percentage) {
      const discountAmount = (total * res.discount_percentage) / 100;
      addToast(`✅ Coupon applied! Discount: ₹${discountAmount.toFixed(2)}`, "success");
      setCouponApplied(code);
      // Optionally, you can subtract discount from total here or store discount in state
      // e.g., setDiscount(discountAmount);
    } else {
      addToast("❌ Invalid coupon", "error");
      setCouponApplied(null);
    }
  } catch (err) {
    addToast("❌ Failed to apply coupon", "error");
    setCouponApplied(null);
  }
}


  async function placeOrder() {
    if (!validateCustomer()) return;

    if (!items.length) {
      addToast("Add at least one product.", "warning");
      return;
    }

    const payload = {
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      customer_address: customer.address,
      items: items.map((p) => ({
        id: p.id,
        name: p.name,
        mrp: p.mrp,
        price: p.price,
        quantity: p.quantity,
      })),
      total,
      coupon_code: customer.coupon || null,
    };

    try {
      setLoading(true);
      const res = await j("/api/orders/quick-checkout", "POST", payload);
      addToast(`✅ Order placed! ID: ${res?.order_id || "-"}`, "success");
      setCart({});
      setCustomer({ name: "", email: "", phone: "", address: "", coupon: "" });
      setErrors({});
      setCouponApplied(null);
      setShowCart(false);
    } catch {
      addToast("❌ Failed to place order. Try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  const totalCartItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-orange-50 via-white to-red-50 pb-24 font-sans relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-red-700 mb-8">
          ✨ Premium Fireworks Collection
        </h2>

        {/* Category Filter */}
        <div className="mb-8 max-w-sm mx-auto">
          <Select
            options={categoryOptions}
            value={categoryOptions.find((opt) => opt.value === category)}
            onChange={(opt) => setCategory(opt?.value || "")}
            classNamePrefix="react-select"
            placeholder="Select category"
          />
        </div>

        {/* Product Grid */}
        <div className="grid gap-4 sm:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((p) => (
            <div key={p.id} className="flex flex-col bg-white rounded-lg shadow overflow-hidden">
              <div className="relative w-full h-36 sm:h-40 md:h-44 lg:h-48 bg-gray-100 overflow-hidden">
                <img
                  src={p.image_url || Default}
                  alt={p.name}
                  className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                />
                {cart[p.id] > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                    {cart[p.id]}
                  </span>
                )}
              </div>

              <div className="p-3 flex flex-col flex-1">
                <h4 className="text-sm sm:text-base font-medium text-gray-800 line-clamp-2 mb-1">
                  {p.name}
                </h4>
                {p.mrp && p.mrp > p.price && (
                  <p className="text-xs text-gray-400 line-through">₹ {p.mrp}</p>
                )}
                <p className="text-lg font-bold text-green-600 mb-2">₹ {p.price}</p>

                <button
                  onClick={() => add(p)}
                  className="w-full py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold rounded hover:scale-105 transition-transform flex items-center justify-center gap-1"
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Cart Button */}
        {totalCartItems > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="fixed bottom-5 left-5 bg-gradient-to-r from-red-600 to-orange-500 text-white p-4 rounded-full shadow-lg z-50 animate-bounce flex items-center justify-center"
          >
            <ShoppingCart size={22} />
            <span className="absolute -top-1 -right-1 bg-white text-red-600 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold border border-red-300">
              {totalCartItems}
            </span>
          </button>
        )}

        {/* Full Page Cart */}
        {showCart && (
          <CartPage
            items={items}
            cart={cart}
            add={add}
            remove={remove}
            total={total}
            customer={customer}
            setCustomer={setCustomer}
            errors={errors}
            couponApplied={couponApplied}
            applyCoupon={applyCoupon}
            placeOrder={placeOrder}
            setShowCart={setShowCart}
            loading={loading}
          />
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

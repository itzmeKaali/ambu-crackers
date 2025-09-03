import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import img1 from '../assets/home/home-1.jpg';
import img2 from '../assets/home/home-2.jpg';
import img3 from '../assets/home/home-3.jpg';

const sliderImages = [img1, img2, img3];

const highlights = [
  "🔥 Huge Festival Discounts up to 60% OFF!",
  "🚚 Free delivery for orders above ₹5,000.",
  "🎇 Premium Sivakasi crackers directly from factory.",
  "⚡ 24/7 Customer support for your orders.",
  "💳 Multiple payment options – UPI, Cards, COD.",
];

const features = [
  { title: "Best Price", text: "Massive festive discounts for you." },
  { title: "Fast Delivery", text: "Reliable and quick shipping partners." },
  { title: "100% Genuine", text: "Premium quality from Sivakasi." },
  { title: "Secure Payment", text: "UPI, Cards, and COD options available." },
  { title: "Customer Support", text: "24/7 assistance for all your queries." },
  { title: "Exclusive Products", text: "Limited edition crackers every season." },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      
      {/* Hero Section */}
      <section className="relative  mt-6">
        <div className="grid md:grid-cols-2 items-center gap-6 p-6 md:p-10 bg-white/80 backdrop-blur-sm rounded-3xl">
          
          {/* Text Content */}
          <div className="md:pr-10">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-3xl md:text-5xl font-extrabold text-gray-800 leading-tight"
            >
              Celebrate Bright with{" "}
              <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                AmbuCrackers
              </span>
            </motion.h1>
            <p className="mt-4 text-gray-700 text-lg">
              Premium Sivakasi fireworks delivered fast and safely. Enjoy quality and festive joy in every spark.
            </p>

            <div className="flex flex-wrap gap-4 mt-6">
              <Link
                to="/shop"
                className="px-6 py-3 rounded-xl shadow-lg font-medium bg-gradient-to-r from-red-600 to-orange-500 text-white  hover:scale-105  transition-transform duration-300"
              >
                Shop Now
              </Link>
              <Link
                to="/quick-checkout"
                className="px-6 py-3 rounded-xl font-medium border border-red-600 text-red-600 hover:bg-red-50 transition duration-300"
              >
                Quick Checkout
              </Link>
            </div>
          </div>

          {/* Image Slider */}
          <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg border-amber-300">
            <AnimatePresence>
              <motion.img
                key={currentSlide}
                src={sliderImages[currentSlide]}
                alt={`Fireworks ${currentSlide + 1}`}
                className="absolute w-full h-full object-cover rounded-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              />
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 px-4">
        {features.map((f, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-xl shadow p-6 text-center hover:shadow-2xl hover:scale-105 transition-transform duration-300"
            whileHover={{ y: -5 }}
          >
            <h3 className="text-lg font-bold text-red-600 mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.text}</p>
          </motion.div>
        ))}
      </section>

      {/* Scrolling Highlights */}
      <section className="mt-12 relative bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl shadow p-4 overflow-hidden h-16">
        <div className="absolute animate-marquee whitespace-nowrap text-red-700 font-semibold text-lg">
          {highlights.map((log, idx) => (
            <span key={idx} className="mx-8 inline-block">
              {log}
            </span>
          ))}
        </div>
      </section>

      {/* Optional Banner / CTA Section */}
      <section className="container mx-auto mt-12 rounded-2xl bg-red-600 text-white p-10 text-center shadow-lg">
        <h2 className="text-2xl md:text-4xl font-bold mb-4">Get Ready for the Festival!</h2>
        <p className="mb-6 text-lg md:text-xl">
          Grab exclusive deals and celebrate with AmbuCrackers. Limited stock available.
        </p>
        <Link
          to="/shop"
          className="px-8 py-4 bg-yellow-400 text-red-600 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
        >
          Explore Now
        </Link>
      </section>
    </div>
  );
}

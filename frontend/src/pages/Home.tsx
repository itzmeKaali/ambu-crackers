import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Truck, Tags, Sparkles, BadgePercent, Headphones } from "lucide-react";

import homese from "../assets/home/home-se.jpg";
import explore from "../assets/home/one.jpg";

// offer image 
import Offer1 from '../assets/home/offer-images/combo-offer.jpg';
import combooffer from '../assets/home/offer-images/combo-offer.jpg';
import Newone from '../assets/home/offer-images/new-one.jpg';
import Offer30 from '../assets/home/offer-images/offer-30.jpg';

const sliderImages = [Offer30, Newone, Offer1, combooffer];

const highlights = [
  "🔥 Festival Discounts up to 80% OFFER",
  "🎇 Premium Sivakasi Crackers",
  "⚡ 24/7 Customer Support",
];

const features = [
  { title: "Genuine Quality", text: "Sourced straight from Sivakasi.", icon: ShieldCheck },
  { title: "Fast Delivery", text: "Pan-India trusted logistics.", icon: Truck },
  { title: "Best Prices", text: "Direct factory rates without middlemen.", icon: Tags },
  { title: "Exclusive Deals", text: "Limited festive editions.", icon: BadgePercent },
  { title: "Premium Brightness", text: "High-luminance fireworks.", icon: Sparkles },
  { title: "24/7 Support", text: "We’re here whenever you are.", icon: Headphones },
];

export default function HomePro() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrentSlide((p) => (p + 1) % sliderImages.length), 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 text-gray-900">
      {/* --- Global small styles (marquee) --- */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 18s linear infinite; }
      `}</style>

    

      {/* --- HERO with Video Background --- */}
      <section className="relative isolate h-[75vh] md:h-[85vh] overflow-hidden rounded-b-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.35)]">
        {/* Background video */}
        <div className="absolute inset-0 -z-10">
          <video
            className="h-full w-full object-cover"
            preload="metadata"
            autoPlay
            loop
            muted
            playsInline
            poster={homese}
          >
            <source src="/videos/fireworks.webm" type="video/webm" />
            <source src="/videos/fireworks.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 h-full flex items-center">
          <div className="w-full grid md:grid-cols-2 gap-10 items-center">
            {/* Text Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center md:text-left"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight text-white leading-snug sm:leading-tight drop-shadow-lg">
                Celebrate Bright with
                <span className="block bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                  AmbuCrackers
                </span>
              </h1>

              <p className="mt-4 sm:mt-6 text-white/90 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-xl mx-auto md:mx-0">
                Ultra-bright Sivakasi fireworks, fast delivery, and festival-ready
                service. Safe, premium, unforgettable.
              </p>

              {/* Buttons */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-red-600 to-orange-500 shadow-lg hover:shadow-2xl hover:scale-105 hover:brightness-110 transition"
                >
                  Shop Now
                </Link>
                <Link
                  to="/quick-checkout"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold border-2 border-white/80 text-white hover:bg-white/10 backdrop-blur-md transition"
                >
                  Quick Checkout
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 opacity-95">
                {["Genuine", "Fast Delivery", "Secure Pay", "24/7 Support"].map((b) => (
                  <div
                    key={b}
                    className="text-[11px] sm:text-xs md:text-sm text-white/90 bg-white/10 rounded-xl px-3 py-2 backdrop-blur-md border border-white/20 text-center"
                  >
                    {b}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Slider */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full h-[200px] xs:h-[250px] sm:h-[300px] md:h-[380px] lg:h-[420px] rounded-3xl overflow-hidden border border-white/30 shadow-2xl"
            >
              <AnimatePresence>
                <motion.img
                  key={currentSlide}
                  src={sliderImages[currentSlide]}
                  alt={`Showcase ${currentSlide + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9 }}
                  loading="eager"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Highlight Marquee --- */}
      <section className="relative mt-10">
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 to-orange-500 py-4 sm:py-5">
          <div className="whitespace-nowrap flex gap-16 marquee-track text-white font-semibold text-sm sm:text-lg">
            {[...highlights, ...highlights].map((t, i) => (
              <span key={i} className="inline-block opacity-95">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* --- Features --- */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 mt-16 md:mt-24">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center">
          Why choose <span className="text-red-600">AmbuCrackers</span>?
        </h2>
        <p className="mt-3 text-center text-gray-600 max-w-2xl mx-auto">
          Premium quality, fair pricing, and white-glove support — engineered for a flawless festival.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(({ title, text, icon: Icon }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className="group relative bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition"
            >
              <div className="flex items-start gap-5">
                <div className="shrink-0 rounded-2xl p-4 bg-gradient-to-br from-amber-100 to-rose-100 border border-amber-200 shadow-inner">
                  <Icon className="h-7 w-7 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold">{title}</h3>
                  <p className="mt-1 text-gray-600 text-sm md:text-base">{text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- Testimonial / Social Proof strip --- */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 mt-20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-3xl p-8 bg-white border border-gray-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition">
            <p className="text-lg font-semibold">4.8/5 Average Rating</p>
            <p className="mt-1 text-gray-600 text-sm">Based on 12,000+ orders last season.</p>
          </div>
          <div className="rounded-3xl p-8 bg-white border border-gray-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition">
            <p className="text-lg font-semibold">Pan-India Delivery</p>
            <p className="mt-1 text-gray-600 text-sm">Trusted partners, fast dispatch.</p>
          </div>
          <div className="rounded-3xl p-8 bg-white border border-gray-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition">
            <p className="text-lg font-semibold">Safety First</p>
            <p className="mt-1 text-gray-600 text-sm">Quality-checked, compliant packaging.</p>
          </div>
        </div>
      </section>

      {/* --- CTA Banner --- */}
      <section className="relative mt-20 mb-16">
        <div
          className="relative max-w-7xl mx-auto h-[300px] sm:h-[380px] md:h-[460px] rounded-3xl overflow-hidden shadow-2xl"
          style={{ backgroundImage: `url(${explore})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative z-10 h-full w-full flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-2xl"
            >
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-2xl">
                Make this Festival Unforgettable
              </h3>
              <p className="mt-3 text-white/90">
                Premium assortments, rapid delivery, and stellar support — all in one place.
              </p>
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="mt-6"
              >
                <Link
                  to="/shop"
                  className="inline-flex px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-xl hover:shadow-2xl hover:translate-y-[-1px] transition"
                >
                  Explore Collection
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

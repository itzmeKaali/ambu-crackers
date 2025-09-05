import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Truck, CreditCard, Sparkles, BadgePercent, Headphones } from "lucide-react";

// import img1 from "../assets/home/home-1.jpg";
// import img2 from "../assets/home/home-2.jpg";
// import img3 from "../assets/home/home-3.jpg";
import homese from "../assets/home/home-se.jpg";
import explore from '../assets/home/panner.jpg'

// trending collections images
import Wheel from "../assets/home/trending collections/Chakri (Wheel).jpg";
import bijili from "../assets/home/trending collections/bijili.jpg";
import rocket from "../assets/home/trending collections/Rocket.jpg";
import autobomb from "../assets/home/trending collections/auto-boumb.jpg";

// offer image 
import Offer1 from '../assets/home/offer-images/combo-offer.jpg';
import combooffer from '../assets/home/offer-images/combo-offer.jpg';
import Newone from '../assets/home/offer-images/new-one.jpg';
import Offer30 from '../assets/home/offer-images/offer-30.jpg';

const sliderImages = [Offer30, Newone, Offer1, combooffer];


const highlights = [
  "🔥 Festival Discounts up to 60% OFF",
  "🚚 Free Delivery above ₹5,000",
  "🎇 Premium Sivakasi Crackers",
  "⚡ 24/7 Customer Support",
  "💳 UPI · Cards · COD",
];

const features = [
  { title: "Genuine Quality", text: "Sourced straight from Sivakasi.", icon: ShieldCheck },
  { title: "Fast Delivery", text: "Pan-India trusted logistics.", icon: Truck },
  { title: "Secure Payments", text: "UPI, Cards & COD options.", icon: CreditCard },
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
      <section className="relative isolate h-[68vh] md:h-[80vh] overflow-hidden rounded-b-[2rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)]">
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
          {/* soft vignette */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />
        </div>


        {/* Content */}
     <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 h-full flex items-center">
  <div className="w-full grid md:grid-cols-2 gap-8 md:gap-10 items-center">
    {/* Text Section */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center md:text-left"
    >
      <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-snug sm:leading-tight">
        Celebrate Bright with
        <span className="block bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
          AmbuCrackers
        </span>
      </h1>

      <p className="mt-4 sm:mt-5 text-white/90 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
        Ultra-bright Sivakasi fireworks, fast delivery, and festival-ready
        service. Safe, premium, unforgettable.
      </p>

      {/* Buttons */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center md:justify-start">
        <Link
          to="/shop"
          className="inline-flex items-center justify-center px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-2xl font-semibold text-white bg-gradient-to-r from-red-600 to-orange-500 shadow-lg hover:scale-[1.03] hover:shadow-xl transition"
          aria-label="Shop crackers now"
        >
          Shop Now
        </Link>
        <Link
          to="/quick-checkout"
          className="inline-flex items-center justify-center px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-2xl font-semibold border-2 border-white/70 text-white hover:bg-white/10 backdrop-blur-sm transition"
          aria-label="Quick checkout"
        >
          Quick Checkout
        </Link>
      </div>

      {/* Trust badges */}
      <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 opacity-95">
        {["Genuine", "Fast Delivery", "Secure Pay", "24/7 Support"].map((b) => (
          <div
            key={b}
            className="text-[10px] sm:text-xs md:text-sm text-white/90 bg-white/10 rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 backdrop-blur-md border border-white/20 text-center"
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
      className="relative w-full h-[180px] xs:h-[220px] sm:h-[260px] md:h-[320px] lg:h-[380px] rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
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
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
    </motion.div>
  </div>
</div>

      </section>

      {/* --- Highlight Marquee --- */}
      <section className="relative mt-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 to-orange-500 py-3">
          <div className="whitespace-nowrap flex gap-12 marquee-track text-white font-medium text-sm sm:text-base">
            {/* Duplicate for seamless loop */}
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
          Premium quality, fair pricing, and white‑glove support — engineered for a flawless festival.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map(({ title, text, icon: Icon }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className="group relative bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-2xl p-3 bg-gradient-to-br from-amber-100 to-rose-100 border border-amber-200">
                  <Icon className="h-6 w-6 text-red-600" />
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

      {/* --- Category / Collection Preview (optional) --- */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 mt-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-extrabold">Trending Collections</h2>
          <Link to="/shop" className="text-red-600 font-semibold hover:underline">View all</Link>
        </div>
        <div className="mt-6 grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[bijili, autobomb, rocket, Wheel].map((src, i) => (
            <div key={i} className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <img src={src} alt={`Collection ${i + 1}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold bg-white/80 backdrop-blur border border-white/60">
                  <Sparkles className="h-4 w-4 text-red-600" /> Best Sellers
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Testimonial / Social Proof strip --- */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 mt-20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm">
            <p className="text-lg font-semibold">4.8/5 Average Rating</p>
            <p className="mt-1 text-gray-600 text-sm">Based on 12,000+ orders last season.</p>
          </div>
          <div className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm">
            <p className="text-lg font-semibold">Pan‑India Delivery</p>
            <p className="mt-1 text-gray-600 text-sm">Trusted partners, fast dispatch.</p>
          </div>
          <div className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm">
            <p className="text-lg font-semibold">Safety First</p>
            <p className="mt-1 text-gray-600 text-sm">Quality‑checked, compliant packaging.</p>
          </div>
        </div>
      </section>

      {/* --- CTA Banner --- */}
      <section className="relative mt-20 mb-16">
        <div
          className="relative max-w-7xl mx-auto h-[280px] sm:h-[340px] md:h-[400px] rounded-3xl overflow-hidden"
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
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow">
                Make this Festival Unforgettable
              </h3>
              <p className="mt-3 text-white/90">
                Premium assortments, rapid delivery, and stellar support — all in one place.
              </p>
              <motion.div initial={{ scale: 1 }} animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 1.8 }} className="mt-6">
                <Link to="/shop" className="inline-flex px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-xl hover:shadow-2xl hover:translate-y-[-1px] transition">
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

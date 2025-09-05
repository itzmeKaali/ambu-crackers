
function Footer() {
  return (
    <footer className="w-full backdrop-blur-lg bg-black/40 text-white py-6 mt-auto border-t border-white/20 shadow-[0_-4px_30px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">

        <span className="text-sm text-center md:text-left">© {new Date().getFullYear()} AmbuCrackers — Sivakasi • Best Price • Fast Delivery</span>
        <div className="mt-2 md:mt-0 flex space-x-4">
          <a href="/" className="hover:text-blue-400 transition">Home</a>
          <a href="/shop" className="hover:text-blue-400 transition">Shop</a>
          <a href="/contact" className="hover:text-blue-400 transition">Contact</a>
        </div>
      </div>
    </footer>
  );
}
export default Footer
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "Quick Checkout", path: "/quick-checkout" },
  { name: "Price List", path: "/price-list" },
  { name: "Contact", path: "/contact" },
  { name: "Admin", path: "/admin" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="w-full fixed top-0 left-0 z-50 border-b border-white/20 bg-white/40 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          to="/"
          className="font-semibold bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent text-3xl tracking-wide"
        >
          AmbuCrackers
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`relative font-medium transition-all duration-300 
                ${
                  location.pathname === link.path
                    ? "bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-red-500 after:to-orange-400"
                    : "bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 bg-clip-text text-transparent hover:from-red-500 hover:via-orange-400 hover:to-yellow-400"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="p-2 rounded-md text-gray-800 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  mobileOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white/70 backdrop-blur-md border-t border-white/20 shadow-lg w-full"
          >
            <div className="flex flex-col px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 
                    ${
                      location.pathname === link.path
                        ? "bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent font-semibold"
                        : "bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 bg-clip-text text-transparent hover:from-red-500 hover:via-orange-400 hover:to-yellow-400"
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;


import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
    return (
        <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center">
                    <Link to="/" className="text-2xl font-bold text-blue-600">AmbuCrackers</Link>
                </div>
                {/* Navigation */}
                <nav className="hidden md:flex space-x-6">
                    <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition">Home</Link>
                    <Link to="/shop" className="text-gray-700 hover:text-blue-600 font-medium transition">Shop</Link>
                    <Link to="/quick-checkout" className="text-gray-700 hover:text-blue-600 font-medium transition">Quick Checkout</Link>
                    <Link to="/price-list" className="text-gray-700 hover:text-blue-600 font-medium transition">Price List</Link>
                    <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition">Contact</Link>
                    <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium transition">Admin</Link>
                </nav>
                {/* Mobile menu button */}
                <div className="md:hidden flex items-center">
                    <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none" aria-label="Open menu" onClick={() => {
                        const menu = document.getElementById('mobile-menu');
                        if (menu) menu.classList.toggle('hidden');
                    }}>
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
            {/* Mobile Menu */}
            <div id="mobile-menu" className="md:hidden hidden bg-white shadow-lg">
                <nav className="px-2 pt-2 pb-4 space-y-1">
                    <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 transition">Home</Link>
                    <Link to="/shop" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 transition">Shop</Link>
                    <Link to="/quick-checkout" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 transition">Quick Checkout</Link>
                    <Link to="/price-list" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 transition">Price List</Link>
                    <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 transition">Contact</Link>
                    <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 transition">Admin</Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
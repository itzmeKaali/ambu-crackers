
function Footer() {
    return (
        <footer className="w-full bg-gray-900 text-gray-100 py-4 mt-auto shadow-inner">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
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
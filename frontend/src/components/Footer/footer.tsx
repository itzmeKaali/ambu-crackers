import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";

function Footer() {
  return (
    <footer className="relative w-full bg-gradient-to-t from-orange-50 via-amber-50 to-yellow-50 text-gray-900">
      {/* Glassy Background Overlay */}
      <div className="absolute inset-0 z-0 bg-white/5 backdrop-blur-sm"></div>

      {/* Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-16">
        
        {/* Brand & About */}
        <div className="flex flex-col space-y-4 col-span-1 lg:col-span-1">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-red-600">AmbuCrackers</h2>
          <p className="leading-relaxed text-gray-700 text-sm sm:text-base">
            Premium Sivakasi fireworks, guaranteed quality, and festival joy delivered safely to your home.
          </p>
        </div>

        {/* Quick Links or Contact */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Contact Us</h3>
          <div className="flex flex-col gap-3">
            {/* Phone Numbers */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:gap-3">
              <FaPhoneAlt className="text-red-600 w-5 h-5 sm:mt-1" />
              <div className="flex flex-col gap-1 text-gray-700 text-sm">
                <a href="tel:7598336499" className="hover:text-red-600 transition">+91 75983 36499</a>
                <a href="tel:9943745078" className="hover:text-red-600 transition">+91 99437 45078</a>
                <a href="tel:8072713566" className="hover:text-red-600 transition">+91 80727 13566</a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 text-gray-700 text-sm">
              <FaEnvelope className="text-red-600 w-5 h-5" />
              <a href="mailto:ambucrackers@gmail.com" className="hover:text-red-600 transition">
                contact@ambucrackers.com
              </a>
            </div>
          </div>
        </div>

        {/* Location / Address */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Our Location</h3>
          <div className="flex items-start gap-3">
            <FaMapMarkerAlt className="text-red-600 w-5 h-5 mt-1" />
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              1/372c, Vadamalapuram Rd, <br />
              Sivakasi, Kiltiruthangal, <br />
              Tamil Nadu 626130
            </p>
          </div>
        </div>

        {/* Map / Optional */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Find Us On Map</h3>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=AmbuCrackers"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.072245678176!2d79.1337!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a528dfd2a3d9d7b%3A0x63d0a4b1d1c0ad2c!2sAmbuCrackers!5e0!3m2!1sen!2sin!4v1695657750000!5m2!1sen!2sin"
              width="100%"
              height="150"
              className="rounded-2xl pointer-events-none"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300/30 relative z-10"></div>

      {/* Bottom Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-4 text-center md:text-left text-gray-500 text-xs sm:text-sm">
        © {new Date().getFullYear()} AmbuCrackers — All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;

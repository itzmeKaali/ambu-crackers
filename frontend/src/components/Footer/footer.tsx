import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";

function Footer() {
  return (
    <footer className="relative w-full overflow-hidden">
      {/* Subtle Glassy Background */}
      <div className="absolute inset-0 z-0 bg-cyan-500/5 backdrop-blur-sm"></div>
      
      {/* Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-sm md:text-base text-black">

        {/* Brand & Info */}
        <div className="flex flex-col space-y-4 col-span-1 lg:col-span-2">
          <h2 className="text-4xl font-extrabold tracking-tight">
            AmbuCrackers
          </h2>
          <p className="leading-relaxed max-w-sm text-black/80">
            Offering a premium collection of fireworks. We are committed to quality, safety, and bringing joy to your celebrations.
          </p>
        </div>

        {/* Contact Section */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-bold text-black/80">Get in Touch</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <FaPhoneAlt className="text-black/70 min-w-4" />
              <div className="flex flex-col">
                <a href="tel:7598336499" className="hover:text-black transition-colors">7598336499</a>
                <a href="tel:9943745078" className="hover:text-black transition-colors">9943745078</a>
                <a href="tel:8072713566" className="hover:text-black transition-colors">8072713566</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-black/70 min-w-4" />
              <a href="mailto:contact@ambucrackers.com" className="hover:text-black transition-colors">contact@ambucrackers.com</a>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-bold text-black/80">Find Us</h3>
          <div className="flex items-start gap-3">
            <FaMapMarkerAlt className="text-black/70 mt-1 min-w-4" />
            <p className="leading-snug text-black/80">
              1/372c, Vadamalapuram Rd, <br/>Sivakasi, Kiltiruthangal, <br/>Tamil Nadu 626130
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-black/10 relative z-10"></div>

      {/* Bottom Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-4 text-center md:text-left text-black/50 text-xs md:text-sm">
        <span>© {new Date().getFullYear()} AmbuCrackers — All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;

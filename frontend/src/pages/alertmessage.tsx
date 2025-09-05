import { useEffect, useState } from "react";

export default function DisclaimerWrapper({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    try {
      const shown = localStorage.getItem("disclaimer_shown");
      if (!shown) setShowPopup(true);
    } catch (err) {
      console.error("Disclaimer check failed:", err);
    }
    setLoaded(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("disclaimer_shown", "true");
    setShowPopup(false);
  };

  if (!loaded) return null;

  return (
    <>
      {children}

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/70 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-xl rounded-lg overflow-hidden shadow-2xl bg-white border border-neutral-300 animate-fadeIn">
            
            {/* Header */}
            <header className="bg-red-700 text-white px-6 py-4">
              <h2 className="text-lg md:text-xl font-semibold tracking-wide">
                Important Legal Notice
              </h2>
            </header>

            {/* Body */}
            <section className="p-6 space-y-4 text-neutral-800 text-sm md:text-base leading-relaxed">
              <p>
                In compliance with the <strong>2018 Supreme Court order</strong>, 
                <span className="text-red-700 font-medium"> online sales of firecrackers are strictly prohibited.</span>
              </p>
              <p>
                Customers may add products to their cart and submit the list using the 
                <span className="font-medium"> Checkout button</span>. Orders will be confirmed within 
                <span className="font-medium"> 48 hours</span> via WhatsApp or phone.
              </p>
              <p>
                <strong>Rain or Ambu Crackers</strong> 
                (LICENSE NO: <strong>45/2024</strong>, GST: <strong>33ABHFR2800B1ZV</strong>) 
                fully complies with the <strong>Explosives Act</strong>. 
                Delivery is arranged exclusively through <span className="font-medium text-green-700">authorized transport services</span>.
              </p>
              <p className="text-xs text-neutral-500 text-center pt-2">
                © 2025 Rain or Shine Sivakasi Crackers · Powered by Monkworks
              </p>
            </section>

            {/* Footer */}
            <footer className="bg-neutral-50 px-6 py-4 flex justify-center">
              <button
                onClick={handleAccept}
                className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-colors"
              >
                I Understand
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Minimal subtle animation */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.35s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

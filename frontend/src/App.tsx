import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./styles.css";
import "./index.css";
import FireworksCursor from "./components/FireworksCursor";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import QuickCheckout from "./pages/QuickCheckout";
import PriceList from "./pages/PriceList";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Footer from "./components/Footer/footer";
import Header from "./components/header/header";
import DisclaimerWrapper from "./pages/alertmessage";
import { FaWhatsapp } from "react-icons/fa";

function App() {

  // WhatsApp Button Component
  function WhatsAppButton() {
    const location = useLocation();

    // Hide button on admin page
    if (location.pathname === "/admin") return null;

    return (
      <a
        href="https://wa.me/message/6NZTS3KJX6BPP1"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-3 rounded-full bg-green-500 shadow-xl transition-all duration-300 hover:bg-green-600 hover:scale-110 group"
      >
        <span className="text-white text-2xl"> <FaWhatsapp /> </span>
      </a>
    );
  }

  return (

    <BrowserRouter>

      <FireworksCursor />
      <WhatsAppButton /> {/* Will auto-hide on /admin */}

      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 flex justify-center items-start px-xs-4 mt-[80px] ">
          <DisclaimerWrapper>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/quick-checkout" element={<QuickCheckout />} />
              <Route path="/price-list" element={<PriceList />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </DisclaimerWrapper>

        </main>

        {/* Footer */}
        <Footer />
      </div>
    </BrowserRouter >
  );
}

export default App;

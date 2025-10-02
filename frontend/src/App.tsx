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
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  // WhatsApp Button (hide on admin)
  function WhatsAppButton() {
    if (isAdminPage) return null;

    return (
      <a
        href="https://wa.me/message/6NZTS3KJX6BPP1"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-3 rounded-full bg-green-500 shadow-xl transition-all duration-300 hover:bg-green-600 hover:scale-110 group"
      >
        <span className="text-white text-2xl">
          <FaWhatsapp />
        </span>
      </a>
    );
  }

  // Phone Call Button (hide on admin)
  function PhoneButton() {
    if (isAdminPage) return null;

    return (
      <a
        href="tel:7598336499"
        className="fixed bottom-20 right-6 z-50 flex items-center gap-2 px-3 py-3 rounded-full bg-blue-500 shadow-xl transition-all duration-300 hover:bg-blue-600 hover:scale-110 group"
      >
        <span className="text-white text-2xl">
          <FaPhoneAlt />
        </span>
      </a>
    );
  }

  // If admin page → return children directly (no header/footer)
  if (isAdminPage) {
    return <>{children}</>;
  }

  // Default layout (with header/footer)
  return (
    <div className="flex flex-col min-h-screen">
      <FireworksCursor />
      <WhatsAppButton />
      <PhoneButton />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex justify-center items-start px-xs-4 mt-[80px]">
        <DisclaimerWrapper>{children}</DisclaimerWrapper>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route
          path="/"
          element={
            <AppLayout>
              <Home />
            </AppLayout>
          }
        />
        <Route
          path="/shop"
          element={
            <AppLayout>
              <Shop />
            </AppLayout>
          }
        />
        <Route
          path="/quick-checkout"
          element={
            <AppLayout>
              <QuickCheckout />
            </AppLayout>
          }
        />
        <Route
          path="/price-list"
          element={
            <AppLayout>
              <PriceList />
            </AppLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <AppLayout>
              <Contact />
            </AppLayout>
          }
        />

        {/* Admin Page → opens without layout */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

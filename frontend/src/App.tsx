import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {


  return (
    <BrowserRouter>
      <FireworksCursor />
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

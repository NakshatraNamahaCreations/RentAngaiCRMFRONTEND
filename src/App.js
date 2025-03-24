import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { Navbar, Footer, Sidebar, ThemeSettings } from "./components";
import Signin from "./components/Signin";
import {
  Dashboard,
  Orders,
  Calendar,
  Customers,
  Kanban,
  ColorPicker,
  Editor,
  Clients,
  Category,
  Banner,
  Subcategory,
  Product,
  AddProduct,
  Inventory,
  PaymentReport,
  Quotations,
  EditProduct,
  Master,
  Refurbishment,
  Worders,
  QuotationFormat,
  Enquiry,
  EnquiryDetails,
  EnquiryCalendar,
} from "./pages";
import { useStateContext } from "./contexts/ContextProvider";

import "./App.css";
import Login from "./components/Login";
import ClientDetails from "./pages/ClientDetails";
import OrdersDetails from "./pages/OrdersDetails";
import TermsandCondition from "./pages/TermsandCondition";
import SalesLinegraph from "./pages/SalesLinegraph";
import DayEnquiry from "./pages/DayEnquiry";
import DayOrders from "./pages/DayOrder";
import Enquirynew from "./pages/Enquirynew";
import GerrateInvoice from "./pages/GenrateInvoice";
import RefurbishmentData from "./pages/RefurbishmentData";
import GenrateRefurbishment from "./pages/GenrateRefurbishment";


// Layout component
const Layout = ({ children }) => {
  const location = useLocation();
  const {
    currentMode,
    activeMenu,
    currentColor,
    themeSettings,
    setThemeSettings,
  } = useStateContext();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signin" ||
    location.pathname === "/";

  return (
    <div className={currentMode === "Dark" ? "dark" : ""}>
      <div className="flex relative dark:bg-main-dark-bg">
        {!isAuthPage && (
          <>
            {/* Settings Button */}
            <div className="fixed right-4 bottom-4 z-50">
              <TooltipComponent content="Settings" position="Top">
                <button
                  type="button"
                  className="text-3xl p-3 hover:drop-shadow-xl hover:bg-light-gray text-white"
                  style={{ background: currentColor, borderRadius: "50%" }}
                  onClick={() => setThemeSettings(true)}
                >
                  <FiSettings />
                </button>
              </TooltipComponent>
            </div>

            {/* Sidebar */}
            {activeMenu ? (
              <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
                <Sidebar />
              </div>
            ) : (
              <div className="w-0 dark:bg-secondary-dark-bg">
                <Sidebar />
              </div>
            )}
          </>
        )}

        <div
          className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full ${
            activeMenu && !isAuthPage ? "md:ml-72" : "flex-2"
          }`}
        >
          {!isAuthPage && (
            <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
              <Navbar />
            </div>
          )}

          <div>
            {/* Theme settings dialog */}
            {themeSettings && <ThemeSettings />}
            {children}
          </div>

          {!isAuthPage && <Footer />}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const { setCurrentColor, setCurrentMode } = useStateContext();

  // Get theme color & mode
  useEffect(() => {
    const currentThemeColor = localStorage.getItem("colorMode");
    const currentThemeMode = localStorage.getItem("themeMode");
    if (currentThemeColor && currentThemeMode) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, [setCurrentColor, setCurrentMode]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/invoice" element={<GerrateInvoice />} />
          <Route path="/orders/details" element={<OrdersDetails />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/details" element={<ClientDetails />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/color-picker" element={<ColorPicker />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/category" element={<Category />} />
          <Route path="/Enquiry" element={<Enquiry />} />
          <Route path="/EnquiryDetails/:name" element={<EnquiryDetails />} />
          <Route path="/banner" element={<Banner />} />
          <Route path="/subcategory" element={<Subcategory />} />
          <Route path="/product" element={<Product />} />
          <Route path="/addproduct" element={<AddProduct />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/paymentreport" element={<PaymentReport />} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/editproduct" element={<EditProduct />} />
          <Route path="/master" element={<Master />} />
          <Route path="/RefurbishmentReport" element={<Refurbishment />} />
          <Route path="/refurbishmentdata" element={<RefurbishmentData />} />
          <Route path="/refurbishmentinvoice/:orderId" element={<GenrateRefurbishment />} />
          <Route path="/warehouse-orders" element={<Worders />} />
          <Route path="/quotationformat/:id" element={<QuotationFormat />} />
          <Route path="/enquiry-calendar" element={<EnquiryCalendar />} />
          <Route path="/terms&conditions" element={<TermsandCondition />} />
          <Route path="/enquiries-by-date/:date" element={<DayEnquiry />} />
          <Route path="/order-by-date/:date" element={<DayOrders />} />
          <Route path="/newEnquiry/:name" element={<Enquirynew />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;

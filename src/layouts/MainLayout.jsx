import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CartDrawer from "../Components/cart/CartDrawer";
import ChatWidget from "../Components/ChatWidget/ChatWidget";
import Footer from "../Components/Common/Footer";
import Navbar from "../Components/Common/Navbar";
import ScrollToTop from "../Components/Common/ScrollToTop";
import CashOnDeliveryModal from "../Components/Modal/CashOnDeliveryModal";
import OnlinePaymentModal from "../Components/Modal/OnlinePaymentModal";

function MainLayout() {
    const [openCOD, setOpenCOD] = useState(false);
    const [openOnline, setOpenOnline] = useState(false);

    const location = useLocation();

    // Facebook Pixel Route Tracking
    useEffect(() => {
        if (window.fbq) {
            window.fbq("track", "PageView");
        }
    }, [location]);

    return (
        <div className="bg-white">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                theme="light"
            />

            <ScrollToTop />
            <Navbar />

            <CartDrawer
                onCODClick={() => setOpenCOD(true)}
                onPlayOnline={setOpenOnline}
            />

            <CashOnDeliveryModal
                open={openCOD}
                onClose={() => setOpenCOD(false)}
            />

            <OnlinePaymentModal
                open={openOnline}
                onClose={() => setOpenOnline(false)}
            />

            <ChatWidget />

            <Outlet />

            <div className="pt-6 md:pt-8">
                <Footer />
            </div>
        </div>
    );
}

export default MainLayout;
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { CartContext } from "../context/CartContext";

const OnlinePaymentModal = ({ open, onClose }) => {
  const { cart, clearCart, setIsDrawerOpen } = useContext(CartContext);
  const navigate = useNavigate();
  const tempUserId = localStorage.getItem("temp_user_id") || "";

  const [animate, setAnimate] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    shipping: "dhaka",
    note: "",
  });
  const [coupon, setCoupon] = useState("");

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const handlePayOnline = async () => {
    if (!form.name || !form.phone || !form.address) {
      toast.error("সব তথ্য পূরণ করুন");
      return;
    }

    const payload = {
      name: form.name,
      phone: form.phone,
      address: form.address,
      note: form.note,
      shipping_cost: form.shippingCharge,
      coupon,
      cart: [...cart],
      temp_user_id: tempUserId,
      payment_method: "online",
    };

    try {
      const res = await api.post("/gust/user/order/store/online", payload);

      if (res.data?.result) {
        const orderId = res.data?.order_id;
        toast.success("Payment initiated ✅");

        if (res.data?.payment_url) {
          window.location.href = res.data.payment_url;
          return;
        }

        clearCart();
        localStorage.removeItem("temp_user_id");
        onClose();
        setIsDrawerOpen(false);
        navigate(`/purchase-order/${orderId}`);
      } else {
        toast.error(res.data.message || "Payment failed");
      }
    } catch {
      toast.error("Payment failed");
    }
  };

  const subtotal = cart.reduce((s, i) => s + parseFloat(i.price) * i.qty, 0);
  const shippingCharge = form.shipping === "dhaka" ? 0 : 0;
  const total = subtotal + shippingCharge;

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className={`bg-white w-full sm:w-4/6 md:w-2/5 rounded shadow-lg
          max-h-[90vh] overflow-y-auto transform transition-all duration-300
          ${animate ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        >
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-sm sm:text-base md:text-lg">
              অনলাইন পেমেন্টের জন্য আপনার তথ্য দিন
            </h2>
            <button onClick={onClose} className="text-xl font-bold">
              ×
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 text-sm sm:text-base">
            {/* Phone */}
            <input
              placeholder="ফোন নাম্বার"
              className="w-full bg-white border p-2 rounded"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            {/* Name */}
            <input
              placeholder="আপনার নাম"
              className="w-full bg-white border p-2 rounded"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            {/* Address */}
            <textarea
              placeholder="এড্রেস"
              className="w-full bg-white border p-2 rounded resize-none"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            {/* Shipping */}
            <div>
              <p className="font-medium mb-1">শিপিং মেথড</p>
              {[
                ["dhaka", "ঢাকা সিটির ভিতরে", 0],
                ["outsite", "ঢাকা সিটির বাহিরে", 0],
              ].map(([key, label, price]) => (
                <label
                  key={key}
                  className="flex justify-between border p-2 rounded mb-1 cursor-pointer bg-white"
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={form.shipping === key}
                      onChange={() => setForm({ ...form, shipping: key })}
                      className="mr-2"
                    />
                    <span>{label}</span>
                  </div>
                  <span>Tk {price.toFixed(2)}</span>
                </label>
              ))}
            </div>

            {/* Coupon */}
            <div>
              <p className="font-medium mb-1">কুপন কোড</p>
              <div className="flex gap-2">
                <input
                  placeholder="Enter coupon code"
                  className="flex-1 bg-white border p-2 rounded"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <button
                  onClick={() => toast.info("Coupon feature coming soon")}
                  className="px-4 bg-gray-200 rounded"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="border-t pt-2 space-y-2">
              {cart.map((i) => (
                <div key={i.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img
                      src={i.image || i.thumbnail_image}
                      className="w-16 h-14 object-cover rounded"
                      alt={i.name}
                    />
                    <span>
                      {i.qty} × {i.name}
                    </span>
                  </div>
                  <span>Tk {(parseFloat(i.price) * i.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between">
                <span>সাব টোটাল</span>
                <span>Tk {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ</span>
                <span>Tk {shippingCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>সর্বমোট</span>
                <span>Tk {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Note */}
            <textarea
              placeholder="Order note"
              className="w-full bg-white border p-2 rounded resize-none"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />

            {/* Pay Online */}
            <button
              onClick={() => handlePayOnline()}
              className="w-full bg-[#2CC4F4] text-white py-2 rounded"
            >
              Pay Online Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnlinePaymentModal;

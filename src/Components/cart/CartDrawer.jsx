import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { CartContext } from "../context/CartContext";

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    cart,
    addToCart,
    isDrawerOpen,
    setIsDrawerOpen,
    increaseQty,
    decreaseQty,
    removeFromCart,
  } = useContext(CartContext);

  // "You May Also Like" products
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const scrollRef = useRef(null);
  const infiniteProducts = [...suggestedProducts, ...suggestedProducts];

  useEffect(() => {
    api
      .get("/all-products")
      .then((res) => setSuggestedProducts(res.data.data || []))
      .catch(() => {});
  }, []);

  const scrollBy = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 240, behavior: "smooth" });
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + (item?.price ?? 0) * (item?.qty ?? 0),
    0,
  );

  useEffect(() => {
    if (!scrollRef.current || !isDrawerOpen || suggestedProducts.length === 0)
      return;

    const container = scrollRef.current;

    const interval = setInterval(() => {
      container.scrollLeft += 1;

      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft = 0;
      }
    }, 20);

    return () => clearInterval(interval);
  }, [isDrawerOpen, suggestedProducts]);

  return (
    <>
      {/* Overlay */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 w-full sm:w-[420px] h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-bold tracking-widest text-gray-900 uppercase">
            Shopping Cart
          </h2>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-[#1FA3DC] transition-colors"
          >
            Close
            <span className="text-base">→</span>
          </button>
        </div>

        {/* ── Cart Items ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {cart.length === 0 ? (
            <p className="text-center text-gray-400 mt-10 text-sm">
              Your cart is empty
            </p>
          ) : (
            cart.map((item) => (
              <div
                key={item?.id}
                className="flex items-center gap-3 border border-gray-100 rounded-lg p-2 bg-white"
              >
                {/* Thumbnail */}
                {item?.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-contain rounded-md border border-gray-100 shrink-0"
                  />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item?.name}
                  </p>

                  {/* qty controls  ×  unit price  =  line total */}
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-600 flex-wrap">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      disabled={item?.qty === 1}
                      className="w-6 h-6 border rounded flex items-center justify-center text-gray-600 disabled:opacity-40 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="px-1">{item?.qty}</span>
                    <button
                      onClick={() => increaseQty(item?.id)}
                      className="w-6 h-6 border rounded flex items-center justify-center text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                    <span className="text-gray-400 mx-1">×</span>
                    <span>৳{(item?.price ?? 0).toLocaleString()}.00</span>
                    <span className="text-gray-400">=</span>
                    <span className="font-medium text-gray-800">
                      ৳
                      {((item?.price ?? 0) * (item?.qty ?? 0)).toLocaleString()}
                      .00
                    </span>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item?.id)}
                  className="text-gray-400 hover:text-red-500 text-lg shrink-0 transition-colors"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {/* ── You May Also Like ── */}
        {cart.length > 0 && suggestedProducts.length > 0 && (
          <div className="px-4 pt-3 pb-2 border-t bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  You May Also Like
                </h3>
                <div className="h-0.5 w-8 bg-[#1FA3DC] mt-0.5 rounded" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollBy(-1)}
                  className="w-7 h-7 rounded-full bg-[#1FA3DC] text-white flex items-center justify-center hover:bg-[#1FA3DC] transition-colors"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                </button>
                <button
                  onClick={() => scrollBy(1)}
                  className="w-7 h-7 rounded-full bg-[#1FA3DC] text-white flex items-center justify-center hover:bg-[#1FA3DC] transition-colors"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                </button>
              </div>
            </div>

            {/* Horizontal scroll */}
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide"
              style={{ scrollbarWidth: "none" }}
            >
              {infiniteProducts.map((p, index) => {
                const price = parseFloat(
                  String(p.main_price ?? 0).replace(/[^0-9.]/g, ""),
                );
                return (
                  <div
                    key={`${p.id}-${index}`}
                    className="min-w-[200px] max-w-[200px] bg-white border border-gray-100 rounded-xl flex items-center gap-2 p-2 shrink-0"
                  >
                    <img
                      src={p.thumbnail_image}
                      alt={p.name}
                      className="w-16 h-16 object-contain rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-400  mt-0.5">
                        ৳{price.toLocaleString()}.00
                      </p>
                      <button
                        onClick={async () => {
                          try {
                            const tempUserId =
                              localStorage.getItem("temp_user_id");

                            const res = await api.post("/carts/add", {
                              id: p.id,
                              quantity: 1,
                              temp_user_id: tempUserId,
                            });
                              const cartItem = res.data.cart?.find((c) => c.product_id === p.id);
                            if (!tempUserId && res.data?.temp_user_id) {
                              localStorage.setItem(
                                "temp_user_id",
                                res.data.temp_user_id,
                              );
                            }

                              addToCart({
                                  id: cartItem?.id ?? p.id,  // ✅ cart row ID
                                  product_id: p.id,
                                  name: p.name,
                                  price: price,
                                  image: p.thumbnail_image,
                                  qty: cartItem?.quantity ?? 1,
                              });

                            setIsDrawerOpen(true);
                          } catch (err) {
                            console.error("Add to cart error:", err);
                          }
                        }}
                        className="mt-1 px-3 py-1 bg-[#1FA3DC] hover:bg-[#1FA3DC] text-white text-xs rounded-full font-medium transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Footer: Total + Checkout ── */}
        <div className="px-5 py-4 border-t bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total:</span>
            <span className="text-base font-bold text-gray-900">
              ৳{total.toLocaleString()}.00
            </span>
          </div>

          <Link to="/checkout" onClick={() => setIsDrawerOpen(false)}>
            <button className="w-full py-3 bg-[#1FA3DC] hover:bg-[#1FA3DC] text-white font-bold text-sm tracking-widest rounded-lg transition-colors uppercase">
              Checkout
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;

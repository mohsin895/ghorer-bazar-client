import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Loader from "../Components/Common/Loader";
import { CartContext } from "../Components/context/CartContext";

const AllProducts = () => {
  const { addToCart, setIsDrawerOpen } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/all-products")
      .then((res) => {
        const normalProducts = (res.data.data || []).filter(
          (product) => product.has_combo !== 1,
        );

        setProducts(normalProducts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

    const handleAddToCart = async (product) => {
        if (product.current_stock === 0) return;

        try {
            const temp_user_id = localStorage.getItem("temp_user_id");

            const payload = {
                id: product.id,
                quantity: 1,
                ...(temp_user_id ? { temp_user_id } : {}),
            };

            const res = await api.post("/carts/add", payload);

            if (res.data?.result) {
                if (res.data.temp_user_id) {
                    localStorage.setItem("temp_user_id", res.data.temp_user_id);
                }

                const price = parseFloat(
                    String(product.main_price ?? 0).replace(/[^0-9.]/g, ""),
                );

                // ✅ Find the matching cart row by product_id from the response
                const cartItem = res.data.cart?.find(
                    (c) => c.product_id === product.id,
                );

                addToCart({
                    id: cartItem?.id ?? product.id, // ✅ use cart row ID for remove/qty ops
                    product_id: product.id,          // ✅ keep product ID for reference
                    name: product.name,
                    price: price,
                    image: product.thumbnail_image,
                    qty: cartItem?.quantity ?? 1,    // ✅ use actual qty from DB
                });

                setIsDrawerOpen(true);
            }
        } catch (err) {
            console.error("Cart API error:", err);
        }
    };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-3 sm:px-4 bg-white mb-6 md:mb-10">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 py-6 lg:py-10 text-center">
        ALL PRODUCTS
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => {
          const isOutOfStock = product.current_stock === 0;

          return (
            <div
              key={product.id}
              className="border rounded-lg p-3 sm:p-4 hover:shadow-lg transition-transform transform hover:-translate-y-1 relative"
            >
              {/* Discount Badge */}
              {product.has_discount && product.discount > 0 ? (
                <span className="absolute top-2 left-2 bg-red-400 text-white text-sm font-semibold p-2 rounded-3xl z-10 shadow">
                  {product.discount_type === "percent"
                    ? `${product.discount} % OFF`
                    : `Save ৳ ${product.discount}`}
                </span>
              ) : null}

              <Link to={`/products/details/${product.slug}`}>
                <div className="relative">
                  <img
                    src={product.thumbnail_image}
                    alt={product.name}
                    className={`w-full h-26 sm:h-28 md:h-56 object-cover mb-3 rounded ${
                      isOutOfStock ? "opacity-60 grayscale" : ""
                    }`}
                  />

                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-base py-2 text-center">
                  {product.name}
                </h3>

                <div className="text-center flex justify-center items-center gap-2">
                  <p className="text-lg text-gray-600">
                    ৳{" "}
                    {parseFloat(
                      String(product.main_price).replace(/[^0-9.]/g, ""),
                    ).toFixed(2)}
                  </p>

                  {product.has_discount && product.stroked_price && (
                    <p className="text-sm line-through text-gray-400">
                      ৳{" "}
                      {parseFloat(
                        String(product.stroked_price).replace(/[^0-9.]/g, ""),
                      ).toFixed(2)}
                    </p>
                  )}
                </div>
              </Link>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                className={`rounded-lg p-2 w-full mt-3 transition-colors duration-300 text-white ${
                  isOutOfStock
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#2CC4F4] hover:bg-[#1fa3dc]"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : "Quick Add"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllProducts;

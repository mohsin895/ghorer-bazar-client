import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import {
  faCartShopping,
  faChevronLeft,
  faChevronRight,
  faMinus,
  faPhone,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CashOnDeliveryModal from "../Components/Modal/CashOnDeliveryModal.jsx";
import OnlinePaymentModal from "../Components/Modal/OnlinePaymentModal.jsx";

import { Helmet } from "react-helmet";
import api from "../api/axios";
import Loader from "../Components/Common/Loader.jsx";

import { CartContext } from "../Components/context/CartContext";

function ProductDetails() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart, setIsDrawerOpen } = useContext(CartContext);

  const [openCOD, setOpenCOD] = useState(false);
  const [openOnline, setOpenOnline] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageList, setImageList] = useState([]);

  useEffect(() => {
    api
      .get(`/products/details/${slug}`)
      .then((res) => {
        const productData = res.data.product;

        setProduct({
          ...productData,
          related_products: res.data.related_products || [],
        });

        const thumbnailFile = productData.thumbnail?.file_name;
        const photoFiles =
          productData.photo_list?.map((p) => p.file_name) || [];

        const allPhotos = [];

        if (thumbnailFile) {
          allPhotos.push(thumbnailFile);
        }

        photoFiles.forEach((f) => {
          if (f !== thumbnailFile) {
            allPhotos.push(f);
          }
        });

        setImageList(allPhotos);

        if (allPhotos.length > 0) {
          setSelectedImage(allPhotos[0]);
          setSelectedIndex(0);
        }
      })
      .catch(console.error);
  }, [slug]);

  if (!product) return <Loader />;

  const now = Math.floor(Date.now() / 1000);

  const isDiscountActive =
    product.discount &&
    product.discount > 0 &&
    product.discount_start_date &&
    product.discount_end_date &&
    now >= product.discount_start_date &&
    now <= product.discount_end_date;

  const isOutOfStock = product.current_stock === 0;

  const mainPrice = parseFloat(product.unit_price);
  const hasDiscount = isDiscountActive;

  const finalPrice = hasDiscount
    ? product.discount_type === "percent"
      ? mainPrice * (1 - product.discount / 100)
      : mainPrice - product.discount
    : mainPrice;

  const saveAmount = hasDiscount
    ? product.discount_type === "percent"
      ? (mainPrice * product.discount) / 100
      : product.discount
    : 0;

  const savePercent = hasDiscount
    ? product.discount_type === "percent"
      ? product.discount
      : Math.round((saveAmount / mainPrice) * 100)
    : 0;

  const handleSelectImage = (fileName, index) => {
    setSelectedImage(fileName);
    setSelectedIndex(index);
  };

  const handlePrev = () => {
    if (imageList.length === 0) return;
    const newIndex = (selectedIndex - 1 + imageList.length) % imageList.length;
    setSelectedImage(imageList[newIndex]);
    setSelectedIndex(newIndex);
  };

  const handleNext = () => {
    if (imageList.length === 0) return;
    const newIndex = (selectedIndex + 1) % imageList.length;
    setSelectedImage(imageList[newIndex]);
    setSelectedIndex(newIndex);
  };

  const handleAddToCart = async (openDrawer = true) => {
    if (isOutOfStock) return false;

    try {
      const res = await api.post("/carts/add", {
        id: product.id,
        quantity,
      });

      if (res.data?.temp_user_id) {
        localStorage.setItem("temp_user_id", res.data.temp_user_id);
      }

      addToCart({
        id: product.id,
        name: product.name,
        price: finalPrice,
        image: `https://backend.zhenaura.net/public/${selectedImage}`,
        qty: quantity,
      });

      if (openDrawer) setIsDrawerOpen(true);

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleQuantityChange = (type) => {
    if (isOutOfStock) return;

    let newQty = quantity;
    if (type === "plus") newQty = Math.min(quantity + 1, product.current_stock);
    if (type === "minus") newQty = Math.max(quantity - 1, 1);

    setQuantity(newQty);
  };

  const handleCOD = async () => {
    if (isOutOfStock) return;
    await handleAddToCart(false);
    setOpenCOD(true);
  };

  const handleOP = async () => {
    if (isOutOfStock) return;

    try {
      await handleAddToCart(false);

      // checkout page e niye jabe
      navigate("/checkout");
    } catch (err) {
      console.error(err);
    }
  };

  const handleWhatsApp = () => {
    const imageUrl = `https://backend.zhenaura.net/public/${selectedImage}`;
    const message = `${imageUrl}\nProduct Name: ${
      product.name
    }\nPrice: ৳ ${finalPrice.toFixed(2)}\nLink: ${window.location.href}`;
    window.open(
      `https://wa.me/8801844545500?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const handleCallForOrder = () => {
    window.location.href = "tel:+8801844545500";
  };

  return (
    <>
      <Helmet>
        <title>{product.name} | ZHEN AURA</title>
      </Helmet>

      <div className="container mx-auto px-3 sm:px-4 mt-6 bg-white mb-10">
        <div className="flex flex-col mt-8 md:flex-row gap-6">
          {/* ── Image Gallery ── */}
          <div className="w-full md:w-2/5 flex gap-3">
            {/* Thumbnails — always show */}
            {imageList.length > 0 && (
              <div className="flex flex-col gap-2 w-20  shrink-0">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectImage(img, idx)}
                    className={`border-2 rounded overflow-hidden ${
                      selectedIndex === idx
                        ? "border-[#1FA3DC]"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={`https://backend.zhenaura.net/public/${img}`}
                      alt={`thumb-${idx}`}
                      className="w-full h-20 object-contain"
                    />
                    {selectedIndex === idx && (
                      <div className="flex justify-center -mt-1 pb-1">
                        <span className="w-4 h-4 rounded-full bg-[#1FA3DC] flex items-center justify-center">
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative flex-1 border border-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={`https://backend.zhenaura.net/public/${selectedImage}`}
                alt={product.name}
                className={`w-full object-contain max-h-96 ${
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

              {/* Prev / Next arrows */}
              {imageList.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-gray-50"
                  >
                    <FontAwesomeIcon
                      icon={faChevronLeft}
                      className="text-xs text-gray-600"
                    />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-gray-50"
                  >
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="text-xs text-gray-600"
                    />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="w-full md:flex-1 space-y-5 mt-5">
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
  
            <div className="flex items-center gap-3">
              <p className="text-2xl font-semibold text-[#000]">
                ৳ {finalPrice.toFixed(2)}
              </p>
              {hasDiscount ? (
                <>
                  <p className="text-sm line-through text-gray-400">
                    ৳ {mainPrice.toFixed(2)}
                  </p>
                  <span className="text-xs font-semibold py-1 px-2 text-white rounded bg-green-500">
                    Save {savePercent}%
                  </span>
                </>
              ) : null}
            </div>

            {isOutOfStock && (
              <p className="text-red-500 font-semibold">Out of Stock</p>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                <button
                  disabled={isOutOfStock}
                  onClick={() => handleQuantityChange("minus")}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  <FontAwesomeIcon icon={faMinus} className="text-xs" />
                </button>
                <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  disabled={isOutOfStock}
                  onClick={() => handleQuantityChange("plus")}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                </button>
              </div>
            </div>

            {/* ── Buttons (2×2 grid matching screenshot) ── */}
            <div className="grid grid-cols-2 gap-3">
              {/* ADD TO CART — orange */}
              <button
                disabled={isOutOfStock}
                onClick={() => handleAddToCart()}
                className="flex items-center justify-center gap-2 py-3 rounded-md text-white font-semibold text-sm
                  bg-[#1FA3DC] hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FontAwesomeIcon icon={faCartShopping} />
                ADD TO CART
              </button>

              {/* BUY NOW — dark */}
              <button
                disabled={isOutOfStock}
                onClick={handleOP}
                className="flex items-center justify-center gap-2 py-3 rounded-md text-white font-semibold text-sm
                  bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                BUY NOW
              </button>

              {/* Order On WhatsApp — green */}
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 py-3 rounded-md text-white font-semibold text-sm
                  bg-green-500 hover:bg-green-600 transition-colors"
              >
                <FontAwesomeIcon icon={faWhatsapp} />
                Order On WhatsApp
              </button>

              {/* Call For Order — blue */}
              <button
                onClick={handleCallForOrder}
                className="flex items-center justify-center gap-2 py-3 rounded-md text-white font-semibold text-sm
                  bg-blue-700 hover:bg-blue-800 transition-colors"
              >
                <FontAwesomeIcon icon={faPhone} />
                Call For Order
              </button>
            </div>

            <OnlinePaymentModal
              open={openOnline}
              onClose={() => setOpenOnline(false)}
            />
            <CashOnDeliveryModal
              open={openCOD}
              onClose={() => setOpenCOD(false)}
            />

            <h2 className="text-xs md:text-[16px] leading-[1.6rem]">
              {product.short_description}
            </h2>
            <button
              onClick={handleWhatsApp}
              className="w-full bg-[#2CC4F4] text-white py-2 rounded"
            >
              <FontAwesomeIcon icon={faWhatsapp} /> WhatsApp Us
            </button>
              <div
                  className="prose max-w-none mt-4"
                  dangerouslySetInnerHTML={{ __html: product.description }}
              />
          </div>
        </div>

        {/* ── Related Products ── */}
        {product.related_products?.length > 0 && (
          <div className="mt-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Related Products
              </h2>
              <a
                href="/products"
                className="text-[#1FA3DC] hover:text-orange-600 font-medium text-sm flex items-center gap-1"
              >
                More Products →
              </a>
            </div>

            {/* Horizontal scroll row */}
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
              {product.related_products.map((rp) => {
                const rpPrice = parseFloat(rp.unit_price);
                const rpOutOfStock = rp.current_stock <= 0;

                // discount check
                const rpNow = Math.floor(Date.now() / 1000);
                const rpHasDiscount =
                  rp.discount > 0 &&
                  rp.discount_start_date &&
                  rp.discount_end_date &&
                  rpNow >= rp.discount_start_date &&
                  rpNow <= rp.discount_end_date;

                const rpFinalPrice = rpHasDiscount
                  ? rp.discount_type === "percent"
                    ? rpPrice * (1 - rp.discount / 100)
                    : rpPrice - rp.discount
                  : rpPrice;

                const rpThumb = rp.thumbnail?.file_name
                  ? `https://backend.zhenaura.net/public/${rp.thumbnail.file_name}`
                  : rp.thumbnail_img
                    ? `https://backend.zhenaura.net/public/uploads/all/${rp.thumbnail_img}`
                    : null;

                const handleRpAddToCart = async () => {
                  if (rpOutOfStock) return;
                  try {
                    const res = await api.post("/carts/add", {
                      id: rp.id,
                      quantity: 1,
                    });
                    if (res.data?.temp_user_id) {
                      localStorage.setItem(
                        "temp_user_id",
                        res.data.temp_user_id,
                      );
                    }
                    addToCart({
                      id: rp.id,
                      name: rp.name,
                      price: rpFinalPrice,
                      image: rpThumb,
                      qty: 1,
                    });
                    setIsDrawerOpen(true);
                  } catch (err) {
                    console.error("Related add to cart error:", err);
                  }
                };

                return (
                  <div
                    key={rp.id}
                    className="min-w-[160px] max-w-[160px] sm:min-w-[200px] sm:max-w-[200px] bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden shrink-0"
                  >
                    {/* Image */}
                    <a
                      href={`/products/details/${rp.slug}`}
                      className="block bg-gray-50"
                    >
                      {rpThumb ? (
                        <img
                          src={rpThumb}
                          alt={rp.name}
                          className={`w-full h-40 object-contain p-2 ${
                            rpOutOfStock ? "opacity-60 grayscale" : ""
                          }`}
                        />
                      ) : (
                        <div className="w-full h-40 flex items-center justify-center text-gray-300 text-xs">
                          No Image
                        </div>
                      )}
                    </a>

                    {/* Info */}
                    <div className="p-3 flex flex-col gap-2 flex-1">
                      <a
                        href={`/products/details/${rp.slug}`}
                        className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 hover:text-[#1FA3DC]"
                      >
                        {rp.name}
                      </a>

                      <p className="text-[#000] font-semibold text-sm">
                        ৳
                        {rpFinalPrice.toLocaleString("en-BD", {
                          minimumFractionDigits: 0,
                        })}
                      </p>

                      {/* Add to Cart / Stock Out */}
                      <button
                        onClick={handleRpAddToCart}
                        disabled={rpOutOfStock}
                        className={`mt-auto w-full py-2 rounded border text-sm font-medium flex items-center justify-center gap-1 transition-colors
                          ${
                            rpOutOfStock
                              ? "border-red-400 text-red-500 cursor-default"
                              : "border-[#1FA3DC] text-[#1FA3DC] hover:bg-[#1FA3DC] hover:text-white"
                          }`}
                      >
                        {rpOutOfStock ? (
                          "Stock Out"
                        ) : (
                          <>
                            <FontAwesomeIcon
                              icon={faCartShopping}
                              className="text-xs"
                            />
                            Add To Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ProductDetails;

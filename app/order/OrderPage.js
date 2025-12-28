"use client";

import ShoppingCart from "@/components/design/ShoppingCart";
import { useContext, useEffect, useState } from "react";
import { FiSearch, FiShoppingCart } from "react-icons/fi";
import { Skeleton } from "@/components/ui/skeleton";
import { CartContext } from "../context/CartContext";
import Image from "next/image";
import MaintenanceWrapper from "@/components/MaintainenceWrapper";

const OrderPage = () => {
  const { dispatch } = useContext(CartContext);
  const [menuData, setMenuData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const res = await fetch("/api/menu");
        if (!res.ok) {
          throw new Error("Failed to fetch menu data");
        }
        const { data } = await res.json();
        setMenuData(data);
        const categoryNames = data.map((cat) => cat.name);
        setCategories(["Most Popular", ...categoryNames]);
        setActiveCategory("Most Popular");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  const filteredMenuItems =
    activeCategory === "Most Popular"
      ? menuData.flatMap((category) => category.menuItems)
      : menuData.find((category) => category.name === activeCategory)
          ?.menuItems || [];

  const searchedMenuItems = filteredMenuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <MaintenanceWrapper>
        <section
          className="relative h-[60vh] md:h-[400px] bg-cover bg-center"
          style={{ backgroundImage: "url('/images/aboutbg.webp')" }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h1 className="text-5xl md:text-6xl header-font">Order Now</h1>
            <Image
              src="/images/underline.png"
              alt="decorative underline"
              width={150}
              height={50}
              className="mt-2"
            />
          </div>
        </section>
        <div
          className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 sansita-regular"
          style={{ backgroundImage: "url(/images/background.webp)" }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Category Navigation */}
            <nav className="mb-12">
              <ul className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-2">
                {categories.map((category) => (
                  <li key={category} className="relative">
                    <button
                      onClick={() => setActiveCategory(category)}
                      className={` text-sm sm:text-base pb-2 transition-colors duration-300 ${
                        activeCategory === category
                          ? "text-black"
                          : "text-gray-500 hover:text-black"
                      }`}
                    >
                      {category}
                    </button>
                    {activeCategory === category && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-black"></div>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Search Bar */}
            <div className="mb-8 flex justify-center sticky top-4">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search here"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-white"
                />
                <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Menu Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between"
                  >
                    <div>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                    <div className="flex justify-end mt-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {searchedMenuItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold">{item.name}</h3>
                        <p className="text-xl font-bold text-gray-800">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 poppins-regular">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() =>
                          dispatch({ type: "ADD_ITEM", payload: item })
                        }
                        className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                      >
                        <FiShoppingCart />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <ShoppingCart />
      </MaintenanceWrapper>
    </>
  );
};

export default OrderPage;

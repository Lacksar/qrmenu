"use client"; // needed for client components
import Image from "next/image";
import Link from "next/link";
import CategoryImage from "@/components/ui/CategoryImage";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Head from "next/head";

// A single menu item component
const MenuItem = ({ name, description, price }) => (
  <div className="mb-4">
    <div className="flex items-end">
      <span className="text-lg font-semibold text-gray-900 poppins-regular">
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </span>
      <span className="flex-grow border-b-2 border-dotted border-gray-300 mx-2"></span>
      <span className="font-semibold text-gray-800">${price}</span>
    </div>
    <p className="text-xs text-gray-600 sansita-small tracking-wider spac mt-1">
      {description.toUpperCase()}
    </p>
  </div>
);

export default function MenuDisplayPage() {
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch("/api/menu"); // client-side fetch
        if (!res.ok) throw new Error("Failed to fetch menu");
        const data = await res.json();
        setMenuData(data.data || []);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error loading menu data.</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="min-h-screen"
        style={{
          backgroundImage: "url(/images/background.webp)",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Hero Section */}
        <section
          className="relative h-[60vh] md:h-[400px] bg-cover bg-center"
          style={{ backgroundImage: "url('/images/aboutbg.webp')" }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h1 className="text-5xl md:text-6xl font-serif header-font">
              Our Menu
            </h1>
            <Image
              src="/images/underline.png"
              alt="decorative underline"
              width={150}
              height={50}
              className="mt-2"
            />
          </div>
        </section>

        {loading && (
          <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-8 space-y-16">
            {[1, 2, 3].map((_, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center"
              >
                {/* Text skeleton */}
                <div className="flex flex-col space-y-4">
                  <Skeleton className="h-8 w-3/4 md:w-1/2" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6" />
                </div>

                {/* Image skeleton */}
                <div className="flex justify-center">
                  <Skeleton className="w-full max-w-sm h-48" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main content area */}
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-8">
          {menuData
            .filter(
              (section) => section.menuItems && section.menuItems.length > 0
            )
            .map((section, index) => {
              const isImageLeft = index % 2 === 0;
              return (
                <div
                  id={section.name.toLowerCase()}
                  key={section._id}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16 items-center"
                >
                  {/* Text/Menu column */}
                  <div
                    className={`flex flex-col ${
                      isImageLeft ? "md:order-2" : "md:order-1"
                    }`}
                  >
                    <div className="flex flex-col mb-6 items-center md:items-start">
                      <h2 className="text-5xl md:text-5xl text-gray-800 mb-2 text-center md:text-left sansita-regular">
                        {section.name.charAt(0).toUpperCase() +
                          section.name.slice(1)}
                      </h2>
                      <Image
                        src="/images/underline.png"
                        alt="decorative underline"
                        width={150}
                        height={50}
                        className="invert"
                      />
                    </div>

                    <div>
                      {section.menuItems.map((item) => (
                        <MenuItem key={item._id} {...item} />
                      ))}
                    </div>
                  </div>

                  {/* Image column */}
                  <div
                    className={`flex justify-center ${
                      isImageLeft ? "md:order-1" : "md:order-2"
                    }`}
                  >
                    <div className="w-full max-w-sm">
                      <CategoryImage section={section} />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Order online section */}
        <div className="flex my-8 flex-col items-center justify-center">
          <p className="pb-2">Want to Order Online?</p>
          <Link
            href="/order"
            className="bg-[#e59b2f] text-white px-5 py-2 rounded-full hover:bg-[#c98522] transition-colors text-xl"
          >
            Order Online
          </Link>
        </div>
      </div>
    </>
  );
}

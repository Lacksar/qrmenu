import Image from "next/image";
import { FiWifi, FiShoppingCart, FiUsers } from "react-icons/fi";
import {
  FaFire,
  FaCarSide,
  FaWheelchair,
  FaWineGlassAlt,
  FaChair,
  FaSmoking,
} from "react-icons/fa";
import Link from "next/link";

// A reusable component for the decorative flourish

// app/about/page.js
export const metadata = {
  title: "About Us",
  description:
    "Learn more about Pancetta – our story, mission, and passion for food.",
  openGraph: {
    title: "About Us | Pancetta",
    description:
      "Learn more about Pancetta – our story, mission, and passion for food.",
    type: "website",
    images: ["/logo.png"], // optional
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Pancetta",
    description:
      "Learn more about Pancetta – our story, mission, and passion for food.",
    images: ["/logo.png"],
    creator: "@pancetta",
  },
};

const Flourish = ({ color = "white" }) => (
  <div className="flex justify-center items-center my-4">
    <svg
      width="200"
      height="20"
      viewBox="0 0 300 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 15H110" stroke={color} strokeWidth="1.5" />
      <path d="M190 15H300" stroke={color} strokeWidth="1.5" />
      <path
        d="M150 15C150 15 140 23.6603 120 25C110 25.6603 110 15 110 15"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M150 15C150 15 160 23.6603 180 25C190 25.6603 190 15 190 15"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M150 15C150 15 140 6.33975 120 5C110 4.33975 110 15 110 15"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M150 15C150 15 160 6.33975 180 5C190 4.33975 190 15 190 15"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  </div>
);

const page = () => {
  return (
    <main
      className="bg-[#FBF9F2]"
      style={{
        backgroundImage: "url(/images/background.webp)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <section
        className="relative h-[100vh] md:h-[400px] bg-cover bg-center"
        style={{ backgroundImage: "url('/images/aboutbg.webp')" }}
      >
        <div className="absolute inset-0 bg-black/30 bg-opacity-60"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
          {/* Note: The "About Us" font is a specific decorative serif. Using a generic one here. */}
          <h1 className="text-6xl font-serif header-font">About Us</h1>
          <p className="mt-2 text-sm tracking-[0.2em]"></p>
          <Flourish color="white" />
        </div>
      </section>

      {/* --- Caffé Pancetta Section --- */}
      <section className="py-20">
        <div className="container  mx-auto px-4 md:px-20 grid md:grid-cols-2 gap-12 items-center sansita-regular">
          <div className="text-gray-800">
            {/* Note: "Caffé Pancetta" has a distinct script-like serif font in the image. */}
            <h2 className="text-5xl header-font mb-4 text-black">
              Caffé Pancetta
            </h2>
            <h3 className="text-xl font-bold mb-4">
              We Strive To Bring Best Quality Food On Your Table
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Order authentic Italian food online from Caffé Pancetta. Enjoy
              fresh pasta and Italian dishes delivered straight to your door.
              Easy online ordering for your convenience!
            </p>
            <button className="bg-[#E89E3A] text-white px-8 py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors">
              Contact Us
            </button>
          </div>
          <div className="grid grid-cols-5 gap-4 items-center">
            <div className="col-span-3">
              <Image
                src="/images/spoon.webp"
                alt="Chef preparing food"
                width={300}
                height={350} // reduced height
                className="rounded-lg object-cover w-full h-auto shadow-lg  filter brightness-70 contrast-110 saturate-125"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-4">
              <Image
                src="/images/chowmean2.webp"
                alt="Spaghetti bolognese"
                width={200}
                height={150} // smaller height
                className="rounded-lg object-cover w-full h-auto shadow-lg"
              />
              <Image
                src="/images/glass.webp"
                alt="Wine glasses by a fireplace"
                width={200}
                height={150} // smaller height
                className="rounded-lg object-cover w-full h-auto shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- Our Locations Section --- */}
      <section className="py-20 sansita-regular">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl  text-gray-800 mb-12">Our Locations</h2>
          <div className="flex flex-wrap justify-center  gap-8">
            <div className="bg-white p-8 rounded-2xl border border-orange-300 text-center w-full max-w-md shadow-md ">
              <h3 className="text-xl font-bold mb-2 tracking-wider">
                ENGADINE
              </h3>
              <p className="text-gray-500 mb-6">
                13-15 Station St, Engadine NSW 2233
              </p>

              <div className="mb-6">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.1091562125903!2d151.01202837652946!3d-34.06671597315145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12c18fa952e7d5%3A0x5bd489a25006a991!2sCaffe%20Pancetta!5e0!3m2!1sen!2snp!4v1760722004828!5m2!1sen!2snp"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <Link
                href="tel:02 7251 1826"
                className="bg-[#E89E3A] cursor-pointer hover:bg-amber-700 text-white px-8 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors text-sm inline-block"
              >
                Contact Us
              </Link>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-orange-300 text-center w-full max-w-md shadow-md">
              <h3 className="text-xl font-bold mb-2 tracking-wider">
                HURSTVILLE
              </h3>
              <p className="text-gray-500 mb-6">
                352 Forest Rd, Hurstville NSW 2220
              </p>

              <div className="mb-6">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3309.0525066716914!2d151.1009946!3d-33.96548990000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12b976067436bf%3A0x515e21accabcf4b2!2sPancetta%20Napoli%20Pizzeria!5e0!3m2!1sen!2snp!4v1760721912214!5m2!1sen!2snp"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <Link
                href="tel:02 9570 4443"
                className="bg-[#E89E3A] cursor-pointer hover:bg-amber-700 text-white px-8 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors text-sm inline-block"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- What We Offer Section --- */}
      <section
        className="relative py-20 bg-cover bg-center sansita-regular"
        style={{
          backgroundImage: "url('/images/pizzabg2.webp')",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/30 bg-opacity-75"></div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h2 className="text-5xl ">What We Offer</h2>
          <Flourish color="white" />
          <div className="max-w-4xl mx-auto mt-12 grid grid-cols-2 border border-[#E89E3A]">
            {[
              { title: "DINE IN", image: "/images/dinein.webp" },
              { title: "TAKEAWAY", image: "/images/takeaway.webp" },
              { title: "ONLINE ORDER", image: "/images/orderonline.webp" },
              { title: "CATERING", image: "/images/catering.webp" },
            ].map((item, index) => (
              <div
                key={item.title}
                className={`relative h-64 flex items-center justify-center group 
                ${index % 2 === 0 ? "border-r border-[#E89E3A]" : ""}
                ${index < 2 ? "border-b border-[#E89E3A]" : ""}`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 "
                  style={{ backgroundImage: `url(${item.image})` }}
                ></div>
                <div className="absolute inset-0 bg-black/30 bg-opacity-50"></div>
                <h3 className="relative z-10 text-2xl font-semibold tracking-wider w-full bg-black/60 py-4">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Restaurant Amenities Section --- */}
      <section className="py-24 bg-white sansita-regular">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl  text-gray-800 mb-10">
            Restaurant Amenities
          </h2>

          <div className="max-w-5xl ml-auto mr-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8 justify-items-center poppins-regular">
            {/* Free Wi-Fi */}
            <div className="flex flex-col items-center ">
              <div className="w-16 h-16 bg-[#F0AD4E] rounded-full flex items-center justify-center">
                <FiWifi className="text-white text-3xl" />
              </div>
              <p className="mt-3 text-base font-medium text-gray-700">
                Free Wi-Fi
              </p>
            </div>

            {/* Takeaway */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#F0AD4E] rounded-full flex items-center justify-center">
                <FiShoppingCart className="text-white text-3xl" />
              </div>
              <p className="mt-3 text-base font-medium text-gray-700">
                Takeaway
              </p>
            </div>

            {/* Street Parking */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#F0AD4E] rounded-full flex items-center justify-center">
                <FaCarSide className="text-white text-3xl" />
              </div>
              <p className="mt-3 text-base font-medium text-gray-700">
                Street Parking
              </p>
            </div>

            {/* Outdoor Seating */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#F0AD4E] rounded-full flex items-center justify-center">
                <FaChair className="text-white text-3xl" />
              </div>
              <p className="mt-3 text-base font-medium text-gray-700">
                Outdoor Seating
              </p>
            </div>

            {/* Wheelchair Access */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#F0AD4E] rounded-full flex items-center justify-center">
                <FaWheelchair className="text-white text-3xl" />
              </div>
              <p className="mt-3 text-base font-medium text-gray-700">
                Wheelchair Access
              </p>
            </div>

            {/* Fully Licensed */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#F0AD4E] rounded-full flex items-center justify-center">
                <FaWineGlassAlt className="text-white text-3xl" />
              </div>
              <p className="mt-3 text-base font-medium text-gray-700">
                Fully Licensed
              </p>
            </div>

            {/* Smoking Area */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#F0AD4E] rounded-full flex items-center justify-center">
                <FaCarSide className="text-white text-3xl" />
              </div>
              <p className="mt-3 text-base font-medium text-gray-700">
                Home Delivery
              </p>
            </div>

            {/* Event Hosting */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#F0AD4E] rounded-full flex items-center justify-center">
                <FiUsers className="text-white text-3xl" />
              </div>
              <p className="mt-3 text-base font-medium text-gray-700">
                Event Hosting
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;

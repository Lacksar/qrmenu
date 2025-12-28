import Image from "next/image";
import { FiWifi, FiShoppingCart } from "react-icons/fi";
import { FaFire, FaCarSide } from "react-icons/fa";

// A reusable component for the decorative flourish
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

const AboutPage = () => {
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
          <h1 className="text-6xl font-serif">About Us</h1>
          <p className="mt-2 text-sm tracking-[0.2em]"></p>
          <Flourish color="white" />
        </div>
      </section>

      {/* --- Caffé Pancetta Section --- */}
      <section className="py-20">
        <div className="container  mx-auto px-4 md:px-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-gray-800">
            {/* Note: "Caffé Pancetta" has a distinct script-like serif font in the image. */}
            <h2 className="text-5xl font-serif mb-4 text-black">
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
                className="rounded-lg object-cover w-full h-auto shadow-lg"
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
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif text-gray-800 mb-12">
            Our Locations
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="bg-white/50 p-8 rounded-2xl border border-gray-200 text-center w-full max-w-sm shadow-md">
              <h3 className="text-xl font-bold mb-2 tracking-wider">
                ENGADINE
              </h3>
              <p className="text-gray-500 mb-6">
                13-15 Station St, Engadine NSW 2233
              </p>
              <button className="bg-[#E89E3A] text-white px-8 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors text-sm">
                Contact Us
              </button>
            </div>
            <div className="bg-white/50 p-8 rounded-2xl border border-gray-200 text-center w-full max-w-sm shadow-md">
              <h3 className="text-xl font-bold mb-2 tracking-wider">
                HURSTVILLE
              </h3>
              <p className="text-gray-500 mb-6">
                352 Forest Rd, Hurstville NSW 2220
              </p>
              <button className="bg-[#E89E3A] text-white px-8 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors text-sm">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- What We Offer Section --- */}
      <section
        className="relative py-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/pizzabg2.webp')",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/30 bg-opacity-75"></div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h2 className="text-5xl font-serif">What We Offer</h2>
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
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif text-gray-800 mb-12">
            Restaurant Amenities
          </h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-[#F0AD4E] rounded-full flex items-center justify-center">
                <FiWifi className="text-white text-4xl" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-[#F0AD4E] rounded-full flex items-center justify-center">
                <FaFire className="text-white text-4xl" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-[#F0AD4E] rounded-full flex items-center justify-center">
                <FiShoppingCart className="text-white text-4xl" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-[#F0AD4E] rounded-full flex items-center justify-center">
                <FaCarSide className="text-white text-4xl" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;

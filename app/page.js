import HeroSection from "@/components/design/HeroSection";
import Image from "next/image";
import Link from "next/link";
import SocialLinks from "@/components/design/SocialLinks";
import Testimonials from "@/components/design/Testimonials";
import PizzaPastaSection from "@/components/design/PizzaPastaSection";
import GallerySection from "@/components/design/GallerySection";
import AuthRedirect from "@/components/AuthRedirect";

export default function Home() {
  return (
    <>
      <AuthRedirect />
      <div
        className="bg-white text-black"
        style={{
          backgroundImage: "url(/images/background.webp)",
          backgroundAttachment: "fixed",
        }}
      >
        <HeroSection />
        {/* About Section */}
        <section
          className="py-40 "
          // style={{
          //   backgroundImage: "url(/images/pizzabg.webp)",
          //   backgroundSize: "cover",
          //   backgroundRepeat: "no-repeat",
          //   backgroundAttachment: "fixed",
          // }}
        >
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              <Image
                src="/images/pizza.webp"
                alt="Pizza"
                width={300}
                height={400}
                className="rounded-lg mx-auto"
              />
              <Image
                src="/images/home/spagetti.webp"
                alt="Pasta"
                width={300}
                height={400}
                className="rounded-lg"
              />
            </div>
            <div className="font-serif">
              <h2 className="text-lg font-semibold sansita-regular">
                Know More About
              </h2>
              <h3 className="text-5xl mt-2 sansita-regular">Caffé Pancetta</h3>
              <p className="text-lg mt-4 poppins-regular">
                We Are A Local Restaurant In Engadine & Hurstville
              </p>
              <p className="mt-4 poppins-light">
                At Caffé Pancetta, we combine our passion, love, and experiences
                to serve you the best Italian cuisine on your table. We use
                fresh and finest ingredients to give you the best experience.
              </p>
              <Link
                href={"/about"}
                className="bg-orange-500 px-6 py-3 rounded-md mt-6 inline-block sansita-regular text-white"
              >
                More About Us →
              </Link>
            </div>
          </div>
        </section>

        <PizzaPastaSection />
        <GallerySection />
        <Testimonials />
        <SocialLinks />
      </div>
    </>
  );
}

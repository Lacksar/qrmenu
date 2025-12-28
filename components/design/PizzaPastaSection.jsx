import Image from "next/image";
import Link from "next/link";

const PizzaPastaSection = () => {
  return (
    <section
      className="bg-cover bg-center py-20 flex justify-center items-center min-h-[70vh]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.75)), url('/images/pizzabg.webp')",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="   mx-auto px-4 flex justify-center items-center md:flex-row flex-col gap-12 ">
        <div>
          <h2 className="text-lg font-semibold text-white sansita-regular">
            Enjoy Our Pizza and Pasta
          </h2>
          <h3 className="text-5xl text-white font-bold mt-2 poppins-regular">
            Available Every Night At Engadine
          </h3>
          <p className="mt-4 text-white poppins-light">
            Come grab our fresh and delicious Italian dishes made with love and
            passion.
          </p>
          <Link
            href={"/contact"}
            className="bg-orange-500 text-white px-6 py-3 rounded-md mt-6 inline-flex items-center sansita-regular"
          >
            Contact Us→
          </Link>
        </div>
        <div>
          <Image
            src="/images/pizza.webp"
            alt="Pizza"
            width={500}
            height={400}
            className="rounded-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default PizzaPastaSection;

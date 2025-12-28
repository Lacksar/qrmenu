import Image from "next/image";
import { FiLock } from "react-icons/fi";

const UnderConstructionPage = ({ handleChange }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F5F2] text-center">
      <div className="mb-6">
        <div className=" rounded-full p-4 inline-block">
          <Image
            onClick={handleChange}
            src={"/logo.png"}
            height={200}
            width={200}
            alt="imga"
            className="text-white text-3xl"
          />
        </div>
      </div>
      <p className="text-[#C98B61] tracking-widest text-2xl font-semibold mb-4">
        Caffé PANCETTA
      </p>
      <h1 className="text-4xl md:text-6xl font-serif text-[#333333] mb-4">
        Under Construction
      </h1>
      <p className="text-lg text-gray-600">An all-new site is coming soon.</p>
    </div>
  );
};

export default UnderConstructionPage;

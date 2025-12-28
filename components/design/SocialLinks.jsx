import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

const SocialLinks = () => {
  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-6 sansita-regular">
          Connect With Us On
        </h2>
        <Links />
      </div>
    </section>
  );
};

export const Links = ({ left = false }) => {
  return (
    <>
      <div className={`flex ${left ? "" : "justify-center"} space-x-6`}>
        <a
          href="https://www.facebook.com/caffepancetta"
          className="text-white bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
        >
          <FaFacebookF size={24} />
        </a>
        <a
          href="https://www.instagram.com/caffepancetta/"
          className="text-white bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <FaInstagram size={24} />
        </a>
      </div>
    </>
  );
};

export default SocialLinks;

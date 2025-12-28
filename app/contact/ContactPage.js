"use client";
import SocialLinks, { Links } from "@/components/design/SocialLinks";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
// import { Toaster, toast } from "sonner";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNo: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};
    if (!formData.name) tempErrors.name = "Name is required.";
    if (!formData.email) {
      tempErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email is not valid.";
    }
    if (!formData.message) tempErrors.message = "Message is required.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await fetch("/api/sendemail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        if (result.success) {
          // toast.success("Email sent successfully!");
          setFormData({ name: "", email: "", contactNo: "", message: "" });
          setErrors({});
        } else {
          // toast.error("Failed to send email.");
        }
      } catch (error) {
        // toast.error("An error occurred.");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      validate();
    }
  };

  return (
    <>
      {/* <Toaster richColors /> */}
      <section
        className="relative h-[60vh] md:h-[400px] bg-cover bg-center"
        style={{ backgroundImage: "url('/images/aboutbg.webp')" }}
      >
        <div className="absolute inset-0 bg-black/80"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <h1 className="text-5xl md:text-6xl header-font">Contact Us</h1>
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
        className="min-h-screen p-4 md:p-8 flex justify-center items-center"
        style={{
          backgroundImage: "url('/images/background.webp')",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="max-w-6xl w-full flex flex-col lg:flex-row  rounded-lg  overflow-hidden">
          {/* Left Section: Contact Details */}
          <div className="lg:w-1/2 p-8 lg:p-12 bg-white/80 text-gray-800">
            <h2 className="text-3xl header-font  mb-6 text-orange-800">
              Contact Details
            </h2>
            <div className="space-y-4 mb-8 sansita-regular">
              <div className="flex items-center">
                <span className="material-icons text-orange-600 mr-3">📞</span>
                <Link
                  href={"tel:+61 02 7251 1826"}
                  className="text-lg underline"
                >
                  (02) 7251 1826 (Engadine)
                </Link>
              </div>
              <div className="flex items-center">
                <span className="material-icons text-orange-600 mr-3">📞</span>
                <Link
                  href={"tel:+61 02 9570 4443"}
                  className="text-lg underline"
                >
                  (02) 9570 4443 (Hurstville)
                </Link>
              </div>
              <div className="flex items-center">
                <span className="material-icons text-orange-600 mr-3">📧</span>
                <Link
                  href={"mailto:caffepancetta@gmail.com"}
                  className="text-lg "
                >
                  Caffepancetta@gmail.com
                </Link>
              </div>
              <div className="flex items-center">
                <span className="material-icons text-orange-600 mr-3">🌐</span>
                <p className="text-lg">www.pancetta.com.au</p>
              </div>
            </div>

            <h2 className="text-3xl header-font mb-6 text-orange-800">
              Our Location:
            </h2>
            <div className="space-y-4 mb-8 sansita-regular">
              <div>
                <h3 className="text-xl font-semibold mb-2">ENGADINE</h3>
                <div className="flex items-start">
                  <span className="material-icons text-orange-600 mr-3 mt-1">
                    📍
                  </span>
                  <p className="text-lg">
                    13-15 Station Street, Engadine NSW 2333
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">HURSTVILLE</h3>
                <div className="flex items-start">
                  <span className="material-icons text-orange-600 mr-3 mt-1">
                    📍
                  </span>
                  <p className="text-lg">362 Forest Rd, Hurstville NSW 2220</p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl header-font  mb-6 text-orange-800">
              Check Reviews On
            </h2>
            <Links left={true} />
          </div>

          {/* Right Section: Get In Touch Form */}
          <div className="lg:w-1/2 p-4 pt-8 md:p-8 lg:p-12 bg-orange-50/50 border-orange-200 border-2 rounded-lg sansita-regular">
            <h2 className="text-3xl  font-bold mb-4 text-orange-800 text-center ">
              Get In Touch
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Contact us for any enquiries and we will get back to you as soon
              as possible.
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-800"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-800"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  id="contactNo"
                  name="contactNo"
                  placeholder="Contact No"
                  value={formData.contactNo}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-800"
                />
              </div>
              <div>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Message"
                  value={formData.message}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-800 resize-y"
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition duration-300"
              >
                Send Enquiries
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;

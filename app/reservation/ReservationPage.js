"use client";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";

const ReservationPage = () => {
  const [activeTab, setActiveTab] = useState("make");
  const [formData, setFormData] = useState({
    outlet: "ENGADINE",
    fullName: "",
    phone: "",
    email: "",
    noOfPeople: "1",
    date: "",
    time: "12:00 AM",
    notes: "",
  });
  const [cancelId, setCancelId] = useState("");
  const [reservationId, setReservationId] = useState(null);
  const [reservationMade, setReservationMade] = useState(false);
  const [reservationCancelled, setReservationCancelled] = useState(false);

  const handleChange = (e) => {
    const { id, value, name } = e.target;
    const key = name || id;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: value,
    }));
  };

  const handleCancelChange = (e) => {
    setCancelId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setReservationId(data.reservation._id);
        setReservationMade(true);
        setReservationCancelled(false);
        setFormData({
          outlet: "ENGADINE",
          fullName: "",
          phone: "",
          email: "",
          noOfPeople: "1",
          date: "",
          time: "12:00 AM",
          notes: "",
        });
        toast.success("Reservation made successfully!");
      } else {
        toast.error("Failed to make reservation.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reservationId: cancelId }),
      });

      if (response.ok) {
        setReservationCancelled(true);
        setReservationMade(false);
        setCancelId("");
        toast.success("Reservation cancelled successfully!");
      } else {
        const data = await response.json();
        toast.error(
          data.error || "Failed to cancel reservation. Please check the ID."
        );
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const outlets = [
    {
      name: "ENGADINE",
      address: "13-15 Station Street, Engadine NSW 2333",
    },
    {
      name: "HURSTVILLE",
      address: "362 Forest Rd, Hurstville NSW 2220",
    },
  ];

  const timeSlots = [];
  for (let i = 0; i < 24; i++) {
    for (const j of ["00", "30"]) {
      let hour = i;
      const minute = j;
      const period = hour >= 12 ? "PM" : "AM";
      if (hour === 0) {
        hour = 12;
      } else if (hour > 12) {
        hour -= 12;
      }
      timeSlots.push(`${hour}:${minute} ${period}`);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <section
        className="relative h-[60vh] md:h-[400px] bg-cover bg-center"
        style={{ backgroundImage: "url('/images/aboutbg.webp')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <h1 className="text-5xl md:text-6xl header-font">Reservation</h1>
          <Image
            src="/images/underline.png"
            alt="decorative underline"
            width={150}
            height={50}
            className="mt-2"
          />
        </div>
      </section>
      <div className="flex justify-center items-start pt-20 min-h-screen bg-gray-50 transition-all duration-300 sansita-regular">
        <div className="w-full max-w-5xl p-8 space-y-6 bg-white rounded-lg shadow-xl transition-transform duration-300 transform ">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("make")}
              className={`py-2 px-4 text-sm font-medium transition-all duration-300 ${
                activeTab === "make"
                  ? "border-b-2 border-black text-white bg-black"
                  : "text-gray-700 hover:text-black bg-gray-50"
              }`}
            >
              Make a Reservation
            </button>
            <button
              onClick={() => setActiveTab("cancel")}
              className={`py-2 px-4 text-sm font-medium transition-all duration-300 ${
                activeTab === "cancel"
                  ? "border-b-2 border-black text-white bg-black"
                  : "text-gray-700 hover:text-black bg-gray-50"
              }`}
            >
              Cancel Reservation
            </button>
          </div>

          <div className="transition-opacity duration-500 ease-in-out">
            {activeTab === "make" ? (
              reservationMade ? (
                <div className="text-center p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  <h3 className="font-bold text-lg">Reservation is Made!</h3>
                  <p>Your Reservation ID is: {reservationId}</p>
                  <button
                    onClick={() => setReservationMade(false)}
                    className="mt-4 px-4 py-2 bg-black text-white rounded-md"
                  >
                    Make Another Reservation
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Select Outlet
                    </label>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {outlets.map((outlet) => (
                        <label
                          key={outlet.name}
                          className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                            formData.outlet === outlet.name
                              ? "border-black bg-gray-100 shadow-md"
                              : "border-gray-200 bg-white hover:border-gray-400"
                          }`}
                        >
                          <input
                            type="radio"
                            className="sr-only"
                            name="outlet"
                            value={outlet.name}
                            checked={formData.outlet === outlet.name}
                            onChange={handleChange}
                          />
                          <div className="pl-4">
                            <span className=" text-lg text-gray-800">
                              {outlet.name}
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                              {outlet.address}
                            </p>
                          </div>
                          {formData.outlet === outlet.name && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                ></path>
                              </svg>
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-shadow duration-300"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="123-456-7890"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-shadow duration-300"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-shadow duration-300"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="noOfPeople"
                      className="block text-sm font-medium text-gray-700"
                    >
                      No. of People
                    </label>
                    <select
                      id="noOfPeople"
                      value={formData.noOfPeople}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-shadow duration-300"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(
                        (guest) => (
                          <option key={guest} value={guest}>
                            {guest}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="date"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Date
                      </label>
                      <input
                        id="date"
                        type="date"
                        min={today}
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-shadow duration-300"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="time"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Time
                      </label>
                      <select
                        id="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-shadow duration-300"
                      >
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      placeholder="Any special requests?"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="3"
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-shadow duration-300"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-transform duration-300 transform "
                  >
                    Make a Reservation
                  </button>
                </form>
              )
            ) : reservationCancelled ? (
              <div className="text-center p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                <h3 className="font-bold text-lg">Reservation is Cancelled!</h3>
              </div>
            ) : (
              <form onSubmit={handleCancelSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="cancelId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Reservation ID
                  </label>
                  <input
                    id="cancelId"
                    type="text"
                    placeholder="Enter your reservation ID"
                    value={cancelId}
                    onChange={handleCancelChange}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-shadow duration-300"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-transform duration-300 transform "
                >
                  Cancel Reservation
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReservationPage;

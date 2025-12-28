"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const StatusModal = ({ orderId, status, message, deliveryCode, onClose }) => {
  const router = useRouter();

  // Lock background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleClose = () => {
    // Prevent closing during loading or processing
    if (status === "loading" || status === "processing") {
      return;
    }

    if (status === "success") {
      router.push("/"); // redirect after success
    }
    onClose(); // close modal
  };

  const handleBackdropClick = (e) => {
    // Prevent closing when clicking backdrop during processing
    if (
      e.target === e.currentTarget &&
      status !== "loading" &&
      status !== "processing"
    ) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center mx-4">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#f5a623] mx-auto"></div>
            <p className="mt-6 text-lg font-medium text-gray-800">{message}</p>
            {orderId && (
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Order ID:</p>
                <p className="text-sm font-mono text-gray-800">{orderId}</p>
              </div>
            )}
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-[#f5a623] rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-[#f5a623] rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-[#f5a623] rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Please do not close this window
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Order placed successfully!
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700 mb-2 font-medium">Order ID:</p>
              <p className="text-lg font-bold text-gray-900 mb-4 font-mono bg-white px-3 py-2 rounded border">
                {orderId}
              </p>
              <p className="text-gray-700 mb-2 font-medium">Delivery code:</p>
              <p className="text-3xl font-bold text-[#f5a623] mb-4 font-mono bg-white px-3 py-2 rounded border">
                {deliveryCode}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-red-600 text-sm font-medium">
                📱 Please screenshot this information for your reference!
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-[#f5a623] text-white font-bold py-3 rounded-full hover:bg-orange-500 transition-colors"
            >
              Continue Shopping
            </button>
          </>
        )}

        {status === "processing" && (
          <>
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-[#f5a623] rounded-full mx-auto flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-6 text-lg font-medium text-gray-800">{message}</p>
            <p className="mt-2 text-sm text-gray-600">
              This may take a few moments...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Payment Failed
            </h2>
            <p className="text-gray-700 mb-6">{message}</p>
            <button
              onClick={handleClose}
              className="w-full bg-red-500 text-white font-bold py-2 rounded-full hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StatusModal;

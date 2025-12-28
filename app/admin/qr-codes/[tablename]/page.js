"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";

export default function PrintableQRCodePage() {
  const params = useParams();
  const router = useRouter();
  const tableNumber = decodeURIComponent(params.tablename);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const getMenuUrl = () => {
    return `${baseUrl}/menu/${encodeURIComponent(tableNumber)}`;
  };

  const getQRCodeUrl = () => {
    const menuUrl = getMenuUrl();
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
      menuUrl
    )}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area,
          .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            page-break-after: always;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 2rem;
          }
        }
      `}</style>

      {/* Screen View - Navigation */}
      <div className="no-print bg-background min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/qr-codes")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to QR Codes
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print QR Code
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold">Table {tableNumber}</h1>
              <p className="text-lg text-muted-foreground">
                Scan to view menu and order
              </p>
              <div className="flex justify-center">
                <img
                  src={getQRCodeUrl()}
                  alt={`QR Code for Table ${tableNumber}`}
                  className="w-80 h-80"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-mono break-all">{getMenuUrl()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Area */}
      <div className="printable-area hidden print:block">
        <div className="print-page">
          <div className="text-center space-y-8">
            {/* Restaurant Name/Logo Area */}
            <div className="mb-8">
              <h1 className="text-6xl font-bold mb-2">Pancetta</h1>
              <p className="text-2xl text-gray-600">Scan to view our menu</p>
            </div>

            {/* Table Number */}
            <div className="mb-8">
              <div className="inline-block px-12 py-6 bg-black text-white rounded-2xl">
                <p className="text-3xl font-semibold mb-2">TABLE</p>
                <p className="text-8xl font-bold">{tableNumber}</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-8">
              <div className="p-8 bg-white border-8 border-black rounded-3xl">
                <img
                  src={getQRCodeUrl()}
                  alt={`QR Code for Table ${tableNumber}`}
                  className="w-96 h-96"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <p className="text-3xl font-semibold">How to Order:</p>
              <ol className="text-2xl text-left max-w-2xl mx-auto space-y-3">
                <li className="flex items-start">
                  <span className="font-bold mr-4">1.</span>
                  <span>Open your phone camera</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-4">2.</span>
                  <span>Point at the QR code</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-4">3.</span>
                  <span>Tap the notification to open menu</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-4">4.</span>
                  <span>Browse, order, and enjoy!</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

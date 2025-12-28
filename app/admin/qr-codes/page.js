"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, ExternalLink, QrCode, Printer } from "lucide-react";

export default function QRCodesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session && !session.user.isAdmin) {
      router.push("/");
      toast.error("Access denied");
    } else if (session) {
      setBaseUrl(window.location.origin);
      fetchTables();
    }
  }, [session, status, router]);

  const fetchTables = async () => {
    try {
      const res = await fetch("/api/tables");
      const data = await res.json();
      if (res.ok) {
        setTables(data.tables || []);
      }
    } catch (error) {
      toast.error("Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  const getMenuUrl = (tableNumber) => {
    return `${baseUrl}/menu/${encodeURIComponent(tableNumber)}`;
  };

  const getQRCodeUrl = (tableNumber) => {
    const menuUrl = getMenuUrl(tableNumber);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      menuUrl
    )}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadQRCode = (tableNumber) => {
    const qrUrl = getQRCodeUrl(tableNumber);
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `table-${tableNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR Code downloaded!");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Codes</h1>
        <p className="text-muted-foreground">
          Generate QR codes for table menu ordering
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <Card key={table._id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Table {table.tableNumber}</span>
                <QrCode className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center bg-white p-4 rounded-lg">
                <img
                  src={getQRCodeUrl(table.tableNumber)}
                  alt={`QR Code for Table ${table.tableNumber}`}
                  className="w-48 h-48"
                />
              </div>

              <div className="space-y-2">
                <Label>Menu URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={getMenuUrl(table.tableNumber)}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(getMenuUrl(table.tableNumber))
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      window.open(getMenuUrl(table.tableNumber), "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => downloadQRCode(table.tableNumber)}
                  className="flex-1"
                  variant="outline"
                >
                  Download QR Code
                </Button>
                <Button
                  onClick={() =>
                    router.push(
                      `/admin/qr-codes/${encodeURIComponent(table.tableNumber)}`
                    )
                  }
                  className="flex-1"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>Capacity: {table.capacity} seats</p>
                <p>Location: {table.location}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No tables found. Create tables first to generate QR codes.
            </p>
            <Button
              onClick={() => router.push("/admin/tables")}
              className="mt-4"
            >
              Go to Tables
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

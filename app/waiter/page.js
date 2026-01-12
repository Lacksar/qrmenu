"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, LayoutGrid, ClipboardList, Settings } from "lucide-react";

export default function WaiterDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      session &&
      !session.user.isAdmin &&
      session.user.role !== "waiter"
    ) {
      router.push("/");
      toast.error("Access denied");
    } else if (session) {
      fetchTables();
    }
  }, [session, status, router]);

  const fetchTables = async () => {
    try {
      const res = await fetch("/api/tables");
      const data = await res.json();
      if (res.ok) {
        setTables(data.tables || []);
      } else {
        toast.error(data.error || "Failed to fetch tables");
      }
    } catch (error) {
      toast.error("Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: "bg-green-500",
      occupied: "bg-red-500",
      reserved: "bg-yellow-500",
      maintenance: "bg-gray-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const groupedTables = tables.reduce((acc, table) => {
    if (!acc[table.location]) {
      acc[table.location] = [];
    }
    acc[table.location].push(table);
    return acc;
  }, {});

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header - No Skeleton */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 md:px-6 py-3 bg-white/30 text-white rounded-lg font-medium backdrop-blur-sm">
                  <LayoutGrid className="h-5 w-5" />
                  <span className="hidden md:inline">Tables</span>
                </button>
                <button className="flex items-center gap-2 px-3 md:px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium backdrop-blur-sm transition-colors">
                  <ClipboardList className="h-5 w-5" />
                  <span className="hidden md:inline">Orders</span>
                </button>
                <button className="flex items-center gap-2 px-3 md:px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium backdrop-blur-sm transition-colors">
                  <Settings className="h-5 w-5" />
                  <span className="hidden md:inline">Settings</span>
                </button>
              </div>
              <Button
                onClick={() => signOut({ callbackUrl: "/login" })}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Tables Skeleton */}
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            {[1, 2].map((section) => (
              <div key={section}>
                <Skeleton className="h-7 w-32 mb-4" />
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="relative overflow-hidden">
                      <Skeleton className="absolute top-0 left-0 right-0 h-2" />
                      <CardContent className="pt-6 pb-4 px-4 text-center">
                        <Skeleton className="h-12 w-12 mx-auto mb-3" />
                        <Skeleton className="h-9 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Navigation */}
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/waiter")}
                className="flex items-center gap-2 px-3 md:px-6 py-3 bg-white/30 text-white rounded-lg font-medium backdrop-blur-sm"
              >
                <LayoutGrid className="h-5 w-5" />
                <span className="hidden md:inline">Tables</span>
              </button>
              <button
                onClick={() => router.push("/waiter/orders")}
                className="flex items-center gap-2 px-3 md:px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium backdrop-blur-sm transition-colors"
              >
                <ClipboardList className="h-5 w-5" />
                <span className="hidden md:inline">Orders</span>
              </button>
              <button
                onClick={() => router.push("/waiter/settings")}
                className="flex items-center gap-2 px-3 md:px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium backdrop-blur-sm transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span className="hidden md:inline">Settings</span>
              </button>
            </div>

            <Button
              onClick={() => signOut({ callbackUrl: "/login" })}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {Object.keys(groupedTables).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No tables found</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedTables).map(([location, locationTables]) => (
              <div key={location}>
                <h2 className="text-xl font-semibold mb-4 capitalize">
                  {location} ({locationTables.length})
                </h2>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {locationTables.map((table) => (
                    <Card
                      key={table._id}
                      className="relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-500"
                      onClick={() =>
                        router.push(`/waiter/tables/${table.tableNumber}`)
                      }
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-2 ${getStatusColor(
                          table.status
                        )}`}
                      />
                      <CardContent className="pt-6 pb-4 px-4 text-center">
                        <div className="text-4xl font-bold mb-3">
                          {table.tableNumber}
                        </div>
                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 text-sm rounded-lg">
                          <Plus className="mr-1 h-4 w-4" />
                          <span className="hidden md:flex">Take Order</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

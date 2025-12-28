"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WaiterTablesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session && session.user.role !== "waiter") {
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

  const updateTableStatus = async (tableId, newStatus) => {
    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("Table status updated");
        fetchTables();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update table");
      }
    } catch (error) {
      toast.error("Failed to update table");
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

  const getStatusBadge = (status) => {
    const variants = {
      available: "default",
      occupied: "destructive",
      reserved: "secondary",
      maintenance: "outline",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const filteredTables = tables.filter((table) => {
    if (filter === "all") return true;
    return table.status === filter;
  });

  const groupedTables = filteredTables.reduce((acc, table) => {
    if (!acc[table.location]) {
      acc[table.location] = [];
    }
    acc[table.location].push(table);
    return acc;
  }, {});

  if (loading || status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Table Management</h1>
          <p className="text-gray-600">Manage table status and availability</p>
        </div>
        <Button
          onClick={() => signOut({ callbackUrl: "/login" })}
          variant="outline"
        >
          Logout
        </Button>
      </div>

      <div className="mb-6 flex gap-4 items-center">
        <span className="text-sm font-medium">Filter by status:</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tables</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {locationTables.map((table) => (
                  <Card key={table._id} className="relative">
                    <div
                      className={`absolute top-0 left-0 right-0 h-2 rounded-t-lg ${getStatusColor(
                        table.status
                      )}`}
                    />
                    <CardHeader className="pt-6">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-2xl">
                          {table.tableNumber}
                        </CardTitle>
                        {getStatusBadge(table.status)}
                      </div>
                      <CardDescription>
                        Capacity: {table.capacity} seats
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {table.notes && (
                        <p className="text-sm text-gray-600 mb-4">
                          {table.notes}
                        </p>
                      )}
                      <div className="space-y-2">
                        <Select
                          value={table.status}
                          onValueChange={(value) =>
                            updateTableStatus(table._id, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="occupied">Occupied</SelectItem>
                            <SelectItem value="reserved">Reserved</SelectItem>
                            <SelectItem value="maintenance">
                              Maintenance
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

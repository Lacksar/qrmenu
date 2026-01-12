"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { UtensilsCrossed, Clock, Search, CheckCircle } from "lucide-react";

export default function TableOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    servedOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/table-orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const result = await response.json();

      if (result.orders) {
        let filteredOrders = result.orders;

        // Filter by status
        if (activeTab !== "All") {
          filteredOrders = filteredOrders.filter(
            (order) => order.status.toLowerCase() === activeTab.toLowerCase()
          );
        }

        // Filter by search term (table number or order number)
        if (searchTerm) {
          filteredOrders = filteredOrders.filter(
            (order) =>
              order.tableNumber
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              order.orderNumber.toString().includes(searchTerm)
          );
        }

        setOrders(filteredOrders);

        // Calculate summary
        setSummary({
          totalOrders: result.orders.length,
          pendingOrders: result.orders.filter((o) => o.status === "pending")
            .length,
          servedOrders: result.orders.filter((o) => o.status === "served")
            .length,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm]);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "secondary";
      case "preparing":
        return "default";
      case "ready":
        return "outline";
      case "served":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const capitalize = (str) => {
    if (typeof str !== "string" || !str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/table-orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Table Orders
            </CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Served Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.servedOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Table Orders</CardTitle>
              <CardDescription>
                Orders placed via QR code table ordering system
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by table or order #..."
                className="pl-8 sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 mt-4">
            <p className="text-sm font-medium text-muted-foreground">Status:</p>
            {[
              "All",
              "Pending",
              "Preparing",
              "Ready",
              "Served",
              "Cancelled",
            ].map((tab) => (
              <Button
                key={tab}
                size="sm"
                variant={activeTab === tab ? "default" : "outline"}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">
                      #{order.orderNumber}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {order.tableNumber}
                    </TableCell>
                    <TableCell>
                      {order.customerName ? (
                        <span className="text-sm font-medium">
                          {order.customerName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>
                        {capitalize(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="text-sm">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{order.items.length - 2} more
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.customerNotes ? (
                        <div className="max-w-xs truncate text-sm text-muted-foreground">
                          {order.customerNotes}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.createdBy === "waiter" ? (
                          <div>
                            <Badge variant="outline" className="text-xs">
                              Waiter
                            </Badge>
                            {order.waiterName && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {order.waiterName}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Customer
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(order.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${(order.totalAmount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {order.status !== "served" &&
                        order.status !== "cancelled" &&
                        order.status !== "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const nextStatus =
                                order.status === "pending"
                                  ? "preparing"
                                  : order.status === "preparing"
                                  ? "ready"
                                  : "served";
                              updateOrderStatus(order._id, nextStatus);
                            }}
                          >
                            {order.status === "pending"
                              ? "Start"
                              : order.status === "preparing"
                              ? "Ready"
                              : "Serve"}
                          </Button>
                        )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="10" className="text-center py-8">
                    No table orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

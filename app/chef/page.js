"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, ChefHat, CheckCircle, AlertCircle } from "lucide-react";

export default function ChefKitchenDisplay() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session && session.user.role !== "chef") {
      router.push("/");
      toast.error("Access denied");
    } else if (session) {
      fetchOrders();
      // Auto-refresh every 10 seconds
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [session, status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/table-orders");
      const data = await res.json();
      if (res.ok && data.orders) {
        // Filter only active orders and sort by oldest first
        const activeOrders = data.orders
          .filter(
            (order) => order.status !== "served" && order.status !== "cancelled"
          )
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setOrders(activeOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/table-orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("Order status updated");
        fetchOrders();
      } else {
        toast.error("Failed to update order");
      }
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { variant: "secondary", label: "NEW" },
      preparing: { variant: "default", label: "PREPARING" },
      ready: { variant: "outline", label: "READY" },
    };
    const { variant, label } = config[status] || config.pending;
    return (
      <Badge variant={variant} className="text-xs">
        {label}
      </Badge>
    );
  };

  const getTimeElapsed = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = Math.floor((now - created) / 1000 / 60);

    if (diffMinutes < 1) return "Now";
    if (diffMinutes === 1) return "1m";
    return `${diffMinutes}m`;
  };

  const getTimeColor = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = Math.floor((now - created) / 1000 / 60);

    if (diffMinutes < 5) return "text-green-600";
    if (diffMinutes < 10) return "text-yellow-600";
    return "text-red-600";
  };

  const groupedOrders = {
    pending: orders.filter((o) => o.status === "pending"),
    preparing: orders.filter((o) => o.status === "preparing"),
    ready: orders.filter((o) => o.status === "ready"),
  };

  if (loading || status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <div className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-3 py-2 md:px-4 md:py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded">
                <ChefHat className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base md:text-lg font-bold">
                  Kitchen Display
                </h1>
                <p className="text-xs text-muted-foreground hidden md:block">
                  {session?.user?.name}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs md:text-sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="container mx-auto px-2 py-3 md:px-4 md:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
          {/* Pending Orders */}
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <h2 className="text-sm md:text-base font-bold">New Orders</h2>
              </div>
              <Badge variant="secondary" className="text-sm px-2 py-0.5">
                {groupedOrders.pending.length}
              </Badge>
            </div>
            <Separator />
            <div className="space-y-2 md:space-y-3">
              {groupedOrders.pending.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No pending orders
                  </CardContent>
                </Card>
              ) : (
                groupedOrders.pending.map((order) => (
                  <Card
                    key={order._id}
                    className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2 px-3 pt-3 md:px-4 md:pt-4">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <CardTitle className="text-lg md:text-xl font-bold">
                            #{order.orderNumber}
                          </CardTitle>
                          <p className="text-sm md:text-base font-semibold text-primary">
                            Table {order.tableNumber}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <div
                        className={`flex items-center gap-1 text-xs font-medium ${getTimeColor(
                          order.createdAt
                        )}`}
                      >
                        <Clock className="h-3 w-3" />
                        {getTimeElapsed(order.createdAt)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 px-3 pb-3 md:px-4 md:pb-4">
                      <div className="space-y-1.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-sm">
                                {item.quantity}x {item.name}
                              </span>
                            </div>
                            {item.notes && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded p-1.5">
                                <p className="text-xs text-yellow-800 font-medium">
                                  ⚠️ {item.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {order.customerNotes && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <p className="text-xs font-semibold text-blue-900 mb-0.5">
                            NOTES:
                          </p>
                          <p className="text-xs text-blue-800">
                            {order.customerNotes}
                          </p>
                        </div>
                      )}
                      <Button
                        onClick={() =>
                          updateOrderStatus(order._id, "preparing")
                        }
                        className="w-full h-9 text-sm font-semibold"
                        size="sm"
                      >
                        Start Preparing
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Preparing Orders */}
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <ChefHat className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm md:text-base font-bold">In Progress</h2>
              </div>
              <Badge className="text-sm px-2 py-0.5">
                {groupedOrders.preparing.length}
              </Badge>
            </div>
            <Separator />
            <div className="space-y-2 md:space-y-3">
              {groupedOrders.preparing.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No orders in preparation
                  </CardContent>
                </Card>
              ) : (
                groupedOrders.preparing.map((order) => (
                  <Card
                    key={order._id}
                    className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2 px-3 pt-3 md:px-4 md:pt-4">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <CardTitle className="text-lg md:text-xl font-bold">
                            #{order.orderNumber}
                          </CardTitle>
                          <p className="text-sm md:text-base font-semibold text-primary">
                            Table {order.tableNumber}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <div
                        className={`flex items-center gap-1 text-xs font-medium ${getTimeColor(
                          order.createdAt
                        )}`}
                      >
                        <Clock className="h-3 w-3" />
                        {getTimeElapsed(order.createdAt)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 px-3 pb-3 md:px-4 md:pb-4">
                      <div className="space-y-1.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-sm">
                                {item.quantity}x {item.name}
                              </span>
                            </div>
                            {item.notes && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded p-1.5">
                                <p className="text-xs text-yellow-800 font-medium">
                                  ⚠️ {item.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {order.customerNotes && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <p className="text-xs font-semibold text-blue-900 mb-0.5">
                            NOTES:
                          </p>
                          <p className="text-xs text-blue-800">
                            {order.customerNotes}
                          </p>
                        </div>
                      )}
                      <Button
                        onClick={() => updateOrderStatus(order._id, "ready")}
                        className="w-full h-9 text-sm font-semibold bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        Mark as Ready
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Ready Orders */}
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <h2 className="text-sm md:text-base font-bold">Ready</h2>
              </div>
              <Badge variant="outline" className="text-sm px-2 py-0.5">
                {groupedOrders.ready.length}
              </Badge>
            </div>
            <Separator />
            <div className="space-y-2 md:space-y-3">
              {groupedOrders.ready.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No orders ready
                  </CardContent>
                </Card>
              ) : (
                groupedOrders.ready.map((order) => (
                  <Card
                    key={order._id}
                    className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2 px-3 pt-3 md:px-4 md:pt-4">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <CardTitle className="text-lg md:text-xl font-bold">
                            #{order.orderNumber}
                          </CardTitle>
                          <p className="text-sm md:text-base font-semibold text-primary">
                            Table {order.tableNumber}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <div
                        className={`flex items-center gap-1 text-xs font-medium ${getTimeColor(
                          order.createdAt
                        )}`}
                      >
                        <Clock className="h-3 w-3" />
                        {getTimeElapsed(order.createdAt)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 px-3 pb-3 md:px-4 md:pb-4">
                      <div className="space-y-1.5">
                        {order.items.map((item, idx) => (
                          <div key={idx}>
                            <span className="font-semibold text-sm">
                              {item.quantity}x {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={() => updateOrderStatus(order._id, "served")}
                        variant="outline"
                        className="w-full h-9 text-sm font-semibold"
                        size="sm"
                      >
                        Mark as Served
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Clock,
  ChefHat,
  CheckCircle,
  AlertCircle,
  Settings,
  XCircle,
} from "lucide-react";

export default function ChefKitchenDisplay() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      session &&
      !session.user.isAdmin &&
      session.user.role !== "chef"
    ) {
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
            (order) =>
              order.status !== "served" &&
              order.status !== "completed" &&
              order.status !== "cancelled"
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

  const handleCancelClick = (order) => {
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      const res = await fetch(`/api/table-orders/${orderToCancel._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        toast.success("Order cancelled");
        fetchOrders();
      } else {
        toast.error("Failed to cancel order");
      }
    } catch (error) {
      toast.error("Failed to cancel order");
    } finally {
      setCancelDialogOpen(false);
      setOrderToCancel(null);
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
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        {/* Header - No Skeleton */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg sticky top-0 z-20">
          <div className="w-full px-3 py-4 md:px-4">
            <div className="flex justify-between items-center gap-2">
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 md:px-6 py-3 bg-white/30 text-white rounded-lg font-medium backdrop-blur-sm">
                  <ChefHat className="h-5 w-5" />
                  <span className="hidden md:inline">Kitchen</span>
                </button>
                <button className="flex items-center gap-2 px-3 md:px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium backdrop-blur-sm transition-colors">
                  <Settings className="h-5 w-5" />
                  <span className="hidden md:inline">Settings</span>
                </button>
              </div>
              <Button
                onClick={() => signOut({ callbackUrl: "/login" })}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-sm px-3 md:px-4"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Orders Grid Skeleton */}
        <div className="w-full px-3 py-3 md:px-4 md:py-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
            {[1, 2, 3].map((col) => (
              <div key={col} className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Separator />
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg sticky top-0 z-20">
        <div className="w-full px-3 py-4 md:px-4">
          <div className="flex justify-between items-center gap-2">
            {/* Navigation */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 md:px-6 py-3 bg-white/30 text-white rounded-lg font-medium backdrop-blur-sm">
                <ChefHat className="h-5 w-5" />
                <span className="hidden md:inline">Kitchen</span>
              </button>
              <button
                onClick={() => router.push("/chef/settings")}
                className="flex items-center gap-2 px-3 md:px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium backdrop-blur-sm transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span className="hidden md:inline">Settings</span>
              </button>
            </div>

            <Button
              onClick={() => signOut({ callbackUrl: "/login" })}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-sm px-3 md:px-4"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Tabs - Only visible on mobile */}
      <div className="lg:hidden bg-white border-b sticky top-[72px] z-10 overflow-x-hidden">
        <div className="flex w-full">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-3 px-2 text-xs font-semibold transition-colors ${
              activeTab === "pending"
                ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <AlertCircle className="h-4 w-4" />
              <span>New</span>
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0 min-w-[20px]"
              >
                {groupedOrders.pending.length}
              </Badge>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("preparing")}
            className={`flex-1 py-3 px-2 text-xs font-semibold transition-colors ${
              activeTab === "preparing"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <ChefHat className="h-4 w-4" />
              <span>Progress</span>
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0 min-w-[20px]"
              >
                {groupedOrders.preparing.length}
              </Badge>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("ready")}
            className={`flex-1 py-3 px-2 text-xs font-semibold transition-colors ${
              activeTab === "ready"
                ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="h-4 w-4" />
              <span>Ready</span>
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0 min-w-[20px]"
              >
                {groupedOrders.ready.length}
              </Badge>
            </div>
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="w-full px-3 py-3 md:px-4 md:py-4 max-w-7xl mx-auto">
        {/* Desktop: Show all columns */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
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
                    className="border-t-4 border-t-orange-500 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            Table: {order.tableNumber}
                          </h3>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          Preparing
                        </Badge>
                      </div>

                      {/* Time */}
                      <div
                        className={`flex items-center gap-1.5 text-sm ${getTimeColor(
                          order.createdAt
                        )}`}
                      >
                        <Clock className="h-4 w-4" />
                        <span>{getTimeElapsed(order.createdAt)} ago</span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1 text-gray-600">
                        {order.items.map((item, idx) => (
                          <div key={idx}>
                            <p className="text-base">
                              {item.name} x {item.quantity}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Notes */}
                      {order.customerNotes && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                          <p className="text-sm font-semibold text-yellow-900 mb-1">
                            Notes:
                          </p>
                          <p className="text-sm text-yellow-800">
                            {order.customerNotes}
                          </p>
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                          onClick={() =>
                            updateOrderStatus(order._id, "preparing")
                          }
                          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11"
                        >
                          Start Preparing
                        </Button>
                        <Button
                          onClick={() => handleCancelClick(order)}
                          variant="destructive"
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold h-11"
                        >
                          Cancel
                        </Button>
                      </div>
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
                    className="border-t-4 border-t-orange-500 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            Table: {order.tableNumber}
                          </h3>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          Preparing
                        </Badge>
                      </div>

                      {/* Time */}
                      <div
                        className={`flex items-center gap-1.5 text-sm ${getTimeColor(
                          order.createdAt
                        )}`}
                      >
                        <Clock className="h-4 w-4" />
                        <span>{getTimeElapsed(order.createdAt)} ago</span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1 text-gray-600">
                        {order.items.map((item, idx) => (
                          <div key={idx}>
                            <p className="text-base">
                              {item.name} x {item.quantity}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Notes */}
                      {order.customerNotes && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                          <p className="text-sm font-semibold text-yellow-900 mb-1">
                            Notes:
                          </p>
                          <p className="text-sm text-yellow-800">
                            {order.customerNotes}
                          </p>
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                          onClick={() => updateOrderStatus(order._id, "ready")}
                          className="bg-green-500 hover:bg-green-600 text-white font-semibold h-11"
                        >
                          Mark as Ready
                        </Button>
                        <Button
                          onClick={() => handleCancelClick(order)}
                          variant="destructive"
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold h-11"
                        >
                          Cancel
                        </Button>
                      </div>
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
                    className="border-t-4 border-t-green-500 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            Table: {order.tableNumber}
                          </h3>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Ready
                        </Badge>
                      </div>

                      {/* Time */}
                      <div
                        className={`flex items-center gap-1.5 text-sm ${getTimeColor(
                          order.createdAt
                        )}`}
                      >
                        <Clock className="h-4 w-4" />
                        <span>{getTimeElapsed(order.createdAt)} ago</span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1 text-gray-600">
                        {order.items.map((item, idx) => (
                          <div key={idx}>
                            <p className="text-base">
                              {item.name} x {item.quantity}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Notes */}
                      {order.customerNotes && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                          <p className="text-sm font-semibold text-yellow-900 mb-1">
                            Notes:
                          </p>
                          <p className="text-sm text-yellow-800">
                            {order.customerNotes}
                          </p>
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                          onClick={() => updateOrderStatus(order._id, "served")}
                          className="bg-green-500 hover:bg-green-600 text-white font-semibold h-11"
                        >
                          Mark as Served
                        </Button>
                        <Button
                          onClick={() => handleCancelClick(order)}
                          variant="destructive"
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold h-11"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Mobile: Show only active tab */}
        <div className="lg:hidden space-y-3">
          {activeTab === "pending" && (
            <div className="space-y-3">
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
                    className="border-t-4 border-t-orange-500 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            Table: {order.tableNumber}
                          </h3>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                          New
                        </Badge>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 text-sm ${getTimeColor(
                          order.createdAt
                        )}`}
                      >
                        <Clock className="h-4 w-4" />
                        <span>{getTimeElapsed(order.createdAt)} ago</span>
                      </div>
                      <div className="space-y-1 text-gray-600">
                        {order.items.map((item, idx) => (
                          <div key={idx}>
                            <p className="text-base">
                              {item.name} x {item.quantity}
                            </p>
                          </div>
                        ))}
                      </div>
                      {order.customerNotes && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                          <p className="text-sm font-semibold text-yellow-900 mb-1">
                            Notes:
                          </p>
                          <p className="text-sm text-yellow-800">
                            {order.customerNotes}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                          onClick={() =>
                            updateOrderStatus(order._id, "preparing")
                          }
                          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11"
                        >
                          Start Preparing
                        </Button>
                        <Button
                          onClick={() => handleCancelClick(order)}
                          variant="destructive"
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold h-11"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "preparing" && (
            <div className="space-y-3">
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
                    className="border-t-4 border-t-orange-500 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            Table: {order.tableNumber}
                          </h3>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          Preparing
                        </Badge>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 text-sm ${getTimeColor(
                          order.createdAt
                        )}`}
                      >
                        <Clock className="h-4 w-4" />
                        <span>{getTimeElapsed(order.createdAt)} ago</span>
                      </div>
                      <div className="space-y-1 text-gray-600">
                        {order.items.map((item, idx) => (
                          <div key={idx}>
                            <p className="text-base">
                              {item.name} x {item.quantity}
                            </p>
                          </div>
                        ))}
                      </div>
                      {order.customerNotes && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                          <p className="text-sm font-semibold text-yellow-900 mb-1">
                            Notes:
                          </p>
                          <p className="text-sm text-yellow-800">
                            {order.customerNotes}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                          onClick={() => updateOrderStatus(order._id, "ready")}
                          className="bg-green-500 hover:bg-green-600 text-white font-semibold h-11"
                        >
                          Mark as Ready
                        </Button>
                        <Button
                          onClick={() => handleCancelClick(order)}
                          variant="destructive"
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold h-11"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "ready" && (
            <div className="space-y-3">
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
                    className="border-t-4 border-t-green-500 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            Table: {order.tableNumber}
                          </h3>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Ready
                        </Badge>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 text-sm ${getTimeColor(
                          order.createdAt
                        )}`}
                      >
                        <Clock className="h-4 w-4" />
                        <span>{getTimeElapsed(order.createdAt)} ago</span>
                      </div>
                      <div className="space-y-1 text-gray-600">
                        {order.items.map((item, idx) => (
                          <div key={idx}>
                            <p className="text-base">
                              {item.name} x {item.quantity}
                            </p>
                          </div>
                        ))}
                      </div>
                      {order.customerNotes && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                          <p className="text-sm font-semibold text-yellow-900 mb-1">
                            Notes:
                          </p>
                          <p className="text-sm text-yellow-800">
                            {order.customerNotes}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                          onClick={() => updateOrderStatus(order._id, "served")}
                          className="bg-green-500 hover:bg-green-600 text-white font-semibold h-11"
                        >
                          Mark as Served
                        </Button>
                        <Button
                          onClick={() => handleCancelClick(order)}
                          variant="destructive"
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold h-11"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order{" "}
              <span className="font-bold">#{orderToCancel?.orderNumber}</span>{" "}
              from Table {orderToCancel?.tableNumber}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelOrder}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

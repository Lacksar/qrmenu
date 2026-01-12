"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  LayoutGrid,
  ClipboardList,
  Settings,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function WaiterOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    orderId: null,
  });
  const [expandedTables, setExpandedTables] = useState({});

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
      fetchOrders();
    }
  }, [session, status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/table-orders");
      const data = await res.json();

      if (res.ok) {
        // Show all active orders (not completed or cancelled)
        const activeOrders =
          data.orders
            ?.filter(
              (order) =>
                order.status !== "completed" && order.status !== "cancelled"
            )
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) ||
          [];
        setOrders(activeOrders);
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Group orders by table
  const groupOrdersByTable = () => {
    const grouped = {};
    orders.forEach((order) => {
      const tableNum = order.tableNumber;
      if (!grouped[tableNum]) {
        grouped[tableNum] = [];
      }
      grouped[tableNum].push(order);
    });
    return grouped;
  };

  const tableOrders = groupOrdersByTable();
  const tableNumbers = Object.keys(tableOrders).sort((a, b) => a - b);

  const toggleTable = (tableNum) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableNum]: !prev[tableNum],
    }));
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/table-orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        toast.success("Order cancelled successfully");
        fetchOrders();
      } else {
        toast.error("Failed to cancel order");
      }
    } catch (error) {
      toast.error("Failed to cancel order");
    }
    setCancelDialog({ open: false, orderId: null });
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "secondary",
      preparing: "default",
      ready: "outline",
      served: "default",
    };
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
      ready: "bg-green-100 text-green-800",
      served: "bg-purple-100 text-purple-800",
    };
    return (
      <Badge className={colors[status] || ""}>{status.toUpperCase()}</Badge>
    );
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 md:px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium backdrop-blur-sm transition-colors">
                  <LayoutGrid className="h-5 w-5" />
                  <span className="hidden md:inline">Tables</span>
                </button>
                <button className="flex items-center gap-2 px-3 md:px-6 py-3 bg-white/30 text-white rounded-lg font-medium backdrop-blur-sm">
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

        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
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
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/waiter")}
                className="flex items-center gap-2 px-3 md:px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium backdrop-blur-sm transition-colors"
              >
                <LayoutGrid className="h-5 w-5" />
                <span className="hidden md:inline">Tables</span>
              </button>
              <button className="flex items-center gap-2 px-3 md:px-6 py-3 bg-white/30 text-white rounded-lg font-medium backdrop-blur-sm">
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

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-6">Active Orders by Table</h2>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 text-lg">No active orders</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tableNumbers.map((tableNum) => {
              const tableOrdersList = tableOrders[tableNum];
              const totalAmount = tableOrdersList.reduce(
                (sum, order) => sum + order.totalAmount,
                0
              );
              const hasReadyOrders = tableOrdersList.some(
                (order) => order.status === "ready"
              );
              const isExpanded = expandedTables[tableNum];

              return (
                <Card
                  key={tableNum}
                  className={`${
                    hasReadyOrders
                      ? "border-2 border-green-500 shadow-lg"
                      : "border"
                  }`}
                >
                  <CardHeader
                    className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleTable(tableNum)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">
                            Table {tableNum}
                          </CardTitle>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {tableOrdersList.length} order
                          {tableOrdersList.length > 1 ? "s" : ""} • $
                          {totalAmount.toFixed(2)}
                        </p>
                      </div>
                      {hasReadyOrders && (
                        <Badge className="bg-green-500 text-white">Ready</Badge>
                      )}
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="space-y-3">
                      {tableOrdersList.map((order) => (
                        <div
                          key={order._id}
                          className="p-3 bg-gray-50 rounded-lg space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-sm">
                                Order #{order.orderNumber}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(order.status)}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setCancelDialog({
                                    open: true,
                                    orderId: order._id,
                                  })
                                }
                                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-xs"
                              >
                                <span className="text-gray-700">
                                  {item.quantity}x {item.name}
                                </span>
                                <span className="font-medium">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {order.customerNotes && (
                            <div className="text-xs bg-yellow-50 border border-yellow-200 rounded p-2">
                              <span className="font-medium">Notes:</span>{" "}
                              {order.customerNotes}
                            </div>
                          )}

                          <div className="pt-2 border-t flex justify-between items-center">
                            <span className="text-xs font-medium">
                              Order Total:
                            </span>
                            <span className="text-sm font-bold text-orange-600">
                              ${order.totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}

                      <div className="pt-3 border-t-2 border-gray-300 flex justify-between items-center">
                        <span className="font-bold">Table Total:</span>
                        <span className="text-lg font-bold text-orange-600">
                          ${totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog({ open, orderId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleCancelOrder(cancelDialog.orderId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

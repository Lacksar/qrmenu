"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import StatusUpdateDialog from "@/components/admin/StatusUpdateDialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import FallbackImage from "@/components/ui/FallbackImage";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }
      const result = await response.json();
      if (result.success) {
        setOrder(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch order details");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchOrderDetails();
  }, [id]);

  const handleUpdateStatus = async (status) => {
    setIsUpdating(true);
    const newStatus = status.toLowerCase();
    let payload = { status: newStatus };

    // If it's a cash order and it's being marked as delivered, update payment status
    if (
      order.paymentMethod === "cash" &&
      newStatus === "delivered" &&
      order.paymentStatus !== "paid"
    ) {
      payload.paymentStatus = "paid";
    }

    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to update order status");
      }
      await fetchOrderDetails(); // Re-fetch to show updated data
    } catch (error) {
      console.error(error);
      // Optionally, show an error toast to the user
    } finally {
      setIsUpdating(false);
      setDialogOpen(false);
    }
  };

  const openDialog = (status) => {
    setSelectedStatus(status);
    setDialogOpen(true);
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "secondary";
      case "delivered":
        return "default";
      case "confirmed":
        return "green";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-10" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-8" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="grid gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return <div>Order not found.</div>;
  }

  const capitalize = (str) => {
    if (typeof str !== "string" || !str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const renderActionButtons = () => {
    const { orderType, paymentMethod, paymentStatus, status } = order;
    const lowerCaseStatus = status.toLowerCase();

    // Pay & Pickup (Online Payment)
    if (orderType === "pickup" && paymentMethod === "online") {
      if (paymentStatus === "paid") {
        if (
          lowerCaseStatus !== "delivered" &&
          lowerCaseStatus !== "cancelled"
        ) {
          return (
            <>
              <Button
                onClick={() => openDialog("Delivered")}
                disabled={isUpdating}
                size="sm"
              >
                Mark as Delivered
              </Button>
              <Button
                variant="destructive"
                onClick={() => openDialog("Cancelled")}
                disabled={isUpdating}
                size="sm"
              >
                Cancel Order
              </Button>
            </>
          );
        }
      } else {
        // payment pending
        if (lowerCaseStatus === "pending") {
          return (
            <Button
              variant="destructive"
              onClick={() => openDialog("Cancelled")}
              disabled={isUpdating}
              size="sm"
            >
              Cancel Order
            </Button>
          );
        }
      }
    }

    // Payment on Pickup
    if (orderType === "pickup" && paymentMethod === "cash") {
      if (lowerCaseStatus === "pending") {
        return (
          <>
            <Button
              onClick={() => openDialog("Confirmed")}
              disabled={isUpdating}
              size="sm"
            >
              Confirm Order
            </Button>
            <Button
              variant="destructive"
              onClick={() => openDialog("Cancelled")}
              disabled={isUpdating}
              size="sm"
            >
              Cancel Order
            </Button>
          </>
        );
      }
      if (lowerCaseStatus === "confirmed") {
        return (
          <>
            <Button
              onClick={() => openDialog("Delivered")}
              disabled={isUpdating}
              size="sm"
            >
              Mark as Delivered
            </Button>
            <Button
              variant="destructive"
              onClick={() => openDialog("Cancelled")}
              disabled={isUpdating}
              size="sm"
            >
              Cancel Order
            </Button>
          </>
        );
      }
    }

    // Home Delivery
    if (orderType === "homedelivery") {
      if (lowerCaseStatus === "pending") {
        return (
          <>
            <Button
              onClick={() => openDialog("Confirmed")}
              disabled={isUpdating}
              size="sm"
            >
              Confirm Order
            </Button>
            <Button
              onClick={() => openDialog("Delivered")}
              disabled={isUpdating}
              size="sm"
            >
              Mark as Delivered
            </Button>
            <Button
              variant="destructive"
              onClick={() => openDialog("Cancelled")}
              disabled={isUpdating}
              size="sm"
            >
              Cancel Order
            </Button>
          </>
        );
      }
      if (lowerCaseStatus === "confirmed") {
        return (
          <>
            <Button
              onClick={() => openDialog("Delivered")}
              disabled={isUpdating}
              size="sm"
            >
              Mark as Delivered
            </Button>
            <Button
              variant="destructive"
              onClick={() => openDialog("Cancelled")}
              disabled={isUpdating}
              size="sm"
            >
              Cancel Order
            </Button>
          </>
        );
      }
    }

    return null;
  };

  const subtotal =
    order?.menu.reduce(
      (acc, item) => acc + (item.price || 0) * item.quantity,
      0
    ) || 0;

  const actionButtons = renderActionButtons();

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">Order #{order._id}</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.menu.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FallbackImage
                            src={item.image}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="rounded-md"
                          />

                          <span>{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${(item.price || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        ${(item.quantity * (item.price || 0)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end">
              <div className="grid gap-1 text-right">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {order.orderType === "homedelivery" && (
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span>${(order.deliveryCharge || 0).toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${(order.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
        <div>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Order Type</CardTitle>
            </CardHeader>
            <CardContent className="grid text-sm">
              <p className="">
                <span className="bg-orange-600 text-white px-3 py-1 rounded-full ">
                  {order.orderType == "homedelivery" && "Home Delivery"}
                  {order.orderType == "pickup" &&
                    (order.paymentMethod === "online"
                      ? "Paid Pickup"
                      : "Payment on Pickup")}
                </span>
              </p>
            </CardContent>
          </Card>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p>
                <strong>Method:</strong> {capitalize(order.paymentMethod)}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <Badge
                  variant={
                    order.paymentMethod === "online" &&
                    order.paymentStatus === "pending"
                      ? "destructive"
                      : order.paymentStatus === "paid"
                      ? "success"
                      : "secondary"
                  }
                >
                  {capitalize(order.paymentStatus)}
                </Badge>
              </p>
            </CardContent>
          </Card>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={getStatusVariant(order.status)}>
                {capitalize(order.status)}
              </Badge>
            </CardContent>
            {actionButtons && (
              <CardFooter className="flex gap-2">{actionButtons}</CardFooter>
            )}
          </Card>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p>
                <strong>Name:</strong> {`${order.firstName} ${order.lastName}`}
              </p>
              <p>
                <strong>Email:</strong> {order.email}
              </p>
              <p>
                <strong>Phone:</strong> {order.phone}
              </p>
              <p>
                <strong>Outlet:</strong> <Badge>{order.outlet}</Badge>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                {order.orderType === "pickup"
                  ? "Pickup Details"
                  : "Delivery Details"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm ">
              {order.orderType === "pickup" ? (
                <>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(order.pickupDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong> {order.pickupTime}
                  </p>
                </>
              ) : (
                <div className="space-y-1 flex flex-col gap-3">
                  <p>
                    <strong>Street:</strong> {order.street}
                  </p>
                  <p>
                    <strong>Suburb:</strong> {order.suburb}
                  </p>
                  <p>
                    <strong>State:</strong> {order.state}
                  </p>
                  <p>
                    <strong>Postcode:</strong> {order.postcode}
                  </p>
                  <p>
                    <strong>Country:</strong> {order.country}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <StatusUpdateDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={() => handleUpdateStatus(selectedStatus)}
        orderId={order._id}
        newStatus={selectedStatus}
      />
    </div>
  );
}

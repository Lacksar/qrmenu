"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DollarSign,
  Settings,
  ArrowLeft,
  Receipt,
  Printer,
  X,
  User,
  Phone,
  Percent,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
} from "lucide-react";

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const tableNumber = params.table;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    orderId: null,
  });

  // Editable bill items (combined from orders + manually added)
  const [billItems, setBillItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);

  // Billing details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [taxValue, setTaxValue] = useState(0);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  // Ref to prevent double-click
  const addingItemRef = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      session &&
      !session.user.isAdmin &&
      session.user.role !== "cashier"
    ) {
      router.push("/");
      toast.error("Access denied");
    } else if (session) {
      fetchOrders();
      fetchMenuItems();
    }
  }, [session, status, router]);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      if (res.ok && data.success) {
        // Flatten the menu items from all categories
        const allItems = [];
        data.data.forEach((category) => {
          if (category.menuItems && category.menuItems.length > 0) {
            allItems.push(...category.menuItems);
          }
        });
        setMenuItems(allItems);
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      toast.error("Failed to load menu items");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/table-orders?tableNumber=${tableNumber}`);
      const data = await res.json();

      if (res.ok) {
        // Show ALL active orders for this table (not completed or cancelled)
        const billableOrders =
          data.orders?.filter(
            (order) =>
              order.status !== "completed" && order.status !== "cancelled"
          ) || [];
        setOrders(billableOrders);

        // Convert orders to bill items
        const items = [];
        billableOrders.forEach((order) => {
          order.items.forEach((item) => {
            const existingIndex = items.findIndex(
              (i) => i.name === item.name && i.price === item.price
            );
            if (existingIndex > -1) {
              items[existingIndex].quantity += item.quantity;
            } else {
              items.push({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                fromOrder: true,
              });
            }
          });
        });
        setBillItems(items);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const getSubTotal = () => {
    return billItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getDiscountAmount = () => {
    const subTotal = getSubTotal();
    if (discountType === "Percentage") {
      return (subTotal * (parseFloat(discountValue) || 0)) / 100;
    }
    return parseFloat(discountValue) || 0;
  };

  const getTotalAfterDiscount = () => {
    return getSubTotal() - getDiscountAmount();
  };

  const getTaxAmount = () => {
    const totalAfterDiscount = getTotalAfterDiscount();
    return (totalAfterDiscount * (parseFloat(taxValue) || 0)) / 100;
  };

  const getFinalTotal = () => {
    return getTotalAfterDiscount() + getTaxAmount();
  };

  const getChangeAmount = () => {
    const paid = parseFloat(amountPaid) || 0;
    const total = getFinalTotal();
    return Math.max(0, paid - total);
  };

  // Item management functions
  const handleAddMenuItem = (menuItem) => {
    // Prevent double execution
    if (addingItemRef.current) return;
    addingItemRef.current = true;

    // Close dialog immediately
    setShowAddItemDialog(false);

    setBillItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.name === menuItem.name && item.price === menuItem.price
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          image: menuItem.image,
          fromOrder: false,
        },
      ];
    });

    toast.success(`Added ${menuItem.name}`);

    // Reset the ref after a short delay
    setTimeout(() => {
      addingItemRef.current = false;
    }, 300);
  };

  const handleQuantityChange = (item, change) => {
    setBillItems((prev) =>
      prev
        .map((i) =>
          i.name === item.name && i.price === item.price
            ? { ...i, quantity: Math.max(0, i.quantity + change) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const handleRemoveItem = (item) => {
    setBillItems((prev) =>
      prev.filter((i) => !(i.name === item.name && i.price === item.price))
    );
    toast.success(`Removed ${item.name}`);
  };

  const handleCreateBill = async () => {
    if (orders.length === 0) {
      toast.error("No orders to bill");
      return;
    }

    setProcessing(true);

    try {
      // Update all orders to "completed" status
      const updatePromises = orders.map((order) =>
        fetch(`/api/table-orders/${order._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" }),
        }).then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to update order ${order.orderNumber}`);
          }
          return res.json();
        })
      );

      await Promise.all(updatePromises);

      toast.success(
        `Bill completed! ${orders.length} order(s) marked as completed.`
      );

      // Wait a moment then redirect
      setTimeout(() => {
        router.push("/cashier");
      }, 1000);
    } catch (error) {
      console.error("Bill completion error:", error);
      toast.error(`Failed to complete bill: ${error.message}`);
      setProcessing(false);
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/cashier")}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">Billing</h1>
                <p className="text-sm text-orange-100">Table {tableNumber}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/cashier/new-bill")}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Bill
              </Button>
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
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Bill Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Bill Items Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6" />
                    Bill Items
                  </CardTitle>
                  <Button
                    onClick={() => setShowAddItemDialog(true)}
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {billItems.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No items in bill
                  </p>
                ) : (
                  <div className="space-y-3">
                    {billItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="w-24 text-right font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveItem(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Original Orders Reference */}
            {orders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Original Orders (Reference)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="text-sm p-3 bg-gray-50 rounded"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              Order #{order.orderNumber}
                            </span>
                            <Badge
                              className={
                                order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.status === "preparing"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "ready"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-purple-100 text-purple-800"
                              }
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setCancelDialog({
                                open: true,
                                orderId: order._id,
                              })
                            }
                            className="h-6 w-6 text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx}>
                              {item.quantity}x {item.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Billing Details */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Billing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="customerName" className="text-sm">
                      Customer Name
                    </Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="customerName"
                        placeholder="Enter name (optional)"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="customerPhone" className="text-sm">
                      Phone Number
                    </Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="customerPhone"
                        placeholder="Enter phone (optional)"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Discount */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Discount</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={discountType}
                      onValueChange={setDiscountType}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Percentage">%</SelectItem>
                        <SelectItem value="Fixed">$</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="0"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                {/* Tax */}
                <div className="space-y-2">
                  <Label htmlFor="tax" className="text-sm font-semibold">
                    Tax (%)
                  </Label>
                  <Input
                    id="tax"
                    type="number"
                    placeholder="0"
                    value={taxValue}
                    onChange={(e) => setTaxValue(e.target.value)}
                    min="0"
                  />
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      ${getSubTotal().toFixed(2)}
                    </span>
                  </div>
                  {getDiscountAmount() > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount:</span>
                      <span>-${getDiscountAmount().toFixed(2)}</span>
                    </div>
                  )}
                  {getTaxAmount() > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Tax:</span>
                      <span>+${getTaxAmount().toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-orange-600">
                      ${getFinalTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Payment */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="paymentMethod" className="text-sm">
                      Payment Method
                    </Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amountPaid" className="text-sm">
                      Amount Paid
                    </Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="amountPaid"
                        type="number"
                        placeholder={getFinalTotal().toFixed(2)}
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        className="pl-10"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  {amountPaid && parseFloat(amountPaid) >= getFinalTotal() && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">
                          Change:
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          ${getChangeAmount().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    onClick={handleCreateBill}
                    disabled={processing || orders.length === 0}
                    size="lg"
                  >
                    <Receipt className="mr-2 h-5 w-5" />
                    {processing ? "Processing..." : "Complete Bill"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.print()}
                    disabled={orders.length === 0}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Bill
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Item Dialog */}
      <AlertDialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Add Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Select an item from the menu to add to the bill
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-4">
            {menuItems.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-8">
                No menu items available
              </p>
            ) : (
              menuItems.map((item) => (
                <button
                  key={item._id}
                  onClick={() => handleAddMenuItem(item)}
                  className="p-3 border rounded-lg hover:bg-orange-50 hover:border-orange-500 transition-colors text-left"
                >
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    ${item.price.toFixed(2)}
                  </p>
                </button>
              ))
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Order Dialog */}
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

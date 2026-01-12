"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Search,
  X,
  LogOut,
  Menu as MenuIcon,
  PlusCircle,
  Layers,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import BillDetailsModal from "@/components/BillDetailsModal";

export default function POSPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Data
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategorySidebarOpen, setIsCategorySidebarOpen] = useState(false);
  const [isMobileBillOpen, setIsMobileBillOpen] = useState(false);
  const [lastAddedProductId, setLastAddedProductId] = useState(null);

  // Manage Orders Modal State
  const [showTableSelectModal, setShowTableSelectModal] = useState(false);
  const [showOrderSelectModal, setShowOrderSelectModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // Bill State
  const [currentBill, setCurrentBill] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [taxValue, setTaxValue] = useState(0);
  const [amountPaid, setAmountPaid] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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
      fetchData();
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [menuRes, ordersRes, tablesRes] = await Promise.all([
        fetch("/api/menu"),
        fetch("/api/table-orders"),
        fetch("/api/tables"),
      ]);

      const menuData = await menuRes.json();
      const ordersData = await ordersRes.json();
      const tablesData = await tablesRes.json();

      if (menuRes.ok && menuData.success) {
        setCategories(menuData.data || []);
        const allItems = [];
        menuData.data.forEach((category) => {
          if (category.menuItems && category.menuItems.length > 0) {
            allItems.push(
              ...category.menuItems.map((item) => ({
                ...item,
                categoryId: category._id,
                categoryName: category.name,
              }))
            );
          }
        });
        setMenuItems(allItems);
      }

      if (ordersRes.ok) {
        const activeOrders =
          ordersData.orders?.filter(
            (order) =>
              order.status !== "completed" && order.status !== "cancelled"
          ) || [];
        setOrders(activeOrders);
      }

      if (tablesRes.ok) {
        setTables(tablesData.tables || []);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.categoryId === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Add item to bill
  const handleProductClick = useCallback((item) => {
    setCurrentBill((prev) => {
      const existingIndex = prev.findIndex((i) => i._id === item._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.image,
        },
      ];
    });
    setLastAddedProductId(item._id);
    setTimeout(() => setLastAddedProductId(null), 300);
  }, []);

  // Update quantity
  const handleQuantityChange = useCallback((itemId, change) => {
    setCurrentBill((prev) =>
      prev
        .map((item) =>
          item._id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  // Remove item
  const handleRemoveItem = useCallback((itemId) => {
    setCurrentBill((prev) => prev.filter((item) => item._id !== itemId));
  }, []);

  // Calculations
  const billTotals = useMemo(() => {
    const subTotal = currentBill.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discountAmount =
      discountType === "Percentage"
        ? (subTotal * (parseFloat(discountValue) || 0)) / 100
        : parseFloat(discountValue) || 0;
    const totalAfterDiscount = subTotal - discountAmount;
    const taxAmount = (totalAfterDiscount * (parseFloat(taxValue) || 0)) / 100;
    const finalTotal = totalAfterDiscount + taxAmount;
    const paid = parseFloat(amountPaid) || 0;
    const unpaid = Math.max(0, finalTotal - paid);

    return {
      subTotal,
      discountAmount,
      totalAfterDiscount,
      taxAmount,
      finalTotal,
      unpaid,
    };
  }, [currentBill, discountType, discountValue, taxValue, amountPaid]);

  // Reset bill
  const handleResetBill = useCallback(() => {
    setCurrentBill([]);
    setCustomerName("");
    setCustomerPhone("");
    setDiscountType("Percentage");
    setDiscountValue(0);
    setTaxValue(0);
    setAmountPaid("");
    toast.info("New bill started");
  }, []);

  // Complete Bill
  const handleCreateBill = useCallback(async () => {
    if (currentBill.length === 0) {
      toast.error("No items in bill");
      return;
    }

    setIsProcessing(true);

    try {
      // Calculate bill totals
      const subtotal = billTotals.subTotal;
      const discountAmount = billTotals.discountAmount;
      const taxAmount = billTotals.taxAmount;
      const total = billTotals.finalTotal;
      const paid = parseFloat(amountPaid) || 0;
      const unpaid = billTotals.unpaid;

      // Prepare bill data
      const billData = {
        items: currentBill.map((item) => ({
          menuId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        customerName: customerName.trim() || null,
        customerPhone: customerPhone.trim() || null,
        subtotal,
        discount: {
          type: discountType,
          value: parseFloat(discountValue) || 0,
          amount: discountAmount,
        },
        tax: taxAmount,
        total,
        amountPaid: paid,
        unpaid,
        paymentMethod: "Cash",
        createdBy: session?.user?.email || "cashier",
        createdByName: session?.user?.name || session?.user?.email || "Cashier",
      };

      // Create bill
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Bill #${data.data.billNumber} created successfully!`);
        setSelectedBill(data.data); // Show the created bill
        handleResetBill();
        fetchData();
      } else {
        toast.error(data.error || "Failed to create bill");
      }
    } catch (error) {
      toast.error("Failed to create bill");
    } finally {
      setIsProcessing(false);
    }
  }, [
    currentBill,
    billTotals,
    customerName,
    customerPhone,
    discountType,
    discountValue,
    amountPaid,
    session,
    handleResetBill,
  ]);

  // Manage Orders Handlers
  const handleManageOrders = () => {
    setShowTableSelectModal(true);
  };

  const handleTableSelect = (tableNumber) => {
    setSelectedTable(tableNumber);
    setShowTableSelectModal(false);
    setShowOrderSelectModal(true);
  };

  const handleBackToTables = () => {
    setShowOrderSelectModal(false);
    setShowTableSelectModal(true);
    setSelectedOrderIds([]);
  };

  const handleOrderToggle = (orderId) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleCompleteSelected = async () => {
    if (selectedOrderIds.length === 0) {
      toast.error("No orders selected");
      return;
    }

    const count = selectedOrderIds.length;

    // Remove completed orders from UI immediately (optimistic update)
    setOrders((prev) =>
      prev.filter((order) => !selectedOrderIds.includes(order._id))
    );

    // Close modal immediately
    toast.success(`Completed ${count} order(s)`);
    setShowOrderSelectModal(false);
    setSelectedOrderIds([]);
    setSelectedTable(null);

    // Update server in background
    try {
      const updatePromises = selectedOrderIds.map((orderId) =>
        fetch(`/api/table-orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" }),
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Failed to complete orders:", error);
      // Optionally refresh data to sync state
      fetchData();
    }
  };

  const handleAddAndComplete = async () => {
    if (selectedOrderIds.length === 0) {
      toast.error("No orders selected");
      return;
    }

    const ordersToAdd = orders.filter((o) => selectedOrderIds.includes(o._id));

    // Collect all items first
    const itemsToAdd = [];
    ordersToAdd.forEach((order) => {
      order.items.forEach((item) => {
        itemsToAdd.push({
          _id: item.menuId || item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          isFromOrder: true,
        });
      });
    });

    // Update bill immediately (optimistic update)
    setCurrentBill((prev) => {
      const newBill = [...prev];
      itemsToAdd.forEach((item) => {
        const existingIndex = newBill.findIndex(
          (i) => i.name === item.name && i.price === item.price
        );
        if (existingIndex > -1) {
          newBill[existingIndex].quantity += item.quantity;
        } else {
          newBill.push(item);
        }
      });
      return newBill;
    });

    // Remove completed orders from UI immediately (optimistic update)
    setOrders((prev) =>
      prev.filter((order) => !selectedOrderIds.includes(order._id))
    );

    // Close modal immediately
    toast.success(`Added ${ordersToAdd.length} order(s) to bill`);
    setShowOrderSelectModal(false);
    setSelectedOrderIds([]);
    setSelectedTable(null);

    // Update server in background (fire and forget)
    try {
      const updatePromises = selectedOrderIds.map((orderId) =>
        fetch(`/api/table-orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" }),
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      // Silently fail or show a subtle notification
      console.error("Failed to update orders:", error);
      // Optionally refresh data to sync state
      fetchData();
    }
  };

  // Get orders for selected table
  const ordersForSelectedTable = selectedTable
    ? orders.filter((order) => order.tableNumber === selectedTable)
    : [];

  // Get tables with orders
  const tablesWithOrders = tables.filter((table) =>
    orders.some((order) => order.tableNumber === table.tableNumber)
  );

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
    <div className="flex flex-col h-screen bg-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between px-4 bg-slate-800 text-white h-[60px] shrink-0 shadow-md z-30">
        <div className="text-xl font-bold tracking-wider uppercase">POS</div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            onClick={handleResetBill}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Bill
          </Button>
          <Button
            onClick={handleManageOrders}
            className="bg-sky-600 hover:bg-sky-700"
          >
            <Layers className="mr-2 h-4 w-4" />
            Manage Orders
          </Button>
          <Button
            onClick={() => signOut({ callbackUrl: "/login" })}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-red-600"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            variant="ghost"
            size="icon"
            className="text-white"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 bg-opacity-50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="md:hidden absolute top-[60px] left-0 right-0 bg-slate-800 border-t border-slate-700 shadow-lg p-4 space-y-3 z-40">
            <Button
              onClick={() => {
                handleResetBill();
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              New Bill
            </Button>
            <Button
              onClick={() => {
                handleManageOrders();
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-sky-600 hover:bg-sky-700"
            >
              <Layers className="mr-2 h-5 w-5" />
              Manage Orders
            </Button>
            <hr className="border-slate-600" />
            <Button
              onClick={() => signOut({ callbackUrl: "/login" })}
              variant="ghost"
              className="w-full text-red-400 hover:bg-red-600/20"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </>
      )}

      <main className="flex flex-1 overflow-hidden">
        {/* Category Sidebar Toggle (Mobile) */}
        <div className="md:hidden fixed top-[68px] left-2 z-20">
          <Button
            onClick={() => setIsCategorySidebarOpen(!isCategorySidebarOpen)}
            size="icon"
            className="bg-slate-800 text-white rounded-full shadow-lg"
          >
            {isCategorySidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Category Sidebar Overlay (Mobile) */}
        {isCategorySidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setIsCategorySidebarOpen(false)}
          ></div>
        )}

        {/* Category Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full w-56 bg-slate-700 text-white transform transition-transform duration-300 ease-in-out z-20 md:relative md:translate-x-0 ${
            isCategorySidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-2 space-y-1 mt-16 md:mt-0">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setIsCategorySidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-sky-600 text-white"
                  : "text-slate-200 hover:bg-slate-600"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => {
                  setSelectedCategory(cat._id);
                  setIsCategorySidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === cat._id
                    ? "bg-sky-600 text-white"
                    : "text-slate-200 hover:bg-slate-600"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Product Grid Section */}
        <section className="flex-1 p-2 sm:p-4 flex flex-col overflow-hidden bg-slate-200">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-6 pl-5 pr-14 text-base sm:text-lg bg-white border-2 border-slate-200 rounded-xl"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-5 text-slate-400 pointer-events-none">
              <Search className="h-6 w-6" />
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto pr-2 pb-4">
            {filteredMenuItems.length > 0 ? (
              filteredMenuItems.map((item) => (
                <button
                  key={item._id}
                  onClick={() => handleProductClick(item)}
                  className={`relative group flex flex-col p-3 border rounded-xl bg-white shadow-sm transition-all duration-200 hover:border-sky-600 hover:shadow-md ${
                    lastAddedProductId === item._id
                      ? "ring-2 ring-green-500"
                      : "border-slate-200"
                  }`}
                >
                  <div className="relative w-full aspect-square bg-slate-100 rounded-lg overflow-hidden mb-2">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-center text-slate-800 truncate mb-1">
                    {item.name}
                  </p>
                  <p className="text-center text-sm font-bold text-sky-600">
                    ₹{item.price.toFixed(2)}
                  </p>
                </button>
              ))
            ) : (
              <div className="col-span-full text-center text-slate-500 mt-8">
                <Search className="h-12 w-12 text-slate-400 mb-2 inline-block" />
                <h3 className="text-xl font-semibold">No Products Found</h3>
                <p className="text-base mt-1">
                  {searchQuery
                    ? `No products match "${searchQuery}"`
                    : "No products in this category"}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Bill Sidebar */}
        <aside className="hidden md:block w-[420px] shrink-0 border-l border-slate-300 bg-white">
          <div className="h-full flex flex-col">
            {/* Bill Header */}
            <header className="flex items-center justify-between p-4 border-b bg-slate-50 shrink-0">
              <h3 className="text-xl font-bold text-slate-800">Current Bill</h3>
            </header>

            {/* Bill Items */}
            <div className="flex-1 p-3 overflow-y-auto">
              {currentBill.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <ShoppingCart className="h-12 w-12 mb-2" />
                  <p className="text-center">Click products to add to bill</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 pb-2 mb-2 border-b font-semibold text-sm text-slate-600">
                    <div className="flex-1">Product</div>
                    <div className="w-24 text-center">Qty</div>
                    <div className="w-20 text-right">Amount</div>
                    <div className="w-8"></div>
                  </div>

                  <div className="space-y-3">
                    {currentBill.map((item) => (
                      <div key={item._id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-700">
                            {item.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            ₹{item.price.toFixed(2)}
                          </p>
                        </div>

                        <div className="w-24 flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleQuantityChange(item._id, -1)}
                            className="p-1 border rounded bg-white hover:bg-slate-50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item._id, 1)}
                            className="p-1 border rounded bg-white hover:bg-slate-50"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <p className="w-20 text-right font-semibold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>

                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="w-8 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bill Footer */}
            {currentBill.length > 0 && (
              <footer className="p-4 border-t bg-slate-50 shrink-0 space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <Input
                    type="text"
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="p-2"
                  />
                  <Input
                    type="tel"
                    placeholder="Customer Phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="p-2"
                  />
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      ₹{billTotals.subTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={discountType}
                      onValueChange={setDiscountType}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Percentage">%</SelectItem>
                        <SelectItem value="Fixed">₹</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Discount"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="flex-1 h-8"
                      min="0"
                    />
                    <span className="text-red-600 w-20 text-right">
                      -₹{billTotals.discountAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-24">Tax %:</span>
                    <Input
                      type="number"
                      placeholder="Tax"
                      value={taxValue}
                      onChange={(e) => setTaxValue(e.target.value)}
                      className="flex-1 h-8"
                      min="0"
                    />
                    <span className="text-green-600 w-20 text-right">
                      +₹{billTotals.taxAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-sky-600">
                      ₹{billTotals.finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-700">
                    Amount Paid
                  </span>
                  <Input
                    type="number"
                    placeholder={billTotals.finalTotal.toFixed(2)}
                    value={amountPaid}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || parseFloat(value) >= 0) {
                        setAmountPaid(value);
                      }
                    }}
                    className="w-1/2 h-8 text-right"
                    min="0"
                  />
                </div>

                {amountPaid && billTotals.unpaid > 0 && (
                  <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-orange-800">
                        Unpaid Amount:
                      </span>
                      <span className="text-lg font-bold text-orange-600">
                        ₹{billTotals.unpaid.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    onClick={() =>
                      setAmountPaid(billTotals.finalTotal.toFixed(2))
                    }
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Settle
                  </Button>
                  <Button
                    onClick={handleCreateBill}
                    disabled={isProcessing || currentBill.length === 0}
                    className="bg-sky-600 hover:bg-sky-700"
                  >
                    {isProcessing ? "Processing..." : "Create Bill"}
                  </Button>
                </div>
              </footer>
            )}
          </div>
        </aside>
      </main>

      {/* Mobile Bill Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-20">
        <button
          onClick={() => setIsMobileBillOpen(true)}
          className="relative flex items-center gap-2 p-4 bg-sky-600 text-white rounded-full shadow-lg hover:bg-sky-700 transition-colors"
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="font-bold">₹{billTotals.finalTotal.toFixed(2)}</span>
          {currentBill.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
              {currentBill.length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Bill Sidebar */}
      {isMobileBillOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileBillOpen(false)}
          ></div>
          <div className="md:hidden fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300">
            <div className="h-full flex flex-col">
              {/* Mobile Bill Header */}
              <header className="flex items-center justify-between p-4 border-b bg-slate-50 shrink-0">
                <h3 className="text-xl font-bold text-slate-800">
                  Current Bill
                </h3>
                <Button
                  onClick={() => setIsMobileBillOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="text-slate-600"
                >
                  <X className="h-6 w-6" />
                </Button>
              </header>

              {/* Mobile Bill Items */}
              <div className="flex-1 p-3 overflow-y-auto">
                {currentBill.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <ShoppingCart className="h-12 w-12 mb-2" />
                    <p className="text-center">Click products to add to bill</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 pb-2 mb-2 border-b font-semibold text-sm text-slate-600">
                      <div className="flex-1">Product</div>
                      <div className="w-24 text-center">Qty</div>
                      <div className="w-20 text-right">Amount</div>
                      <div className="w-8"></div>
                    </div>

                    <div className="space-y-3">
                      {currentBill.map((item) => (
                        <div key={item._id} className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-700">
                              {item.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              ₹{item.price.toFixed(2)}
                            </p>
                          </div>

                          <div className="w-24 flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleQuantityChange(item._id, -1)}
                              className="p-1 border rounded bg-white hover:bg-slate-50"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item._id, 1)}
                              className="p-1 border rounded bg-white hover:bg-slate-50"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <p className="w-20 text-right font-semibold">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>

                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="w-8 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Bill Footer */}
              {currentBill.length > 0 && (
                <footer className="p-4 border-t bg-slate-50 shrink-0 space-y-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <Input
                      type="text"
                      placeholder="Customer Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="p-2"
                    />
                    <Input
                      type="tel"
                      placeholder="Customer Phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="p-2"
                    />
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">
                        ₹{billTotals.subTotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={discountType}
                        onValueChange={setDiscountType}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Percentage">%</SelectItem>
                          <SelectItem value="Fixed">₹</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Discount"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        className="flex-1 h-8"
                        min="0"
                      />
                      <span className="text-red-600 w-20 text-right">
                        -₹{billTotals.discountAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-24">Tax %:</span>
                      <Input
                        type="number"
                        placeholder="Tax"
                        value={taxValue}
                        onChange={(e) => setTaxValue(e.target.value)}
                        className="flex-1 h-8"
                        min="0"
                      />
                      <span className="text-green-600 w-20 text-right">
                        +₹{billTotals.taxAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-sky-600">
                        ₹{billTotals.finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">
                      Amount Paid
                    </span>
                    <Input
                      type="number"
                      placeholder={billTotals.finalTotal.toFixed(2)}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-1/2 h-8 text-right"
                    />
                  </div>

                  {amountPaid && billTotals.unpaid > 0 && (
                    <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-orange-800">
                          Unpaid Amount:
                        </span>
                        <span className="text-lg font-bold text-orange-600">
                          ₹{billTotals.unpaid.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                      onClick={() =>
                        setAmountPaid(billTotals.finalTotal.toFixed(2))
                      }
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Settle
                    </Button>
                    <Button
                      onClick={handleCreateBill}
                      disabled={isProcessing || currentBill.length === 0}
                      className="bg-sky-600 hover:bg-sky-700"
                    >
                      {isProcessing ? "Processing..." : "Create Bill"}
                    </Button>
                  </div>
                </footer>
              )}
            </div>
          </div>
        </>
      )}

      {/* Table Select Modal */}
      <Dialog
        open={showTableSelectModal}
        onOpenChange={setShowTableSelectModal}
      >
        <DialogContent
          className="w-full max-h-[90vh] overflow-y-auto p-0"
          style={{ maxWidth: "min(95vw, 1200px)" }}
        >
          <div className="sticky top-0 bg-white z-10 border-b p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl">Select a Table</DialogTitle>
              <DialogDescription className="text-base">
                Choose a table to view and manage its orders
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-4 sm:p-6">
            {tablesWithOrders.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">
                  No tables with active orders
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {tablesWithOrders.map((table) => {
                  const tableOrders = orders.filter(
                    (order) => order.tableNumber === table.tableNumber
                  );
                  const totalAmount = tableOrders.reduce(
                    (sum, order) => sum + order.totalAmount,
                    0
                  );

                  return (
                    <button
                      key={table._id}
                      onClick={() => handleTableSelect(table.tableNumber)}
                      className="group relative p-4 sm:p-6 border-2 rounded-xl hover:border-sky-500 hover:bg-sky-50 transition-all text-center shadow-sm hover:shadow-md"
                    >
                      <div className="text-3xl sm:text-5xl font-bold mb-2 text-slate-800 group-hover:text-sky-600 transition-colors">
                        {table.tableNumber}
                      </div>
                      <Badge
                        variant="secondary"
                        className="mb-2 text-xs sm:text-sm bg-purple-100 text-purple-700"
                      >
                        {tableOrders.length} Order
                        {tableOrders.length !== 1 ? "s" : ""}
                      </Badge>
                      <p className="text-base sm:text-xl font-bold text-sky-600">
                        ₹{totalAmount.toFixed(2)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowTableSelectModal(false)}
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Select Modal */}
      <Dialog
        open={showOrderSelectModal}
        onOpenChange={setShowOrderSelectModal}
      >
        <DialogContent
          className="w-full max-h-[100vh] overflow-y-auto p-0"
          style={{ maxWidth: "min(95vw, 1400px)" }}
        >
          <div className="sticky top-0 bg-white z-10 border-b p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">
                Orders for Table {selectedTable}
              </DialogTitle>
              <DialogDescription className="mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToTables}
                  className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 -ml-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Tables
                </Button>
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-4 sm:p-6">
            {ordersForSelectedTable.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">
                  No orders found for this table
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {ordersForSelectedTable.map((order) => {
                  const isSelected = selectedOrderIds.includes(order._id);

                  return (
                    <div
                      key={order._id}
                      onClick={() => handleOrderToggle(order._id)}
                      className={`relative p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md ${
                        isSelected
                          ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
                          : "border-slate-200 hover:border-purple-300 hover:bg-purple-50/30"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 left-3 bg-purple-500 text-white rounded-full p-1">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-3">
                        <div className={isSelected ? "ml-8" : ""}>
                          <p className="text-xs  text-slate-500 font-medium">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {order.customerName && (
                            <p className="text-xl sm:text-xl text-slate-700 font-semibold mt-1">
                              {order.customerName}
                            </p>
                          )}
                        </div>
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
                          IN KITCHEN
                        </Badge>
                      </div>

                      <div className="text-xl sm:text-xl font-bold text-black mb-3">
                        ₹{order.totalAmount.toFixed(2)}
                      </div>

                      <div className="text-sm text-slate-700 space-y-1.5 bg-white/50 rounded-lg p-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center"
                          >
                            <span className="font-medium">
                              {item.name} × {item.quantity}
                            </span>
                            <span className="text-slate-500 ml-2"></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setShowOrderSelectModal(false)}
                className="order-2 sm:order-1"
              >
                Cancel
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
                <Button
                  onClick={handleCompleteSelected}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  disabled={selectedOrderIds.length === 0}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Complete ({selectedOrderIds.length})
                </Button>
                <Button
                  onClick={handleAddAndComplete}
                  className="bg-sky-600 hover:bg-sky-700 text-white"
                  disabled={selectedOrderIds.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add & Complete ({selectedOrderIds.length})
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bill Details Modal */}
      <BillDetailsModal
        bill={selectedBill}
        onClose={() => setSelectedBill(null)}
      />
    </div>
  );
}

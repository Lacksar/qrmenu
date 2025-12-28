"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Plus, Minus, Trash2, Send, Search } from "lucide-react";

export default function TableMenuPage() {
  const params = useParams();
  const tableNumber = params.table;

  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [customerNotes, setCustomerNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const menuRes = await fetch("/api/menu");
      const menuData = await menuRes.json();

      if (menuRes.ok && menuData.success && menuData.data) {
        // Extract categories (only those with items)
        const categoriesData = menuData.data
          .filter((cat) => cat.menuItems && cat.menuItems.length > 0)
          .map((cat) => ({
            _id: cat._id,
            name: cat.name,
            image: cat.image,
          }));
        setCategories(categoriesData);

        // Flatten menu items from all categories (only available items)
        const allMenuItems = menuData.data.flatMap((cat) =>
          cat.menuItems
            .filter((item) => item.available !== false)
            .map((item) => ({
              ...item,
              category: cat.name,
            }))
        );
        setMenu(allMenuItems);
      } else {
        toast.error("Failed to load menu");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem._id === item._id);

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (itemId, change) => {
    setCart(
      cart
        .map((item) =>
          item._id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item._id !== itemId));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        tableNumber,
        items: cart.map((item) => ({
          menuId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        totalAmount: getTotalAmount(),
        customerNotes,
      };

      const res = await fetch("/api/table-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Order placed successfully!");
        setCart([]);
        setCustomerNotes("");
        setShowCart(false);
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch (error) {
      toast.error("Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMenu =
    selectedCategory === "all"
      ? menu
      : menu.filter((item) => item.category === selectedCategory);

  // Apply search filter
  const searchedMenu = searchQuery
    ? filteredMenu.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : filteredMenu;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Menu</h1>
              <p className="text-sm text-gray-600">Table: {tableNumber}</p>
            </div>
            <Button
              onClick={() => setShowCart(true)}
              className="relative"
              size="lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Cart
              {cart.length > 0 && (
                <Badge className="ml-2 bg-red-500">{cart.length}</Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="container mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category._id}
              variant={
                selectedCategory === category.name ? "default" : "outline"
              }
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 pb-20">
        {searchQuery && (
          <p className="text-sm text-gray-600 mb-4">
            {searchedMenu.length} result{searchedMenu.length !== 1 ? "s" : ""}{" "}
            found for "{searchQuery}"
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {searchedMenu.map((item) => (
            <Card key={item._id} className="overflow-hidden">
              {item.image ? (
                <div className="aspect-square relative overflow-hidden bg-gray-200">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="aspect-square relative overflow-hidden bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">No Image</p>
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {item.description}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-black">
                    ${item.price.toFixed(2)}
                  </span>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button onClick={() => addToCart(item)} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {searchedMenu.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery
                ? `No items found matching "${searchQuery}"`
                : "No items found in this category"}
            </p>
          </div>
        )}
      </div>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="relative">
            <button
              onClick={() => setShowCart(false)}
              className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <DialogTitle className="text-xl sm:text-2xl">
              Your Order
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Table {tableNumber} - Review and submit your order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Your cart is empty
              </p>
            ) : (
              <>
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-2 sm:gap-4 p-3 sm:p-4 border rounded-lg"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        ${item.price.toFixed(2)} each
                      </p>
                      <div className="flex items-center gap-1 sm:gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item._id, -1)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 sm:w-8 text-center text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item._id, 1)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item._id)}
                          className="ml-auto h-7 w-7 sm:h-8 sm:w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-sm sm:text-base">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-3 sm:pt-4">
                  <Label
                    htmlFor="customerNotes"
                    className="text-sm sm:text-base"
                  >
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="customerNotes"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Any special requests or dietary requirements?"
                    rows={3}
                    className="mt-2 text-sm sm:text-base"
                  />
                </div>

                <div className="border-t pt-3 sm:pt-4">
                  <div className="flex justify-between items-center text-lg sm:text-xl font-bold">
                    <span>Total:</span>
                    <span>${getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              onClick={handleSubmitOrder}
              disabled={cart.length === 0 || submitting}
              className="w-full h-11 sm:h-10 text-base sm:text-sm"
              size="lg"
            >
              <Send className="mr-2 h-4 w-4" />
              {submitting ? "Placing Order..." : "Place Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

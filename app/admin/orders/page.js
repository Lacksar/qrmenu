"use client";
import { useEffect, useState, useRef, useCallback } from "react";
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
import { Package, Clock, Search, CheckCircle } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [orderTypeFilter, setOrderTypeFilter] = useState("All"); // New state for order type filter
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ordersPerPage = 10;
  const router = useRouter();
  const observer = useRef();

  const fetchOrders = useCallback(
    async (page, tab, search, orderType) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/orders?page=${page}&limit=${ordersPerPage}&status=${tab}&search=${search}&orderType=${orderType}`
        );
        if (!response.ok) throw new Error("Failed to fetch orders");
        const result = await response.json();
        if (result.success) {
          setOrders((prevOrders) => {
            const newOrders =
              page === 1 ? result.data : [...prevOrders, ...result.data];
            // De-duplicate in case of overlapping fetches
            return Array.from(
              new Map(newOrders.map((order) => [order._id, order])).values()
            );
          });
          setHasMore(result.data.length > 0);
        } else {
          throw new Error(result.error || "Failed to fetch orders");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [ordersPerPage]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Effect for re-fetching when filters change
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchOrders(1, activeTab, debouncedSearchTerm, orderTypeFilter);
  }, [activeTab, debouncedSearchTerm, orderTypeFilter, fetchOrders]);

  // Effect for fetching subsequent pages (infinite scroll)
  useEffect(() => {
    if (currentPage > 1) {
      fetchOrders(currentPage, activeTab, debouncedSearchTerm, orderTypeFilter);
    }
  }, [
    currentPage,
    activeTab,
    debouncedSearchTerm,
    orderTypeFilter,
    fetchOrders,
  ]);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoadingSummary(true);
      try {
        const response = await fetch("/api/orders/summary");
        if (!response.ok) throw new Error("Failed to fetch summary");
        const result = await response.json();
        if (result.success) {
          setSummary(result.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchSummary();
  }, []);

  const lastOrderElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

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

  const capitalize = (str) => {
    if (typeof str !== "string" || !str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-2xl font-bold">{summary.totalOrders}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-2xl font-bold">{summary.pendingOrders}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Delivered Orders
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-2xl font-bold">
                {summary.deliveredOrders}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>A list of all the orders.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by customer..."
                className="pl-8 sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mt-4">
            <p className="text-sm font-medium text-muted-foreground">Type:</p>
            {["All", "Pickup", "homedelivery"].map((type) => (
              <Button
                key={type}
                size="sm"
                variant={orderTypeFilter === type ? "default" : "outline"}
                onClick={() => {
                  setOrderTypeFilter(type);
                  setCurrentPage(1);
                }}
              >
                {type === "homedelivery" ? "Home Delivery" : type}
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-3 pt-2  pb-6 mt-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                Status:
              </p>
              {["All", "Pending", "Confirmed", "Delivered", "Cancelled"].map(
                (tab) => (
                  <Button
                    key={tab}
                    size="sm"
                    variant={activeTab === tab ? "default" : "outline"}
                    onClick={() => {
                      setActiveTab(tab);
                      setCurrentPage(1);
                    }}
                  >
                    {tab}
                  </Button>
                )
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Outlet</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && orders.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              ) : orders.length > 0 ? (
                orders.map((order, index) => (
                  <TableRow
                    ref={
                      orders.length === index + 1 ? lastOrderElementRef : null
                    }
                    key={order._id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/admin/orders/${order._id}`)}
                  >
                    <TableCell className="font-medium">
                      {order._id.slice(0, 6)}...
                    </TableCell>
                    <TableCell>{`${order.firstName} ${order.lastName}`}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>
                        {capitalize(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.orderType === "pickup" ? (
                        <div>
                          <p className="font-medium">
                            {order.paymentMethod === "online"
                              ? "Paid Pickup"
                              : "Payment on Pickup"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.pickupDate).toLocaleDateString()} at{" "}
                            {order.pickupTime}
                          </p>
                        </div>
                      ) : (
                        <p className="font-medium">Home Delivery</p>
                      )}
                    </TableCell>
                    <TableCell>{order.outlet}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{order.menu?.length || 0}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ${(order.totalAmount || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="7" className="text-center">
                    No orders found.
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

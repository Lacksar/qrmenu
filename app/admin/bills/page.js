"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, DollarSign, User, Search, Eye } from "lucide-react";
import BillDetailsModal from "@/components/BillDetailsModal";

export default function AdminBillsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [bills, setBills] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalBills, setTotalBills] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [selectedBill, setSelectedBill] = useState(null);

  const observerTarget = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session && !session.user.isAdmin) {
      router.push("/");
      toast.error("Access denied");
    }
  }, [session, status, router]);

  const fetchBills = useCallback(
    async (pageNum) => {
      if (loading) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/bills?page=${pageNum}&limit=10`);
        const data = await res.json();

        if (res.ok && data.success) {
          setBills((prev) => {
            const existingIds = new Set(prev.map((b) => b._id));
            const newBills = data.data.filter((b) => !existingIds.has(b._id));
            return [...prev, ...newBills];
          });
          setHasMore(data.pagination.hasMore);
          setTotalBills(data.pagination.total);

          // Calculate total revenue from all loaded bills
          const revenue = [...bills, ...data.data].reduce(
            (sum, bill) => sum + bill.total,
            0
          );
          setTotalRevenue(revenue);
        } else {
          toast.error("Failed to fetch bills");
        }
      } catch (error) {
        toast.error("Failed to fetch bills");
      } finally {
        setLoading(false);
      }
    },
    [loading, bills]
  );

  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchBills(page);
    }
  }, [page, session]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading]);

  const filteredBills = bills.filter((bill) => {
    if (!searchTerm) return true;
    const query = searchTerm.toLowerCase();
    return (
      bill.billNumber.toString().includes(query) ||
      bill.customerName?.toLowerCase().includes(query) ||
      bill.customerPhone?.includes(query)
    );
  });

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBills}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Bill Value
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹
              {totalBills > 0 ? (totalRevenue / totalBills).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by bill #, customer name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && bills.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 10 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredBills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <Receipt className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm ? "No bills found" : "No bills yet"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBills.map((bill) => (
                    <TableRow key={bill._id}>
                      <TableCell className="font-medium">
                        #{bill.billNumber}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(bill.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(bill.createdAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {bill.customerName || bill.customerPhone ? (
                          <div className="text-sm">
                            {bill.customerName && (
                              <div>{bill.customerName}</div>
                            )}
                            {bill.customerPhone && (
                              <div className="text-xs text-muted-foreground">
                                {bill.customerPhone}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {bill.items.length} item
                          {bill.items.length !== 1 ? "s" : ""}
                        </div>
                      </TableCell>
                      <TableCell>₹{bill.subtotal.toFixed(2)}</TableCell>
                      <TableCell>
                        {bill.discount.amount > 0 ? (
                          <span className="text-red-600">
                            -₹{bill.discount.amount.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {bill.tax > 0 ? (
                          <span className="text-green-600">
                            +₹{bill.tax.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-bold">
                        ₹{bill.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{bill.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {bill.createdByName || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBill(bill)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {loading && bills.length > 0 && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Loading more bills...
              </p>
            </div>
          )}

          <div ref={observerTarget} className="h-10" />

          {!hasMore && bills.length > 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No more bills to load
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bill Details Modal */}
      <BillDetailsModal
        bill={selectedBill}
        onClose={() => setSelectedBill(null)}
      />
    </div>
  );
}

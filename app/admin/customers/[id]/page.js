"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Phone,
  User,
  CreditCard,
  Receipt,
  Calendar,
  DollarSign,
  Eye,
} from "lucide-react";
import BillDetailsModal from "@/components/BillDetailsModal";

export default function CustomerDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const customerId = params.id;

  const [customer, setCustomer] = useState(null);
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session && !session.user.isAdmin) {
      router.push("/");
      toast.error("Access denied");
    } else if (session) {
      fetchCustomerData();
    }
  }, [session, status, router, customerId]);

  const fetchCustomerData = async () => {
    try {
      const [customerRes, paymentsRes] = await Promise.all([
        fetch(`/api/customers/${customerId}`),
        fetch(`/api/due-payments?customerId=${customerId}`),
      ]);

      const customerData = await customerRes.json();
      const paymentsData = await paymentsRes.json();

      if (customerRes.ok && customerData.success) {
        setCustomer(customerData.customer);

        // Fetch bills for this customer
        const billsRes = await fetch("/api/bills");
        const billsData = await billsRes.json();

        if (billsRes.ok && billsData.success) {
          const customerBills = billsData.data.filter(
            (bill) => bill.customerId === customerId
          );
          setBills(customerBills);
        }
      }

      if (paymentsRes.ok && paymentsData.success) {
        setPayments(paymentsData.payments || []);
      }
    } catch (error) {
      toast.error("Failed to fetch customer data");
    } finally {
      setLoading(false);
    }
  };

  const handlePayDue = async () => {
    const amount = parseFloat(paymentAmount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > customer.dueAmount) {
      toast.error("Payment amount cannot exceed due amount");
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch("/api/due-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer._id,
          customerName: customer.name,
          customerPhone: customer.phone,
          amount,
          paymentMethod,
          notes: paymentNotes,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Payment recorded successfully");
        setShowPaymentModal(false);
        setPaymentAmount("");
        setPaymentNotes("");
        fetchCustomerData();
      } else {
        toast.error(data.error || "Failed to record payment");
      }
    } catch (error) {
      toast.error("Failed to record payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-xl mb-4">Customer not found</div>
        <Button onClick={() => router.push("/admin/customers")}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <Button
          onClick={() => router.push("/admin/customers")}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Customer Details</h1>
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{customer.name}</h2>
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {customer.phone}
                    </div>
                  )}
                  {!customer.phone && (
                    <div className="text-sm text-muted-foreground">
                      No phone number
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4" />
                  Customer since:{" "}
                  {new Date(customer.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <Card className="border-2 border-destructive/20 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="text-sm text-destructive font-medium mb-1">
                    Total Due Amount
                  </div>
                  <div className="text-4xl font-bold text-destructive mb-4">
                    ₹{customer.dueAmount.toFixed(2)}
                  </div>
                  {customer.dueAmount > 0 && (
                    <Button
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Pay Due
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Payments
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalPaid.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bills Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Bills
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Unpaid</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">No bills found</div>
                  </TableCell>
                </TableRow>
              ) : (
                bills.map((bill) => (
                  <TableRow key={bill._id}>
                    <TableCell className="font-medium">
                      B-{bill.billNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(bill.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{bill.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">
                        ₹{bill.amountPaid.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={bill.unpaid > 0 ? "destructive" : "secondary"}
                      >
                        ₹{bill.unpaid.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        onClick={() => setSelectedBill(bill)}
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment History Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Received By</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No payments recorded
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge>₹{payment.amount.toFixed(2)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.receivedByName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {customer.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Due Amount
              </label>
              <div className="text-2xl font-bold text-destructive">
                ₹{customer.dueAmount.toFixed(2)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Payment Amount *
              </label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || parseFloat(value) >= 0) {
                    setPaymentAmount(value);
                  }
                }}
                min="0"
                max={customer.dueAmount}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Payment Method
              </label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
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
              <label className="text-sm font-medium mb-2 block">
                Notes (Optional)
              </label>
              <Input
                type="text"
                placeholder="Add notes..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayDue}
              className="flex-1"
              disabled={isProcessing || !paymentAmount}
            >
              {isProcessing ? "Processing..." : "Record Payment"}
            </Button>
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

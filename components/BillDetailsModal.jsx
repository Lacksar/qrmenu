"use client";

import { X, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BillDetailsModal({ bill, onClose }) {
  if (!bill) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Bill Details</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Restaurant Info */}
        <div className="p-4 text-center border-b bg-slate-50">
          <h3 className="text-lg font-bold">MERO KAMAAL CAFE</h3>
          <p className="text-sm text-muted-foreground">
            Your Restaurant Location
          </p>
        </div>

        {/* Bill Info */}
        <div className="p-4 border-b">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Bill #:</span>
              <span className="ml-2 font-medium">B-{bill.billNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground">Customer:</span>
              <span className="ml-2 font-medium">
                {bill.customerName || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span>
              <span className="ml-2 font-medium">
                {new Date(bill.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-4 border-b">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-muted-foreground font-medium">
                  Item
                </th>
                <th className="text-center py-2 text-muted-foreground font-medium">
                  Qty
                </th>
                <th className="text-right py-2 text-muted-foreground font-medium">
                  Price
                </th>
                <th className="text-right py-2 text-muted-foreground font-medium">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2">{item.name}</td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-right py-2">₹{item.price.toFixed(2)}</td>
                  <td className="text-right py-2 font-medium">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">₹{bill.subtotal.toFixed(2)}</span>
          </div>
          {bill.discount.amount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>
                Discount ({bill.discount.value}
                {bill.discount.type === "Percentage" ? "%" : "₹"})
              </span>
              <span>-₹{bill.discount.amount.toFixed(2)}</span>
            </div>
          )}
          {bill.tax > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Tax</span>
              <span>+₹{bill.tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold pt-2 border-t">
            <span>TOTAL</span>
            <span>₹{bill.total.toFixed(2)}</span>
          </div>
          {bill.unpaid > 0 && (
            <div className="flex justify-between text-base pt-2 border-t">
              <span className="text-orange-600 font-semibold">Unpaid</span>
              <span className="text-orange-600 font-bold">
                ₹{bill.unpaid.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="px-4 pb-4 text-center">
          <Badge
            className={`px-4 py-1.5 text-sm font-bold ${
              bill.unpaid > 0
                ? "bg-orange-100 text-orange-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {bill.unpaid > 0 ? "PARTIALLY PAID" : "PAID"}
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">Thank you!</p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t space-y-2">
          <Button onClick={() => window.print()} className="w-full" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print Bill
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

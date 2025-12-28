"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ProductForm from "./ProductForm";

export default function ProductModal({
  isOpen,
  onOpenChange,
  product,
  onSave,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to {product ? "update the" : "add a new"}{" "}
            product.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ProductForm
            product={product}
            onSave={(savedProduct) => {
              onSave(savedProduct);
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

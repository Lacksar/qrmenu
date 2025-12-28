"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CategoryForm from "./CategoryForm";

export default function CategoryModal({
  category,
  onSave,
  isOpen,
  onOpenChange,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Update the details of your category."
              : "Fill in the details to add a new category."}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm category={category} onSave={onSave} />
      </DialogContent>
    </Dialog>
  );
}

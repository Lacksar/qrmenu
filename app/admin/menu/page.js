"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import FallbackImage from "@/components/ui/FallbackImage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteConfirmationDialog from "@/components/admin/DeleteConfirmationDialog";
import ProductModal from "@/components/admin/ProductModal";
import { Switch } from "@/components/ui/switch";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useSWR("/api/categories", fetcher);
  const categories = categoriesData?.data || [];

  const url = `/api/products?search=${debouncedSearchQuery}&category=${selectedCategory}`;
  const {
    data: productsData,
    error,
    isLoading,
    mutate,
  } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 minutes
  });

  const products = productsData?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    toast.info("Starting data synchronization...");
    try {
      const res = await fetch("/api/sync");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Sync failed");
      }
      toast.success(data.message);
      mutate();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async (savedProduct) => {
    const isNew = !selectedProduct;
    const optimisticData = isNew
      ? [savedProduct, ...products]
      : products.map((p) => (p._id === savedProduct._id ? savedProduct : p));

    await mutate(
      async () => {
        // No need to return here, SWR will use the optimistic data
      },
      {
        optimisticData: { ...productsData, data: optimisticData },
        rollbackOnError: true,
        populateCache: true,
        revalidate: false, // We will manually revalidate after the API call
      }
    );

    toast.success(`Product ${isNew ? "added" : "updated"} successfully`);
    setSelectedProduct(null);
    // Optionally, trigger a revalidation to get the latest server state
    mutate();
  };

  const openModal = (product = null) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    const originalProducts = [...products];
    const optimisticData = products.filter(
      (p) => p._id !== productToDelete._id
    );

    // Immediately update the UI
    await mutate({ ...productsData, data: optimisticData }, false);
    setIsDeleteDialogOpen(false);

    try {
      const res = await fetch(`/api/products/${productToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete product");
      }
      toast.success("Product deleted successfully");
      // Revalidate to ensure data is consistent
      mutate();
    } catch (err) {
      // Rollback on error
      await mutate({ ...productsData, data: originalProducts }, false);
      toast.error(err.message);
    } finally {
      setProductToDelete(null);
    }
  };

  const handleToggle = async (id, field) => {
    const optimisticData = products.map((p) =>
      p._id === id ? { ...p, [field]: !p[field] } : p
    );

    await mutate({ ...productsData, data: optimisticData }, false);

    try {
      const res = await fetch(`/api/menu/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to update ${field} status`);
      }
      toast.success(`Product ${field} status updated`);
      // Revalidate to get the latest state from the server
      mutate();
    } catch (err) {
      // Rollback on error by revalidating
      toast.error(err.message);
      mutate();
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <div>
          <Button onClick={handleSync} disabled={isSyncing} className="mr-2">
            {isSyncing ? "Syncing..." : "Sync Data"}
          </Button>
          <Button onClick={() => openModal()}>Add New Product</Button>
        </div>
      </div>

      <div className="flex items-center mb-4 gap-4">
        <Input
          placeholder="Search by product name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={selectedCategory}
          onValueChange={(value) =>
            setSelectedCategory(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery("");
            setSelectedCategory("");
          }}
        >
          Clear Filters
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-16 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan="7" className="text-center text-red-500">
                  {error.message}
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <FallbackImage
                      src={product.image}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category?.name || "N/A"}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={product.featured}
                      onCheckedChange={() =>
                        handleToggle(product._id, "featured")
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={product.available}
                      onCheckedChange={() =>
                        handleToggle(product._id, "available")
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(product)}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteDialog(product)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <ProductModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        product={selectedProduct}
        onSave={handleSave}
      />
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        productName={productToDelete?.name}
      />
    </div>
  );
}

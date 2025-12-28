"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import ImageUploadSlot from "@/components/admin/ImageUploadSlot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getDetails() {
  const res = await fetch("/api/details", { cache: "no-store" });
  const data = await res.json();
  if (!res.ok || !data.success) {
    // If it fails because no details exist yet, return a null object
    if (res.status === 404 || !data.data) return null;
    throw new Error(data.error || "Failed to fetch details");
  }
  return data.data;
}

export default function DetailsPage() {
  const [details, setDetails] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    phone: "",
    email: "",
    currency: "NPR",
    deliveryCharge: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [newOutletName, setNewOutletName] = useState("");

  useEffect(() => {
    getDetails()
      .then((data) => {
        if (data) {
          setDetails(data);
          setFormData({
            companyName: data.companyName || "",
            address: data.address || "",
            phone: data.phone || "",
            email: data.email || "",
            currency: data.currency || "NPR",
            deliveryCharge: data.deliveryCharge?.toString() || "",
          });
          setLogoPreview(data.logo || "");
          setOutlets(data.outlets || []);
        }
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (file) => {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let logoUrl = details?.logo || null;

    try {
      if (logoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("imageFile", logoFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          throw new Error(uploadData.message || "Logo upload failed");
        }
        logoUrl = uploadData.publicPath;
      }

      const submissionData = { ...formData, logo: logoUrl, outlets };
      const url = details ? `/api/details/${details._id}` : "/api/details";
      const method = details ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save details");
      }

      const savedData = await res.json();
      setDetails(savedData.data); // Update state with the saved data, including the new _id on first save
      toast.success(`Details ${details ? "updated" : "created"} successfully!`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddOutlet = () => {
    if (newOutletName.trim() !== "") {
      setOutlets([...outlets, { name: newOutletName, online: true }]);
      setNewOutletName("");
    }
  };

  const handleRemoveOutlet = (index) => {
    setOutlets(outlets.filter((_, i) => i !== index));
  };

  const handleOutletOnlineChange = async (index, checked) => {
    const newOutlets = [...outlets];
    const outlet = newOutlets[index];
    const originalStatus = outlet.online;
    newOutlets[index].online = checked;
    setOutlets(newOutlets); // Optimistic UI update

    const action = checked ? "turnon" : "turnoff";
    const outletName = outlet.name;

    try {
      const res = await fetch(`/api/online/${outletName}/${action}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to update outlet status.`);
      }

      toast.success(
        `Outlet ${outletName} is now ${checked ? "online" : "offline"}.`
      );
    } catch (err) {
      // Revert UI on failure
      const revertedOutlets = [...outlets];
      revertedOutlets[index].online = originalStatus;
      setOutlets(revertedOutlets);
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <ImageUploadSlot
                imageUrl={logoPreview}
                isUploading={isSubmitting}
                onUpload={handleLogoUpload}
                onRemove={handleLogoRemove}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryCharge">Delivery Charge ($)</Label>
                <Input
                  id="deliveryCharge"
                  name="deliveryCharge"
                  type="number"
                  value={formData.deliveryCharge}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-4">
              <Label>Outlets</Label>
              <div className="space-y-2">
                {outlets.map((outlet, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <span>{outlet.name}</span>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={outlet.online}
                        onCheckedChange={(checked) =>
                          handleOutletOnlineChange(index, checked)
                        }
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveOutlet(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={newOutletName}
                  onChange={(e) => setNewOutletName(e.target.value)}
                  placeholder="New outlet name"
                />
                <Button type="button" onClick={handleAddOutlet}>
                  Add Outlet
                </Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Details"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

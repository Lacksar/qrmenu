"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Settings, Lock, User } from "lucide-react";

export default function CashierSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
    }
  }, [session, status, router]);

  if (status === "loading") {
    return null;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Navigation */}
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/cashier")}
                className="flex items-center gap-2 px-3 md:px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium backdrop-blur-sm transition-colors"
              >
                <DollarSign className="h-5 w-5" />
                <span className="hidden md:inline">Cashier</span>
              </button>
              <button className="flex items-center gap-2 px-3 md:px-6 py-3 bg-white/30 text-white rounded-lg font-medium backdrop-blur-sm">
                <Settings className="h-5 w-5" />
                <span className="hidden md:inline">Settings</span>
              </button>
            </div>

            <Button
              onClick={() => signOut({ callbackUrl: "/login" })}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-full">
                <User className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle>{session?.user?.name}</CardTitle>
                <CardDescription className="capitalize">
                  {session?.user?.role}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Settings Options */}
        <div className="space-y-3">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/change-password")}
          >
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Lock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Change Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Update your account password
                  </p>
                </div>
              </div>
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

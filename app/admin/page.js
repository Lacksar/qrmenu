"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const AdminDashboard = () => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session || !session.user.isAdmin) {
    // This is an extra layer of security.
    // The middleware should already handle this.
    redirect("/");
    return null;
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800">Admin Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome back, {session.user.name}!</p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Example Stats Cards */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700">Total Orders</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">1,234</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700">Revenue</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">$12,345</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700">New Customers</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">56</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700">Pending Orders</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">12</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

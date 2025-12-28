"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function WaiterDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session && session.user.role !== "waiter") {
      router.push("/");
      toast.error("Access denied");
    } else if (session) {
      fetchData();
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [ordersRes, reservationsRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/reservations"),
      ]);

      const ordersData = await ordersRes.json();
      const reservationsData = await reservationsRes.json();

      if (ordersRes.ok && ordersData.orders) {
        setOrders(ordersData.orders);
      } else {
        setOrders([]);
      }

      if (reservationsRes.ok && reservationsData.reservations) {
        setReservations(reservationsData.reservations);
      } else {
        setReservations([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch data");
      setOrders([]);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("Order status updated");
        fetchData();
      } else {
        toast.error("Failed to update order");
      }
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Waiter Dashboard</h1>
          <p className="text-gray-600">Welcome, {session?.user?.name}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "orders"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Orders ({orders?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("reservations")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "reservations"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Reservations ({reservations?.length || 0})
          </button>
          <button
            onClick={() => router.push("/waiter/tables")}
            className="px-4 py-2 font-semibold text-gray-600 hover:text-blue-600"
          >
            Manage Tables
          </button>
        </div>
      </div>

      {activeTab === "orders" && (
        <div className="grid gap-4">
          {!orders || orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No orders</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      Order #{order.deliveryCode}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {order.firstName} {order.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.phone} | {order.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      Type: {order.orderType}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "confirmed"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Items:</h4>
                  <ul className="space-y-1">
                    {order.menu.map((item, idx) => (
                      <li key={idx}>
                        {item.quantity}x {item.name} - ${item.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <p className="font-semibold mt-2">
                    Total: ${order.totalAmount.toFixed(2)}
                  </p>
                </div>

                {order.status === "delivered" && (
                  <button
                    onClick={() => updateOrderStatus(order._id, "cancelled")}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Complete Order
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "reservations" && (
        <div className="grid gap-4">
          {!reservations || reservations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No reservations</p>
            </div>
          ) : (
            reservations.map((reservation) => (
              <div
                key={reservation._id}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {reservation.firstName} {reservation.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {reservation.phone} | {reservation.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(reservation.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Time: {reservation.time}
                    </p>
                    <p className="text-sm text-gray-600">
                      Guests: {reservation.guests}
                    </p>
                    {reservation.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        Notes: {reservation.notes}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      reservation.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : reservation.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {reservation.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

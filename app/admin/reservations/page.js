"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReservationModal from "@/components/admin/ReservationModal";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [outletFilter, setOutletFilter] = useState("All");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const observer = useRef();

  const fetchReservations = useCallback(async (tab) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reservations`);
      if (!response.ok) throw new Error("Failed to fetch reservations");
      const result = await response.json();
      setReservations(result.reservations);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations(activeTab);
  }, [activeTab, fetchReservations]);

  const filteredReservations = reservations.filter((reservation) => {
    const statusMatch =
      activeTab === "All" ||
      reservation.status.toLowerCase() === activeTab.toLowerCase();
    const outletMatch =
      outletFilter === "All" || reservation.outlet === outletFilter;
    return statusMatch && outletMatch;
  });

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "secondary";
      case "confirmed":
        return "default";
      case "cancelled":
      case "disapproved":
        return "destructive";
      default:
        return "outline";
    }
  };

  const capitalize = (str) => {
    if (typeof str !== "string" || !str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const updateReservationStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      fetchReservations(activeTab);
      toast.success("Reservation status updated!");
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reservations</CardTitle>
              <CardDescription>A list of all the reservations.</CardDescription>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Filter by Outlet:</span>
              {["All", "ENGADINE", "HURSTVILLE"].map((outlet) => (
                <Button
                  key={outlet}
                  variant={outletFilter === outlet ? "default" : "outline"}
                  onClick={() => setOutletFilter(outlet)}
                >
                  {outlet}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Filter by Status:</span>
              {["All", "Pending", "Confirmed", "Cancelled", "Disapproved"].map(
                (tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? "default" : "outline"}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </Button>
                )
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Outlet</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Outlet</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.length > 0 ? (
                  filteredReservations.map((reservation) => (
                    <TableRow key={reservation._id}>
                      <TableCell>{reservation.fullName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{reservation.outlet}</Badge>
                      </TableCell>
                      <TableCell>{reservation.phone}</TableCell>
                      <TableCell>{reservation.email}</TableCell>
                      <TableCell>{reservation.noOfPeople}</TableCell>
                      <TableCell>
                        {new Date(reservation.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{reservation.time}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(reservation.status)}>
                          {capitalize(reservation.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setIsModalOpen(true);
                          }}
                          className="mr-2"
                        >
                          View
                        </Button>
                        {reservation.status === "pending" && (
                          <Button
                            className="mr-2"
                            onClick={() =>
                              updateReservationStatus(
                                reservation._id,
                                "confirmed"
                              )
                            }
                          >
                            Approve
                          </Button>
                        )}
                        {reservation.status === "pending" && (
                          <Button
                            variant="destructive"
                            onClick={() =>
                              updateReservationStatus(
                                reservation._id,
                                "disapproved"
                              )
                            }
                          >
                            Disapprove
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="9" className="text-center">
                      No reservations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ReservationModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        reservation={selectedReservation}
      />
    </div>
  );
}

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ReservationModal({
  isOpen,
  onOpenChange,
  reservation,
}) {
  if (!reservation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reservation Details</DialogTitle>
          <DialogDescription>
            Viewing details for reservation ID: {reservation._id}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <h4 className="font-semibold">Full Name</h4>
            <p>{reservation.fullName}</p>
          </div>
          <div>
            <h4 className="font-semibold">Outlet</h4>
            <p>{reservation.outlet}</p>
          </div>
          <div>
            <h4 className="font-semibold">Phone</h4>
            <p>{reservation.phone}</p>
          </div>
          <div>
            <h4 className="font-semibold">Email</h4>
            <p>{reservation.email}</p>
          </div>
          <div>
            <h4 className="font-semibold">Number of People</h4>
            <p>{reservation.noOfPeople}</p>
          </div>
          <div>
            <h4 className="font-semibold">Date</h4>
            <p>{new Date(reservation.date).toLocaleDateString()}</p>
          </div>
          <div>
            <h4 className="font-semibold">Time</h4>
            <p>{reservation.time}</p>
          </div>
          <div>
            <h4 className="font-semibold">Notes</h4>
            <p>{reservation.notes || "No notes provided."}</p>
          </div>
          <div>
            <h4 className="font-semibold">Status</h4>
            <p>{reservation.status}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

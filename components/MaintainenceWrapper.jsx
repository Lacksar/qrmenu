"use client";

import { useState } from "react";
import UnderConstructionPage from "@/app/under-construction/page";

export default function MaintenanceWrapper({ children, limit = 0 }) {
  const [maintainence, setMaintainence] = useState(0);

  const handleChange = () => {
    setMaintainence((prev) => prev + 1);
  };

  // Show Under Construction page until limit reached
  if (maintainence < limit) {
    return <UnderConstructionPage handleChange={handleChange} />;
  }

  // Otherwise show real page
  return <>{children}</>;
}

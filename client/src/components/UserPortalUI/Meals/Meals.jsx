import React from "react";
import { PageHeader } from "../Components/page-header";
import { MealsOrders } from "../Components/meals-orders";

export default function MealsPage() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <PageHeader
        title="Meal Orders"
        description="View your current and past meal orders"
      />
      <MealsOrders />
    </div>
  );
}
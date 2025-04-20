import React from "react";
import { PageHeader } from "../Components/page-header";
import { AISuggestions } from "../Components/ai-suggestions";

export default function SuggestionsPage() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <PageHeader
        title="AI Meal Suggestions"
        description="Personalized meal recommendations based on your profile and preferences"
      />
      <AISuggestions />
    </div>
  );
}
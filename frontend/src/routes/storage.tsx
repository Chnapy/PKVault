import { createFileRoute } from "@tanstack/react-router";
import type React from "react";

export const Storage: React.FC = () => {
  return <div>storage-page</div>;
};

export const Route = createFileRoute("/storage")({
  component: Storage,
});

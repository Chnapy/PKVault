import { createFileRoute } from "@tanstack/react-router";
import { SavesPage } from '../pages/saves';

export const Route = createFileRoute("/saves")({
  component: SavesPage,
});

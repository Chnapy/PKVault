import { createFileRoute } from "@tanstack/react-router";
import { IndexPage } from '../pages';

export const Route = createFileRoute("/")({
  component: IndexPage,
});

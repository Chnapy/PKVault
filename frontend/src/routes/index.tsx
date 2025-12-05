import { createFileRoute, Navigate } from "@tanstack/react-router";
import { BankContext } from '../storage/bank/bank-context';

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const storageDefaultProps = BankContext.useStorageDefaultProps();

  return <Navigate to="/storage" {...storageDefaultProps} />;
}

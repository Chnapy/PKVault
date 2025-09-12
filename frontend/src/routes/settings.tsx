import { createFileRoute } from "@tanstack/react-router";
import type React from "react";
import { Backup } from '../settings/backup/backup';
import { Settings } from '../settings/settings';

const SettingsPage: React.FC = () => {

  return (
    <div
      style={{
        display: "flex",
        flexDirection: 'column',
        alignItems: "center",
        gap: 16,
      }}
    >
      <Settings />

      <Backup />
    </div>
  );
};

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

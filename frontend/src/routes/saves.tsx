import { createFileRoute } from "@tanstack/react-router";
import type React from "react";
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { Backup } from '../saves/backup/backup';
import { SaveItem } from "../saves/save-item/save-item";
import { SaveUpload } from "../saves/save-upload/save-upload";

const Saves: React.FC = () => {
  const saveInfosQuery = useSaveInfosGetAll();

  if (!saveInfosQuery.data) {
    return null;
  }

  const saveInfos = Object.values(saveInfosQuery.data.data).sort((a, b) => {
    return a.lastWriteTime > b.lastWriteTime ? -1 : 1;
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: 'column',
        // alignItems: "flex-start",
        alignItems: "center",
        // flexWrap: "wrap",
        gap: 16,
      }}
    >
      <SaveUpload />

      <div style={{
        width: '100%',
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 8,
      }}>
        {saveInfos.map((save, i) => (
          <SaveItem key={i} saveId={save.id} showDelete />
        ))}
      </div>

      <Backup />
    </div>
  );
};

export const Route = createFileRoute("/saves")({
  component: Saves,
});

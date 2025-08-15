import { createFileRoute } from "@tanstack/react-router";
import type React from "react";
import { useSaveInfosMain } from '../saves/hooks/use-save-infos-main';
import { SaveItem } from "../saves/save-item/save-item";
import { SaveUpload } from "../saves/save-upload/save-upload";

const Saves: React.FC = () => {
  const saveInfosQuery = useSaveInfosMain();

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
        alignItems: "flex-start",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <SaveUpload />

      {saveInfos.map((save, i) => (
        <SaveItem key={i} saveId={save.id} showDelete showOldSaves />
      ))}
    </div>
  );
};

export const Route = createFileRoute("/saves")({
  component: Saves,
});

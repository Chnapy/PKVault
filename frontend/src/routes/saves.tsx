import { createFileRoute } from "@tanstack/react-router";
import type React from "react";
import { useSaveInfosGetAll } from "../data/sdk/save-infos/save-infos.gen";
import { SaveItem } from "../saves/save-item/save-item";
import { SaveUpload } from "../saves/save-upload/save-upload";

const Saves: React.FC = () => {
  const saveInfosQuery = useSaveInfosGetAll();

  if (!saveInfosQuery.data) {
    return null;
  }

  const saveInfos = Object.values(saveInfosQuery.data.data).sort((a, b) => {
    return a[0].timestamp > b[0].timestamp ? -1 : 1;
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

      {saveInfos.map((saveList, i) => (
        <SaveItem key={i} saveId={saveList[0].id} />
      ))}
    </div>
  );
};

export const Route = createFileRoute("/saves")({
  component: Saves,
});

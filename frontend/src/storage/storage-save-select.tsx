import type React from "react";
import { useSaveInfosGetAll } from "../data/sdk/save-infos/save-infos.gen";
import { SaveItem } from "../saves/save-item/save-item";
import { Route } from "../routes/storage";

export const StorageSaveSelect: React.FC = () => {
  const saveInfosQuery = useSaveInfosGetAll();

  const navigate = Route.useNavigate();

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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 8,
        padding: 4,
        height: 550,
        overflowY: "auto",
      }}
    >
      {saveInfos.map((saveList, i) => (
        <SaveItem
          key={i}
          saveId={saveList[0].id}
          onClick={() => {
            navigate({
              search: {
                save: saveList[0].id,
              },
            });
          }}
        />
      ))}
    </div>
  );
};

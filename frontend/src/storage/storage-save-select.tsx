import type React from "react";
import { Route } from "../routes/storage";
import { useSaveInfosMain } from '../saves/hooks/use-save-infos-main';
import { SaveItem } from "../saves/save-item/save-item";

export const StorageSaveSelect: React.FC = () => {
  const saveInfosQuery = useSaveInfosMain();

  const navigate = Route.useNavigate();

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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 8,
        padding: 4,
        height: 550,
        overflowY: "auto",
      }}
    >
      {saveInfos.map((save, i) => (
        <SaveItem
          key={i}
          saveId={save.id}
          onClick={() => {
            navigate({
              search: {
                save: save.id,
              },
            });
          }}
        />
      ))}
    </div>
  );
};

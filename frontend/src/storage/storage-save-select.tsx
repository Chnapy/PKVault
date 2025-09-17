import type React from "react";
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { Route } from "../routes/storage";
import { SaveItem } from "../saves/save-item/save-item";
import { TitledContainer } from '../ui/container/titled-container';

export const StorageSaveSelect: React.FC = () => {
  const saveInfosQuery = useSaveInfosGetAll();

  const navigate = Route.useNavigate();

  if (!saveInfosQuery.data) {
    return null;
  }

  const saveInfos = Object.values(saveInfosQuery.data.data).sort((a, b) => {
    return a.lastWriteTime > b.lastWriteTime ? -1 : 1;
  });

  return (
    <TitledContainer
      title={'Save selection'}
    >
      <div
        style={{
          maxHeight: 528,
          overflowY: "auto",
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 2,
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
    </TitledContainer>
  );
};

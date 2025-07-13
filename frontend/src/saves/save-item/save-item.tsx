import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { getDexGetAllQueryKey } from "../../data/sdk/dex/dex.gen";
import {
  getSaveInfosGetAllQueryKey,
  useSaveInfosDelete,
  useSaveInfosGetAll,
} from "../../data/sdk/save-infos/save-infos.gen";
import { Button } from "../../ui/button/button";
import { Container } from "../../ui/container/container";
import { SaveCardContent } from "../../ui/save-card/save-card-content";

export type SaveItemProps = {
  saveId: number;
};

export const SaveItem: React.FC<SaveItemProps> = ({ saveId }) => {
  const queryClient = useQueryClient();
  const saveInfosQuery = useSaveInfosGetAll();
  const saveInfosDeleteMutation = useSaveInfosDelete({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getSaveInfosGetAllQueryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: getDexGetAllQueryKey(),
        });
      },
    },
  });

  const [showOlders, setShowOlders] = React.useState(false);

  if (!saveInfosQuery.data) {
    return null;
  }

  const saveInfos = Object.values(saveInfosQuery.data.data);

  const [firstItem, ...nextItems] = saveInfos.find(
    (saveList) => saveList[0].id === saveId
  )!;

  return (
    <Container
      padding="big"
      style={{ display: "flex", flexDirection: "column", gap: 4, width: 350 }}
    >
      <SaveCardContent
        generation={firstItem.generation}
        version={firstItem.version}
        trainerName={firstItem.trainerName}
        trainerGenderMale={firstItem.trainerGender === 0}
        tid={firstItem.tid}
        timestamp={firstItem.timestamp}
        onDelete={() =>
          saveInfosDeleteMutation.mutateAsync({
            params: {
              saveId: firstItem.id,
              timestamp: firstItem.timestamp,
            },
          })
        }
      />

      {nextItems.length > 0 && (
        <>
          <Button onClick={() => setShowOlders(!showOlders)}>
            {showOlders ? "Hide" : "Show"} older saves with same OT (
            {nextItems.length})
          </Button>

          {showOlders &&
            nextItems.map((item) => (
              <SaveCardContent
                key={item.timestamp}
                generation={item.generation}
                version={item.version}
                trainerName={item.trainerName}
                trainerGenderMale={item.trainerGender === 0}
                tid={item.tid}
                timestamp={item.timestamp}
                onDelete={() =>
                  saveInfosDeleteMutation.mutateAsync({
                    params: {
                      saveId: item.id,
                      timestamp: item.timestamp,
                    },
                  })
                }
              />
            ))}
        </>
      )}
    </Container>
  );
};

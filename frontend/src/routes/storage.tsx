import { DndContext } from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import type React from "react";
import z from "zod";
import { useSaveInfosGetAll } from "../data/sdk/save-infos/save-infos.gen";
import {
  getStorageGetMainPkmsQueryKey,
  getStorageGetMainPkmVersionsQueryKey,
  getStorageGetSavePkmsQueryKey,
  useStorageGetMainPkmVersions,
  useStorageMainMovePkm,
  useStorageSave,
  useStorageSaveMovePkm,
  useStorageSaveMovePkmFromStorage,
  useStorageSaveMovePkmToStorage,
} from "../data/sdk/storage/storage.gen";
import { StorageMainBox } from "../storage/storage-main-box";
import { StorageSaveBox } from "../storage/storage-save-box";
import { StorageSaveSelect } from "../storage/storage-save-select";
import { StorageDetails } from "../storage/storage-details";
import { Button } from "../ui/button/button";
import { BoxType } from '../data/sdk/model';

export const Storage: React.FC = () => {
  const selected = Route.useSearch({ select: (search) => search.selected });
  const saveId = Route.useSearch({ select: (search) => search.save });

  const queryClient = useQueryClient();

  const saveInfosRecord = useSaveInfosGetAll().data?.data;
  const saveInfos =
    saveId && saveInfosRecord ? saveInfosRecord[ saveId ][ 0 ] : undefined;

  const pkmVersionsQuery = useStorageGetMainPkmVersions();
  const pkmVersions = pkmVersionsQuery.data?.data ?? [];

  const pkmVersionsForSave = saveInfos
    ? pkmVersions.filter(
      (pkmVersion) => pkmVersion.generation === saveInfos.generation
    )
    : [];

  const saveMutation = useStorageSave({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getStorageGetMainPkmsQueryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: getStorageGetMainPkmVersionsQueryKey(),
        });
        if (saveId) {
          await queryClient.invalidateQueries({
            queryKey: getStorageGetSavePkmsQueryKey(saveId),
          });
        }
      },
    },
  });

  const mainMovePkmMutation = useStorageMainMovePkm({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getStorageGetMainPkmsQueryKey(),
        });
      },
    },
  });

  const saveMovePkmMutation = useStorageSaveMovePkm({
    mutation: {
      onSuccess: async () => {
        if (!saveId) {
          return;
        }

        await queryClient.invalidateQueries({
          queryKey: getStorageGetSavePkmsQueryKey(saveId),
        });
      },
    },
  });

  const saveMovePkmFromStorageMutation = useStorageSaveMovePkmFromStorage({
    mutation: {
      onSuccess: async () => {
        if (!saveId) {
          return;
        }

        await queryClient.invalidateQueries({
          queryKey: getStorageGetMainPkmsQueryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: getStorageGetMainPkmVersionsQueryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: getStorageGetSavePkmsQueryKey(saveId),
        });
      },
    },
  });

  const saveMovePkmToStorageMutation = useStorageSaveMovePkmToStorage({
    mutation: {
      onSuccess: async () => {
        if (!saveId) {
          return;
        }

        await queryClient.invalidateQueries({
          queryKey: getStorageGetMainPkmsQueryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: getStorageGetMainPkmVersionsQueryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: getStorageGetSavePkmsQueryKey(saveId),
        });
      },
    },
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <DndContext
        onDragEnd={async (ev) => {
          console.log({
            activeData: ev.active.data,
            overData: ev.over?.data,
          });

          if (!ev.over) {
            return;
          }

          const activeData = z
            .object({
              storageType: z.enum([ "main", "save" ]),
              pkmId: z.string(),
            })
            .parse(ev.active.data.current);

          const overData = z
            .object({
              storageType: z.enum([ "main", "save" ]),
              boxId: z.number(),
              boxSlot: z.number(),
            })
            .parse(ev.over?.data.current);

          if (
            activeData.storageType === "main" &&
            overData.storageType === "main"
          ) {
            const result = await mainMovePkmMutation.mutateAsync({
              params: {
                pkmId: activeData.pkmId,
                boxId: overData.boxId,
                boxSlot: overData.boxSlot,
              },
            });

            console.log(result);
          } else if (
            saveId &&
            activeData.storageType === "save" &&
            overData.storageType === "save"
          ) {
            const result = await saveMovePkmMutation.mutateAsync({
              saveId,
              params: {
                pkmId: activeData.pkmId,
                boxType: BoxType.Default,
                boxId: overData.boxId,
                boxSlot: overData.boxSlot,
              },
            });

            console.log(result);
          } else if (
            saveId &&
            activeData.storageType === "main" &&
            overData.storageType === "save"
          ) {
            const savePkmVersion = pkmVersionsForSave.find(
              (pkmVersion) => pkmVersion.pkmId === activeData.pkmId
            );
            if (!savePkmVersion) {
              throw new Error(
                `PkmVersion not found for pkm.id=${activeData.pkmId} generation=${saveInfos?.generation}`
              );
            }

            const result = await saveMovePkmFromStorageMutation.mutateAsync({
              saveId,
              params: {
                pkmVersionId: savePkmVersion.id,
                saveBoxType: BoxType.Default,
                saveBoxId: overData.boxId,
                saveSlot: overData.boxSlot,
              },
            });

            console.log(result);
          } else if (
            saveId &&
            activeData.storageType === "save" &&
            overData.storageType === "main"
          ) {
            const result = await saveMovePkmToStorageMutation.mutateAsync({
              saveId,
              params: {
                savePkmId: activeData.pkmId,
                storageBoxId: overData.boxId,
                storageSlot: overData.boxSlot,
              },
            });

            console.log(result);
          }
        }}
      >
        <StorageMainBox />

        {saveId ? <StorageSaveBox saveId={saveId} /> : <StorageSaveSelect />}
      </DndContext>

      <div
        style={{
          position: "fixed",
          bottom: 24,
          left: "25%",
        }}
      >
        <Button onClick={() => saveMutation.mutateAsync()} padding="big">
          Save all changes
        </Button>
      </div>

      {selected && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 350,
          }}
        >
          <StorageDetails
            type={selected.type}
            id={selected.id}
            saveId={saveId}
          />
        </div>
      )}
    </div>
  );
};

const searchSchema = z.object({
  selected: z
    .object({
      type: z.enum([ "main", "save" ]),
      id: z.string(),
    })
    .optional(),
  save: z.number().optional(),
  mainBoxId: z.number().optional(),
  saveBoxId: z.number().optional(),
});

export const Route = createFileRoute("/storage")({
  component: Storage,
  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares: [
      ({ search, next }) => {
        const result = next(search);

        return {
          ...search,
          ...result,
        };
      },
    ],
  },
});

import { DndContext } from "@dnd-kit/core";
import { createFileRoute, retainSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import type React from "react";
import z from "zod";
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import {
  useStorageGetMainPkmVersions,
  useStorageMainMovePkm,
  useStorageSaveMovePkm,
  useStorageSaveMovePkmFromStorage,
  useStorageSaveMovePkmToStorage
} from "../data/sdk/storage/storage.gen";
import { SaveItem } from '../saves/save-item/save-item';
import { ActionsPanel } from '../storage/actions/actions-panel';
import { StorageDetails } from "../storage/storage-details";
import { StorageMainBox } from "../storage/storage-main-box";
import { StorageSaveBox } from "../storage/storage-save-box";
import { StorageSaveSelect } from "../storage/storage-save-select";

export const Storage: React.FC = () => {
  const selected = Route.useSearch({ select: (search) => search.selected });
  const saveId = Route.useSearch({ select: (search) => search.save });

  const navigate = Route.useNavigate();

  const saveInfosRecord = useSaveInfosGetAll().data?.data;
  const saveInfos =
    saveId && saveInfosRecord ? saveInfosRecord[ saveId ] : undefined;

  const pkmVersionsQuery = useStorageGetMainPkmVersions();
  const pkmVersions = pkmVersionsQuery.data?.data ?? [];

  const pkmVersionsForSave = saveInfos
    ? pkmVersions.filter(
      (pkmVersion) => pkmVersion.generation === saveInfos.generation
    )
    : [];

  const mainMovePkmMutation = useStorageMainMovePkm();

  const saveMovePkmMutation = useStorageSaveMovePkm();

  const saveMovePkmFromStorageMutation = useStorageSaveMovePkmFromStorage();

  const saveMovePkmToStorageMutation = useStorageSaveMovePkmToStorage();

  return (
    <div
      style={{
        display: "table",
        justifyContent: "center",
        alignItems: "flex-start",
        flexWrap: "wrap",
        borderSpacing: 16,
        margin: 'auto',
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
              pkmId: activeData.pkmId,
              params: {
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
              pkmId: activeData.pkmId,
              params: {
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
        <div
          style={{
            display: 'table-row'
          }}
        >

          <div
            style={{
              display: 'table-cell',
              verticalAlign: 'top',
              // height: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'center',
                // height: '100%',
              }}
            >
            </div>
          </div>

          <div
            style={{
              display: 'table-cell',
              verticalAlign: 'top',
              // height: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'center',
                // height: '100%',
              }}
            >
              {saveId ? <SaveItem
                saveId={saveId}
                onClose={() => navigate({
                  search: {
                    save: undefined,
                    saveBoxId: undefined,
                    selected: undefined,
                  }
                })}
              /> : null}
            </div>
          </div>

        </div>

        <div
          style={{
            display: 'table-row'
          }}
        >

          <div
            style={{
              display: 'table-cell',
              verticalAlign: 'top',
              // height: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'center',
                // height: '100%',
              }}
            >
              <StorageMainBox />
            </div>
          </div>

          <div
            style={{
              display: 'table-cell',
              verticalAlign: 'top',
              // height: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'center',
                // height: '100%',
              }}
            >
              {saveId ? <StorageSaveBox saveId={saveId} /> : <StorageSaveSelect />}
            </div>
          </div>

        </div>

      </DndContext>

      <div
        style={{
          position: "fixed",
          bottom: 14,
          left: "50%",
          transform: 'translateX(-50%)',
          width: 400,
        }}
      >
        <ActionsPanel />
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
            key={selected.id}
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
      editMode: z.boolean().optional(),
    })
    .optional(),
  save: z.number().optional(),
  mainBoxId: z.number().optional(),
  saveBoxId: z.string().optional(),
});

export const Route = createFileRoute("/storage")({
  component: Storage,
  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares: [ retainSearchParams(true) ],
  }
});

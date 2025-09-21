import { css } from '@emotion/css';
import { createFileRoute, retainSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import type React from "react";
import z from "zod";
import { SaveItem } from '../saves/save-item/save-item';
import { ActionsPanel } from '../storage/actions/actions-panel';
import { StorageMoveContext } from '../storage/actions/storage-move-context';
import { StorageDetails } from "../storage/storage-details";
import { StorageMainBox } from "../storage/storage-main-box";
import { StorageSaveBox } from "../storage/storage-save-box";
import { StorageSaveSelect } from "../storage/storage-save-select";

export const Storage: React.FC = () => {
  const selected = Route.useSearch({ select: (search) => search.selected });
  const saveId = Route.useSearch({ select: (search) => search.save });

  const navigate = Route.useNavigate();

  return (
    <StorageMoveContext.Provider>
      <div
        id={StorageMoveContext.containerId}
        style={{
          display: "table",
          justifyContent: "center",
          alignItems: "flex-start",
          flexWrap: "wrap",
          borderSpacing: 16,
          margin: 'auto',
          marginTop: -16,
          marginBottom: selected ? 150 : undefined,
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

        <div
          className={css({
            position: "fixed",
            bottom: 14,
            left: "50%",
            transform: 'translateX(-50%)',
            width: 400,
            zIndex: 20,
            '&:hover': {
              zIndex: 25,
            }
          })}
        >
          <ActionsPanel />
        </div>

        {selected && (
          <div
            className={css({
              position: "fixed",
              bottom: 14,
              top: 14,
              right: 14,
              width: 350,
              pointerEvents: 'none',
              zIndex: 20,
              display: 'flex',
              alignItems: 'flex-end',
              '&:hover': {
                zIndex: 25,
              },
              '& > *': {
                maxWidth: '100%',
                maxHeight: '100%',
                overflowY: 'auto',
                pointerEvents: 'initial',
              }
            })}
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
    </StorageMoveContext.Provider>
  );
};

// TODO PRIOR break app if wrong value
const searchSchema = z.object({
  selected: z
    .object({
      type: z.enum([ "main", "save" ]),
      id: z.string(),
      editMode: z.boolean().optional(),
    })
    .optional(),
  save: z.number().optional(),  // TODO PRIOR break view if wrong value
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

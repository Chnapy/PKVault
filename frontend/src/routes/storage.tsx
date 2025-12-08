import { css } from '@emotion/css';
import { createFileRoute, retainSearchParams } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import React from "react";
import z from "zod";
import { withErrorCatcher } from '../error/with-error-catcher';
import { ActionsPanel } from '../storage/actions/actions-panel';
import { StorageMoveContext } from '../storage/actions/storage-move-context';
import { StorageSelectContext } from '../storage/actions/storage-select-context';
import { BankList } from '../storage/bank/bank-list';
import { StorageDetails } from "../storage/storage-details";
import { StorageMainBox } from "../storage/storage-main-box";
import { StorageSaveBox } from "../storage/storage-save-box";
import { StorageSaveSelect } from "../storage/storage-save-select";
import { StorageSearchCheck } from '../storage/storage-search-check';
import { filterIsDefined } from '../util/filter-is-defined';
// import { TestFillMainStorage } from '../storage/test-fill-main-storage';

export const Storage: React.FC = withErrorCatcher('default', () => {
  const selected = Route.useSearch({ select: (search) => search.selected });
  const saves = Route.useSearch({ select: (search) => search.saves }) ?? {};

  return (
    <StorageSearchCheck>
      <StorageSelectContext.Provider>
        <StorageMoveContext.Provider>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <div
              id={StorageMoveContext.containerId}
              style={{
                display: 'flex',
                justifyContent: "center",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 16,
                margin: 'auto',
                marginBottom: 150,
              }}
            >
              {/* <div style={{ width: '100%', display: 'flex', gap: 8 }}>
                <TestFillMainStorage />
              </div> */}

              <BankList />

              <StorageMainBox />

              {Object.values(saves)
                .filter(filterIsDefined)
                .sort((a, b) => a.order < b.order ? -1 : 1)
                .map(save => <StorageSaveBox key={save.saveId} saveId={save.saveId} />)}

              <div style={{
                display: 'flex',
                width: 630,
                height: 564
              }}>
                <StorageSaveSelect />
              </div>

              <div
                className={css({
                  position: "fixed",
                  bottom: 14,
                  left: "50%",
                  transform: 'translateX(-50%)',
                  maxWidth: 400,
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
                    id={selected.id}
                    saveId={selected.saveId}
                  />
                </div>
              )}
            </div>
          </div>
        </StorageMoveContext.Provider>
      </StorageSelectContext.Provider>
    </StorageSearchCheck>
  );
});

export type StorageSearchSchema = z.infer<typeof searchSchema>;

const searchSchema = z.object({
  selected: z
    .object({
      saveId: z.number().int().optional(),
      id: z.string(),
      editMode: z.boolean().optional(),
    })
    .optional(),
  saves: z.record(
    z.number().int(),
    z.object({
      saveId: z.number().int(),
      saveBoxIds: z.array(z.number().int()),
      order: z.number().int(),
    }).optional()
  ).optional(),
  mainBoxIds: z.array(z.number().int()).optional(),
});

export const Route = createFileRoute("/storage")({
  component: Storage,
  validateSearch: zodValidator(fallback(searchSchema, {})),
  search: {
    middlewares: [ retainSearchParams(true) ],
  }
});

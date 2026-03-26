import { css } from '@emotion/css';
import { createFileRoute, retainSearchParams } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import React from "react";
import z from "zod";
import { withErrorCatcher } from '../error/with-error-catcher';
import { ActionsPanel } from '../storage/actions/actions-panel';
import { StorageSelectContext } from '../storage/actions/storage-select-context';
import { BankList } from '../storage/bank/bank-list';
import { StorageMainBox } from "../storage/box/main/storage-main-box";
import { StorageSaveBox } from "../storage/box/save/storage-save-box";
import { StorageDetails } from "../storage/details/storage-details";
import { MoveContext } from '../storage/move/context/move-context';
import { StorageSaveSelect } from "../storage/storage-save-select";
import { StorageSearchCheck } from '../storage/storage-search-check';
import { type DetailsExpandedState } from '../ui/details-card/details-card-container';
import { DetailsCardWrapper } from '../ui/details-card/details-card-wrapper';
import { filterIsDefined } from '../util/filter-is-defined';

export const Storage: React.FC = withErrorCatcher('default', () => {
  const selected = Route.useSearch({ select: (search) => search.selected });
  const saves = Route.useSearch({ select: (search) => search.saves }) ?? {};

  const navigate = Route.useNavigate();

  return (
    <StorageSearchCheck>
      <StorageSelectContext.Provider>
        <MoveContext.Provider>
          <div className={css({
            display: 'flex',
            justifyContent: 'space-between',
          })}>
            <div
              id={MoveContext.containerId}
              className={css({
                display: 'flex',
                justifyContent: "center",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 16,
                margin: 'auto',
                marginBottom: 150,
              })}
            >
              <BankList />

              <StorageMainBox />

              {Object.values(saves)
                .filter(filterIsDefined)
                .sort((a, b) => a.order < b.order ? -1 : 1)
                .map(save => <StorageSaveBox key={save.saveId} saveId={save.saveId} />)}

              <div className={css({
                display: 'flex',
                width: 630,
                height: 564
              })}>
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
                <DetailsCardWrapper
                  onClose={() => navigate({
                    search: {
                      selected: undefined,
                    }
                  })}
                >
                  <StorageDetails
                    key={selected.id}
                    id={selected.id}
                    saveId={selected.saveId}
                  />
                </DetailsCardWrapper>
              )}
            </div>
          </div>
        </MoveContext.Provider>
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
  selectedContext: z.number().optional(),
  selectExpanded: z.enum([ 'none', 'expanded', 'expanded-max' ] as const satisfies DetailsExpandedState[]).optional(),
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

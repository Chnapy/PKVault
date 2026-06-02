import { createFileRoute, retainSearchParams } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import React from "react";
import z from "zod";
import { withErrorCatcher } from '../error/with-error-catcher';
import { MoveSelectImplProvider } from '../storage/move/state/move-select-impl-provider';
import { StoragePanel } from '../storage/panel/storage-panel';
import { StoragePanelProvider, type StoragePanelContext } from '../storage/panel/storage-panel-context';
import { UIStorageContent } from '../ui-new/storage/storage-content/ui-storage-content';
import { UIStoragePanelWrapperDetails } from '../ui-new/storage/storage-panel/ui-storage-panel-wrapper-details';
import { type DetailsExpandedState } from '../ui/details-card/details-card-container';

const panelLeftContextValue: StoragePanelContext = {
  storageIndex: 0,
  defaultStorage: { saveId: null },
};

const panelRightContextValue: StoragePanelContext = {
  storageIndex: 1,
};

export const Storage: React.FC = withErrorCatcher('default', () => {
  // const selected = Route.useSearch({ select: (search) => search.selected });
  // const saves = Route.useSearch({ select: (search) => search.saves }) ?? {};

  // const navigate = Route.useNavigate();
  console.log('page storage')

  return (
    <MoveSelectImplProvider>
      <UIStorageContent
        id='move-container'
        left={<StoragePanelProvider value={panelLeftContextValue}>
          <UIStoragePanelWrapperDetails
            // details={<UIStorageDetails
            // />}
            children={<StoragePanel />}
          />
        </StoragePanelProvider>}
        right={<StoragePanelProvider value={panelRightContextValue}>
          <UIStoragePanelWrapperDetails
            // details={<UIStorageDetails
            // />}
            children={<StoragePanel />}
          />
        </StoragePanelProvider>}
      />
    </MoveSelectImplProvider>
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

  storages: z.array(z
    .object({
      saveId: z.number().int().nullable(),
      boxId: z.number().int().optional(),
    })
  ).max(2).optional(),
});

export const Route = createFileRoute("/storage")({
  component: Storage,
  validateSearch: zodValidator(fallback(searchSchema, {})),
  search: {
    middlewares: [ retainSearchParams(true) ],
  }
});

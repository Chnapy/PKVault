import { createFileRoute, retainSearchParams } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import React from "react";
import z from "zod";
import { withErrorCatcher } from '../error/with-error-catcher';
import { StorageDetails } from '../storage/details/storage-details';
import { StoragePanel } from '../storage/panel/storage-panel';
import { UIStorageContent } from '../ui-new/storage/storage-content/ui-storage-content';
import { UIStoragePanelWrapperDetails } from '../ui-new/storage/storage-panel/ui-storage-panel-wrapper-details';
import { type DetailsExpandedState } from '../ui/details-card/details-card-container';

export const Storage: React.FC = withErrorCatcher('default', () => {
  console.log('page storage')

  return (
    <UIStorageContent
      id='move-container'
      left={<UIStoragePanelWrapperDetails
        details={<StorageDetails />}
      >
        <StoragePanel />
      </UIStoragePanelWrapperDetails>}
      right={<UIStoragePanelWrapperDetails
        details={<StorageDetails />}
      >
        <StoragePanel />
      </UIStoragePanelWrapperDetails>}
    />
  );
});

export type StorageSearchSchema = z.infer<typeof searchSchema>;

export type StorageSearchStorage = NonNullable<StorageSearchSchema[ 'storages' ]>[ number ];

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

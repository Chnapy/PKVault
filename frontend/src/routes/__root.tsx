import { css } from '@emotion/css';
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import React from "react";
import z from 'zod';
import { HistoryContext } from '../context/history-context';
import { useStorageGetActions } from '../data/sdk/storage/storage.gen';
import { Header } from '../header/header';
import { HelpDialog } from '../help/help-dialog';
import { ActionsPanel } from '../storage/actions/actions-panel';
import { MoveSelectImplProvider } from '../storage/move/state/move-select-impl-provider';
import { UIAppLayout } from '../ui-new/layout/app-layout/ui-app-layout';
import { UIFooter } from '../ui-new/layout/footer/ui-footer';
import { iconResources } from '../ui/icon/icon-resources';
import { ImgPrefetch } from '../ui/icon/img-prefetch';

const Root: React.FC = () => {
  const hasStorageActions = !!useStorageGetActions().data?.data.length;

  React.useEffect(() => {
    if (hasStorageActions) {
      window.onbeforeunload = () => 'You have unsaved changes !';
    } else {
      window.onbeforeunload = null;
    }

  }, [ hasStorageActions ]);

  return (
    <HistoryContext.Provider>
      <MoveSelectImplProvider>
        <UIAppLayout
          header={<Header />}
          bottom={<ActionsPanel />}
          footer={<UIFooter />}
        >
          <Outlet />

          <HelpDialog />
        </UIAppLayout>
      </MoveSelectImplProvider>

      <div aria-description='prefetch' className={css({ width: 0, height: 0 })}>
        {Object.values(iconResources).flatMap(v => Object.values(v)).map(url => <ImgPrefetch
          key={url}
          src={url}
        />)}
      </div>
    </HistoryContext.Provider>
  );
};

const searchSchema = z.object({
  // /docs/{lang}/file.md#section
  help: z.string().optional(),
});

export const Route = createRootRoute({
  component: Root,
  validateSearch: zodValidator(fallback(searchSchema, {})),
});

import { Outlet } from "@tanstack/react-router";
import React from "react";
import { HistoryContext } from '../context/history-context';
import { useStorageGetActions } from '../data/sdk/storage/storage.gen';
import { Header } from '../header/header';
import { FlatpakMigrateDialog } from '../help/flatpak-migrate-dialog';
import { HelpDialog } from '../help/help-dialog';
import { WelcomeDialog } from '../help/welcome-dialog';
import { useStaticData } from '../hooks/use-static-data';
import { ActionsPanel } from '../storage/actions/actions-panel';
import { MoveSelectImplProvider } from '../storage/move/move-select-impl-provider';
import type { IsItemCompatibleFn } from '../storage/move/validation/rules/validate-common';
import { useTranslate } from '../translate/i18n';
import { StorageModeProvider } from '../ui/inventory/context/storage-mode-provider';
import { UIAppLayout } from '../ui/layout/app-layout/ui-app-layout';
import { UIFooter } from '../ui/layout/footer/ui-footer';

export const RootPage: React.FC = () => {
  const { t } = useTranslate();

  const staticData = useStaticData();

  const isItemCompatible = React.useCallback<IsItemCompatibleFn>((sourceHeldItem, sourceVersion, targetVersion) => {
    const itemKey = staticData.getItemKey(sourceVersion, sourceHeldItem);
    return !itemKey || staticData.isItemCompatible(targetVersion, itemKey);
  }, [ staticData ]);

  const hasStorageActions = !!useStorageGetActions().data?.data.length;

  React.useEffect(() => {
    if (hasStorageActions) {
      const txt = t('before-unload.alert');
      window.onbeforeunload = () => txt;
    } else {
      window.onbeforeunload = null;
    }

  }, [ hasStorageActions, t ]);

  return (
    <HistoryContext.Provider>
      <StorageModeProvider>
        <MoveSelectImplProvider isItemCompatible={isItemCompatible}>
          <UIAppLayout
            header={<Header />}
            bottom={<ActionsPanel />}
            footer={<UIFooter />}
          >
            <Outlet />

            <HelpDialog />
            <WelcomeDialog />
            <FlatpakMigrateDialog />
          </UIAppLayout>
        </MoveSelectImplProvider>
      </StorageModeProvider>
    </HistoryContext.Provider>
  );
};

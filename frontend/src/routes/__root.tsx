import { css } from '@emotion/css';
import { createRootRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import React from "react";
import z from 'zod';
import { HistoryContext } from '../context/history-context';
import { useSaveInfosScan } from '../data/sdk/save-infos/save-infos.gen';
import { useSettingsGet } from '../data/sdk/settings/settings.gen';
import { useStorageGetActions } from '../data/sdk/storage/storage.gen';
import { ErrorCatcher } from '../error/error-catcher';
import { HelpDialog } from '../help/help-dialog';
import type { DocsGenEnSlugs } from '../help/hooks/use-help-navigate';
import { NotificationButton } from '../notification/notification-button';
import { useTranslate } from '../translate/i18n';
import { Button } from '../ui/button/button';
import { ButtonWithDisabledPopover } from '../ui/button/button-with-disabled-popover';
import { Frame } from '../ui/header/frame';
import { Header } from '../ui/header/header';
import { HeaderItem } from "../ui/header/header-item";
import { Icon } from '../ui/icon/icon';

const Root: React.FC = () => {
  const matchRoute = useMatchRoute();

  const { t } = useTranslate();

  const settings = useSettingsGet().data?.data;
  const hasStorageActions = !!useStorageGetActions().data?.data.length;
  const savesScanMutation = useSaveInfosScan();

  return (
    <HistoryContext.Provider>
      <Frame>
        <ErrorCatcher>
          <Header>
            <HeaderItem
              selected={Boolean(
                matchRoute({ to: "/saves" }) ||
                matchRoute({ to: "/saves", pending: true })
              )}
              to={"/saves"}
            >
              {t('header.saves')}
            </HeaderItem>
            <HeaderItem
              selected={Boolean(
                matchRoute({ to: "/storage" }) ||
                matchRoute({ to: "/storage", pending: true })
              )}
              to={"/storage"}
            >
              {t('header.storage')}
              {hasStorageActions && '*'}
            </HeaderItem>
            <HeaderItem
              selected={Boolean(
                matchRoute({ to: "/pokedex" }) ||
                matchRoute({ to: "/pokedex", pending: true })
              )}
              to={"/pokedex"}
            >
              {t('header.dex')}
            </HeaderItem>

            <ButtonWithDisabledPopover
              as={Button}
              onClick={() => savesScanMutation.mutateAsync()}
              disabled={!settings?.canScanSaves}
              showHelp={!settings?.canScanSaves}
              helpTitle={t('action.not-possible')}
            >
              <Icon
                name='refresh'
                forButton
              />
              {t('header.scan-saves')}
            </ButtonWithDisabledPopover>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: 'auto'
              }}
            >
              <HeaderItem
                search={{ help: 'README.md' satisfies DocsGenEnSlugs }}
              >
                <Icon name="info-circle" forButton />
                {t('header.help')}
              </HeaderItem>

              <HeaderItem
                selected={Boolean(
                  matchRoute({ to: "/settings" }) ||
                  matchRoute({ to: "/settings", pending: true })
                )}
                to={"/settings"}
              >
                {t('header.settings')}
              </HeaderItem>

              <NotificationButton />
            </div>
          </Header>

          <div
            className={css({
              position: "relative",
              padding: 16,
              paddingTop: 0,
              flexGrow: 1,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center'
            })}
          >
            <ErrorCatcher>
              <Outlet />
            </ErrorCatcher>
          </div>

          <HelpDialog />
        </ErrorCatcher>
      </Frame>
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

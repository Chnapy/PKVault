import { css } from '@emotion/css';
import { createRootRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import React from "react";
import { BackendErrorsContext } from '../data/backend-errors-context';
import { useSaveInfosScan } from '../data/sdk/save-infos/save-infos.gen';
import { useSettingsGet } from '../data/sdk/settings/settings.gen';
import { useStorageGetActions } from '../data/sdk/storage/storage.gen';
import { useWarningsGetWarnings } from '../data/sdk/warnings/warnings.gen';
import { ButtonWithDisabledPopover } from '../ui/button/button-with-disabled-popover';
import { Frame } from '../ui/header/frame';
import { Header } from '../ui/header/header';
import { HeaderItem } from "../ui/header/header-item";
import { Icon } from '../ui/icon/icon';
import { NotificationCard } from '../ui/notification-card/notification-card';

const Root: React.FC = () => {
  const matchRoute = useMatchRoute();

  const settings = useSettingsGet().data?.data;
  const warnings = useWarningsGetWarnings().data?.data;
  const hasStorageActions = !!useStorageGetActions().data?.data.length;
  const savesScanMutation = useSaveInfosScan();

  const [ openNotif, setOpenNotif ] = React.useState(false);
  const hasWarnings = !!warnings && (warnings.pkmVersionWarnings.length + warnings.playTimeWarnings.length) > 0;
  const hasErrors = BackendErrorsContext.useValue().errors.length > 0 || hasWarnings;

  React.useEffect(() => {
    if (openNotif && !hasErrors) {
      setOpenNotif(false);
    }
  }, [ hasErrors, openNotif ]);

  React.useEffect(() => {
    if (hasErrors) {
      setOpenNotif(true);
    }
  }, [ hasErrors ]);

  return (
    <Frame>
      <Header>
        <HeaderItem
          selected={Boolean(
            matchRoute({ to: "/saves" }) ||
            matchRoute({ to: "/saves", pending: true })
          )}
          to={"/saves"}
        >
          Saves
        </HeaderItem>
        <HeaderItem
          selected={Boolean(
            matchRoute({ to: "/storage" }) ||
            matchRoute({ to: "/storage", pending: true })
          )}
          to={"/storage"}
        >
          Storage{hasStorageActions && '*'}
        </HeaderItem>
        <HeaderItem
          selected={Boolean(
            matchRoute({ to: "/pokedex" }) ||
            matchRoute({ to: "/pokedex", pending: true })
          )}
          to={"/pokedex"}
        >
          Pokedex
        </HeaderItem>

        <ButtonWithDisabledPopover
          onClick={() => savesScanMutation.mutateAsync()}
          disabled={!settings?.canScanSaves}
          showHelp={!settings?.canScanSaves}
          helpTitle='Action not possible with waiting storage actions'
        >
          <Icon
            name='refresh'
            forButton
          />
          Scan saves
        </ButtonWithDisabledPopover>

        <HeaderItem
          selected={Boolean(
            matchRoute({ to: "/settings" }) ||
            matchRoute({ to: "/settings", pending: true })
          )}
          to={"/settings"}
          endPosition
        >
          Backups & settings
        </HeaderItem>

        <ButtonWithDisabledPopover
          onClick={() => setOpenNotif(value => !value)}
          selected={openNotif}
          disabled={!hasErrors}
          showHelp={!hasErrors}
          helpTitle='No notifications'
        >
          <Icon name='bell' solid forButton />
        </ButtonWithDisabledPopover>
      </Header>

      <div
        style={{
          position: "relative",
          padding: 16,
          paddingTop: 0,
        }}
      >
        <Outlet />

        {openNotif && <div
          className={css({
            position: "fixed",
            top: 47,
            right: 14,
            width: 400,
            zIndex: 20,
            '&:hover': {
              zIndex: 25,
            }
          })}
        >
          <NotificationCard />
        </div>}
      </div>
    </Frame>
  );
};

export const Route = createRootRoute({
  component: Root,
});

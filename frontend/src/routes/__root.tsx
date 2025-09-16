import { createRootRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import type React from "react";
import { useSaveInfosScan } from '../data/sdk/save-infos/save-infos.gen';
import { Button } from '../ui/button/button';
import { Frame } from '../ui/header/frame';
import { Header } from '../ui/header/header';
import { HeaderItem } from "../ui/header/header-item";
import { Icon } from '../ui/icon/icon';
import { Warnings } from '../warnings/warnings';

const Root: React.FC = () => {
  const matchRoute = useMatchRoute();

  const savesScanMutation = useSaveInfosScan();

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
          Storage
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

        <Button
          onClick={() => savesScanMutation.mutateAsync()}
        >
          <Icon
            name='refresh'
            forButton
          />
          Scan saves
        </Button>

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
      </Header>

      {/* <div
        style={{
          alignSelf: 'center',
          justifySelf: 'center',
        }}
      >
        <Warnings />
      </div> */}

      <div
        style={{
          position: "relative",
          padding: 16,
          paddingTop: 0,
        }}
      >
        <Outlet />
      </div>
    </Frame>
  );
};

export const Route = createRootRoute({
  component: Root,
});

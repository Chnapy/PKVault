import { createRootRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type React from "react";
import { Header } from "../ui/header/header";
import { HeaderItem } from "../ui/header/header-item";

const Root: React.FC = () => {
  const matchRoute = useMatchRoute();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        height: "100vh",
        overflowY: "scroll",
      }}
    >
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
      </Header>

      <div
        style={{
          position: "relative",
          padding: 16,
        }}
      >
        <Outlet />
      </div>

      <TanStackRouterDevtools />
    </div>
  );
};

export const Route = createRootRoute({
  component: Root,
});

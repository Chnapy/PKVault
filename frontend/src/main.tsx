import "./ui/global-style.ts";

import { createRouter, RouterProvider, createHashHistory } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DataProvider } from "./data/data-provider.tsx";
import { routeTree } from "./routeTree.gen";
import { Icon } from './ui/icon/icon.tsx';
import { Button } from './ui/button/button.tsx';
import { Splash } from './ui/splash/splash.tsx';
import { TitledContainer } from './ui/container/titled-container.tsx';
import { TextInput } from './ui/input/text-input.tsx';
import { NumberInput } from './ui/input/number-input.tsx';
import { TypeItem } from './ui/type-item/type-item.tsx';
import { MoveItem } from './ui/move-item/move-item.tsx';
import { MoveCategory } from './data/sdk/model/moveCategory.ts';

// Create a new router instance
const router = createRouter({
  routeTree,
  // required for WinForm
  history: createHashHistory()
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const timedFn = () => new Promise(resolve => setTimeout(resolve, 5000));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DataProvider>
      <Splash>
        {/* <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, alignItems: 'flex-start' }}>
          <Icon name='folder' solid />
          <Icon name='angle-left' />
          <Icon name='download' />

          <Button onClick={timedFn}>
            Action
          </Button>

          <Button onClick={timedFn}>
            <Icon name='download' forButton />
            Action 2
          </Button>

          <Button onClick={timedFn}>
            <Icon name='download' forButton />
          </Button>

          <Button onClick={timedFn} big>
            <Icon name='download' forButton />
            Action 2
          </Button>

          <TitledContainer
            title="Generation III - foobar"
          >
            toto
          </TitledContainer>

          <TitledContainer
            title="Tentacruel"
            contrasted
          >
            tata
          </TitledContainer>

          <TextInput
            value='toto'
            onChange={console.log}
          />

          <TextInput
            value='Nickname'
            onChange={console.log}
            label='Nickname'
          />

          <NumberInput
            value={321}
            onChange={console.log}
          />

          <NumberInput
            value={321}
            onChange={console.log}
            rangeMin={0}
            rangeMax={510}
          />

          <TypeItem type={9} />
          <TypeItem type={8} />
          <TypeItem type={15} />

          <MoveItem
            name='Razor Leaf'
            type={11}
            category={MoveCategory.SPECIAL}
            damage={55}
          />

          <MoveItem
            name='Poison powder'
            type={3}
            category={MoveCategory.STATUS}
          />
        </div> */}

        <RouterProvider router={router} />
      </Splash>
    </DataProvider>
  </StrictMode>
);

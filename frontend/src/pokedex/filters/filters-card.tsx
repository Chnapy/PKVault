import { css } from "@emotion/css";
import type React from "react";
import { Container } from "../../ui/container/container";
import { FilterCaught } from "./components/filter-caught";
import { FilterFromGames } from "./components/filter-from-games";
import { FilterGeneration } from "./components/filter-generation";
import { FilterOwned } from './components/filter-owned';
import { FilterOwnedShiny } from './components/filter-owned-shiny';
import { FilterSeen } from "./components/filter-seen";
import { FilterSpecies } from "./components/filter-species";
import { FilterTypes } from "./components/filter-types";
import { ShowForms } from './components/show-forms';
import { ShowGenders } from './components/show-genders';

export const FiltersCard: React.FC = () => {
  return (
    <Container
      className={css({
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: 8,
      })}
      padding="big"
      borderRadius="big"
    >
      <FilterSpecies />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          className={css({
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          })}
        >
          <FilterSeen />

          <FilterCaught />

          <FilterOwned />

          <FilterOwnedShiny />

          <FilterTypes />
        </div>

        <div
          className={css({
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          })}
        >
          <FilterFromGames />

          <FilterGeneration />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >

        <ShowForms />

        <ShowGenders />

      </div>
    </Container>
  );
};

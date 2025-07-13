import { css } from "@emotion/css";
import type React from "react";
import { FilterCaught } from "./components/filter-caught";
import { FilterFromGames } from "./components/filter-from-games";
import { FilterGeneration } from "./components/filter-generation";
import { FilterSeen } from "./components/filter-seen";
import { FilterSpecies } from "./components/filter-species";
import { FilterTypes } from "./components/filter-types";
import { Container } from "../../ui/container/container";

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
    </Container>
  );
};

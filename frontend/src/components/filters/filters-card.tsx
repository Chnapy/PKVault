import { css } from "@emotion/css";
import type React from "react";
import { FilterCaught } from "../../pokedex/filters/components/filter-caught";
import { FilterFromGames } from "../../pokedex/filters/components/filter-from-games";
import { FilterSeen } from "../../pokedex/filters/components/filter-seen";
import { FilterSpecies } from "../../pokedex/filters/components/filter-species";
import { FilterTypes } from "../../pokedex/filters/components/filter-types";
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

      <FilterTypes />

      <FilterSeen />

      <FilterCaught />

      <FilterFromGames />
    </Container>
  );
};

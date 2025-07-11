import React from "react";
import { FiltersCard } from "../components/filters/filters-card";
import { PokedexContext } from "./context/pokedex-context";
import { PokedexDetails } from "./details/pokedex-details";
import { PokedexList } from "./list/pokedex-list";

export const PokedexPage: React.FC = () => {
  const [selectedPkm, setSelectedPkm] = React.useState(NaN);

  return (
    <PokedexContext.Provider value={selectedPkm}>
      <div>
        <div>
          <div style={{ paddingBottom: 8 }}>
            <FiltersCard />
          </div>

          <PokedexList setSelectedPkm={setSelectedPkm} />
        </div>

        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 350,
          }}
        >
          <PokedexDetails />
        </div>
      </div>
    </PokedexContext.Provider>
  );
};

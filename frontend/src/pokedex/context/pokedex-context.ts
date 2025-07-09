import React from "react";

const pokedexContext = React.createContext(-1);

export const PokedexContext = {
  Provider: pokedexContext.Provider,
  useValue: () => React.useContext(pokedexContext),
};

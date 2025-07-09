export const getSpeciesImg = (species: number, speciesName: string) => {
  const finalName = speciesName
    .toLowerCase()
    .replaceAll("é", "e")
    .replace("’", "")
    .replace(". ", "-")
    .replace("♀", "-f")
    .replace("♂", "-m")
    .replace(" ", "-")
    .replace(".", "")
    .replace(":", "");

  // gen 1 - 5
  if (species < 650) {
    return `https://img.pokemondb.net/sprites/black-white/normal/${finalName}.png`;
  }

  // gen 6+
  return `https://img.pokemondb.net/sprites/bank/normal/${finalName}.png`;
};

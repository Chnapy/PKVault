export const getSpeciesNO = (species: number) => {
  let str = species.toString();

  for (let i = str.length; i < 4; i++) {
    str = "0" + str;
  }

  return str;
};

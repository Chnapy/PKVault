export const getSpeciesNO = (species: number) => {
  if (species === 0) {
    return '----';
  }

  let str = species.toString();

  for (let i = str.length; i < 4; i++) {
    str = "0" + str;
  }

  return str;
};

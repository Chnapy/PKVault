const staticDataFns: (() => Promise<unknown>)[] = [];
const staticDataResults: unknown[] = [];

export const prepareStaticData = <D>(fn: () => Promise<D>): (() => D) => {
  const dataIndex = staticDataFns.length;
  staticDataFns.push(fn);

  return () => staticDataResults[dataIndex] as D;
};

let isLoading = false;

export const isPokeapiDataLoaded = () =>
  staticDataResults.length === staticDataFns.length;

export const initializePokeapiData = async (): Promise<boolean> => {
  if (isLoading) {
    return false;
  }

  isLoading = true;

  console.log("Start loading data...");

  // const cachedDb = createDB({}); // temp DB with cache

  console.log("Loading static data: " + staticDataFns.length + " fns to load");
  console.log("Initial data length:", staticDataResults.length);

  for (let i = 0; i < staticDataFns.length; i++) {
    console.time("Fn " + i);
    staticDataResults[i] = await staticDataFns[i]();
    console.timeEnd("Fn " + i);
  }

  console.log("Loading finished");

  // cachedDb.close();

  isLoading = false;

  return true;
};

import React from "react";
import { StaticDataLoading } from "./static-data-loading";

const staticDataFns: Record<string, () => Promise<unknown>> = {};

const staticDataContext = React.createContext<Record<string, unknown>>({});

export const StaticDataProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const loadingRef = React.useRef(false);
  const [staticDataResults, setStaticDataResults] = React.useState<
    Record<string, unknown>
  >({});

  React.useEffect(() => {
    if (loadingRef.current) {
      return;
    }

    const asyncFn = async () => {
      loadingRef.current = true;

      const keys = Object.keys(staticDataFns);

      console.log("Loading static data: " + keys.length + " fns to load");

      const dataResults: Record<string, unknown> = {};
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        console.time("Fn " + i);
        dataResults[key] = await staticDataFns[key]();
        setStaticDataResults({ ...dataResults });
        console.timeEnd("Fn " + i);
      }
      // setStaticDataResults(dataResults);

      loadingRef.current = false;

      console.log("Loading finished");
    };

    if (Object.keys(staticDataResults).length === 0) {
      asyncFn();
    }
  }, [staticDataResults]);

  const fnKeys = Object.keys(staticDataFns);
  const resultKeys = Object.keys(staticDataResults);

  if (fnKeys.length === 0 || resultKeys.length < fnKeys.length) {
    return (
      <StaticDataLoading step={resultKeys.length} maxStep={fnKeys.length} />
    );
  }

  return (
    <staticDataContext.Provider value={staticDataResults}>
      {children}
    </staticDataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const prepareStaticData = function <D>(
  key: string,
  fn: () => Promise<D>
): () => D {
  staticDataFns[key] = fn;

  return () => {
    const allDatas = React.useContext(staticDataContext);
    const value = allDatas[key] as D;

    if (!value) {
      console.log(
        staticDataFns.length,
        allDatas.length,
        staticDataFns,
        allDatas
      );
      throw new Error("Static data not available, key=" + key);
    }

    return value;
  };
};

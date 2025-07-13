/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { StaticDataLoading } from "./static-data-loading";

const staticDataFns: (() => Promise<unknown>)[] = [];

const staticDataContext = React.createContext<unknown[]>([]);

export const StaticDataProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const loadingRef = React.useRef(false);
  const [staticDataResults, setStaticDataResults] = React.useState<unknown[]>(
    []
  );

  React.useEffect(() => {
    if (loadingRef.current) {
      return;
    }

    const asyncFn = async () => {
      loadingRef.current = true;

      console.log(
        "Loading static data: " + staticDataFns.length + " fns to load"
      );

      const dataResults: unknown[] = [];
      for (let i = 0; i < staticDataFns.length; i++) {
        console.time("Fn " + i);
        dataResults.push(await staticDataFns[i]());
        setStaticDataResults([...dataResults]);
        console.timeEnd("Fn " + i);
      }
      // setStaticDataResults(dataResults);

      loadingRef.current = false;

      console.log("Loading finished");
    };

    if (staticDataResults.length === 0 && staticDataFns.length > 0) {
      asyncFn();
    }
  }, [staticDataResults]);

  if (
    staticDataFns.length > 0 &&
    staticDataResults.length < staticDataFns.length
  ) {
    return (
      <StaticDataLoading
        step={staticDataResults.length}
        maxStep={staticDataFns.length}
      />
    );
  }

  return (
    <staticDataContext.Provider value={staticDataResults}>
      {children}
    </staticDataContext.Provider>
  );
};

export const prepareStaticData = function <D>(fn: () => Promise<D>): () => D {
  const dataIndex = staticDataFns.length;
  staticDataFns.push(fn);

  return () => React.useContext(staticDataContext)[dataIndex] as D;
};

import React from "react";
import {
  initializePokeapiData,
  isPokeapiDataLoaded,
} from "../pokeapi/pokeapi-data";

export const DataLoading: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [loaded, setLoaded] = React.useState(isPokeapiDataLoaded());

  const finalLoaded = isPokeapiDataLoaded();

  React.useEffect(() => {
    initializePokeapiData().then((success) => success && setLoaded(true));
  }, []);

  if (finalLoaded) {
    return children;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 32,
      }}
    >
      Loading static data...
    </div>
  );
};

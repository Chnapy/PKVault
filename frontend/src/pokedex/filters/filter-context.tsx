import React from "react";
import type { DexItemDTO } from "../../data/sdk/model";

type FilterKey =
  | "speciesName"
  | "types"
  | "seen"
  | "caught"
  | "generations"
  | "fromGames";

type FilterFn = (data: DexItemDTO) => boolean;

export type FilterContextValue = {
  value: {
    [key in FilterKey]?: FilterFn;
  };
  setValue: React.Dispatch<React.SetStateAction<FilterContextValue["value"]>>;
};

const filterContext = React.createContext<FilterContextValue>({
  value: {},
  setValue: () => void 0,
});

// eslint-disable-next-line react-refresh/only-export-components
const Provider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [value, setValue] = React.useState<FilterContextValue["value"]>({});

  return (
    <filterContext.Provider value={{ value, setValue }}>
      {children}
    </filterContext.Provider>
  );
};

export const FilterContext = {
  Provider,
  useValue: () => React.useContext(filterContext),
  useDispatchByKey: (filterKey: FilterKey, valueFn: FilterFn | undefined) => {
    const { setValue } = FilterContext.useValue();
    setValue((filterValue) => {
      return {
        ...filterValue,
        [filterKey]: valueFn,
      };
    });
  },
};

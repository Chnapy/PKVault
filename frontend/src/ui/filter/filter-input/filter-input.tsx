import type React from "react";
import {
  FilterLabel,
  type FilterLabelProps,
} from "../filter-label/filter-label";
import { Input } from "@headlessui/react";
import { css } from "@emotion/css";

export type FilterInputProps = FilterLabelProps &
  React.InputHTMLAttributes<HTMLInputElement>;

export const FilterInput: React.FC<FilterInputProps> = ({
  enabled,
  children,
  ...props
}) => {
  return (
    <FilterLabel enabled={enabled}>
      {children}

      <Input
        type="text"
        className={css({
          display: "block",
          marginLeft: -2,
          marginRight: -2,
          borderRadius: 4,
          border: "none",
          padding: 4,
        })}
        {...props}
      />
    </FilterLabel>
  );
};

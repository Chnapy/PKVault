import { css } from "@emotion/css";
import { Input } from "@headlessui/react";
import type React from "react";
import {
  FilterLabel,
  type FilterLabelProps,
} from "../filter-label/filter-label";

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
          marginBottom: 2,
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

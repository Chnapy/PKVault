import { css } from "@emotion/css";
import { Checkbox, type CheckboxProps } from "@headlessui/react";
import type React from "react";
import {
  FilterLabel,
  type FilterLabelProps,
} from "../filter-label/filter-label";

export type FilterCheckboxProps = FilterLabelProps & CheckboxProps;

export const FilterCheckbox: React.FC<FilterCheckboxProps> = ({
  enabled,
  children,
  ...props
}) => {
  return (
    <FilterLabel enabled={enabled}>
      <Checkbox
        className={css({
          color: "inherit",
          background: "inherit",
          display: "block",
          margin: "-2px -4px",
          borderRadius: 4,
          border: "none",
          padding: "2px 4px",
        })}
        {...props}
      >
        {children}
      </Checkbox>
    </FilterLabel>
  );
};

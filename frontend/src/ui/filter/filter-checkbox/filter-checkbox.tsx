import { css } from "@emotion/css";
import { Checkbox, type CheckboxProps } from "@headlessui/react";
import React from "react";
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
  // const [state, setState] = React.useState<'checked' | 'unchecked' | 'indeterminate'>('indeterminate');

  return (
    <FilterLabel enabled={enabled}>
      <Checkbox
        className={css({
          color: "inherit",
          background: "inherit",
          display: "flex",
          alignItems: 'center',
          margin: "-2px -4px",
          borderRadius: 4,
          border: "none",
          padding: "2px 6px",
          gap: 4,
        })}
        {...props}
      >
        {children}
      </Checkbox>
    </FilterLabel>
  );
};

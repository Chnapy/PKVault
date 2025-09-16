import { css } from "@emotion/css";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  type ListboxProps,
} from "@headlessui/react";
import React from "react";
import {
  FilterLabel,
  type FilterLabelProps,
} from "../filter-label/filter-label";
import { TitledContainer } from '../../container/titled-container';

export type FilterSelectProps = FilterLabelProps &
  ListboxProps<React.ElementType, string[]> & {
    options: { value: string; label: React.ReactNode }[];
  };

export const FilterSelect: React.FC<FilterSelectProps> = ({
  enabled,
  options,
  children,
  ...props
}) => {
  const rootRef = React.useRef<HTMLDivElement>(null);

  const hasValue = (value: string) => (props.value ?? []).includes(value);

  return (
    <div ref={rootRef}>
      <FilterLabel enabled={enabled}>
        <Listbox {...props} onChange={props.onChange && ((value: string[] | string) => {
          const values = typeof value === 'string' ? [ value ] : value;
          props.onChange?.(values);
        })}>
          <ListboxButton
            className={css({
              color: "inherit",
              background: "inherit",
              display: "block",
              margin: "-2px -4px",
              borderRadius: 4,
              border: "none",
              padding: "2px 4px",
              cursor: "pointer",
            })}
          >
            {children}
            {/* {' '}{options
            .filter((option) => 
              hasValue(option.value)
            )
            .map((option) => option.label)
            .join(", ")} */}
          </ListboxButton>

          <ListboxOptions anchor="bottom" style={{ zIndex: 30 }}>
            <TitledContainer
              contrasted
              title={'Box selection'}
            // style={{ margin: 2, marginTop: 6 }}
            >
              {options.map(({ value, label }, i) => (
                <ListboxOption
                  key={value}
                  value={value}
                  style={{ marginTop: i ? 2 : 0 }}
                >
                  <FilterLabel
                    enabled={hasValue(value)}
                    className={css({
                      // display: "block",
                    })}
                  >
                    {label}
                  </FilterLabel>
                </ListboxOption>
              ))}
            </TitledContainer>
          </ListboxOptions>
        </Listbox>
      </FilterLabel>
    </div>
  );
};

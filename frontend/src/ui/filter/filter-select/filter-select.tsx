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
import { useTriggerOnHover } from '../../button/hooks/use-trigger-on-hover';
import { Icon } from '../../icon/icon';

export type FilterSelectProps = FilterLabelProps &
  ListboxProps<React.ElementType, string[]> & {
    options: { value: string; label: React.ReactNode }[];
    triggerOnHover?: boolean;
  };

export const FilterSelect: React.FC<FilterSelectProps> = ({
  enabled,
  options,
  children,
  triggerOnHover,
  ...props
}) => {
  const rootRef = React.useRef<HTMLDivElement>(null);

  const hasValue = (value: string) => (props.value ?? []).includes(value);

  const getHoverEventHandler = useTriggerOnHover(triggerOnHover && !props.disabled);

  return (
    <div
      ref={rootRef}
      onPointerLeave={getHoverEventHandler(() => {
        document.body.dispatchEvent(new MouseEvent('pointerdown'));
        document.body.dispatchEvent(new MouseEvent('pointerup'));
      })}
    >
      <FilterLabel enabled={enabled}>
        <Listbox {...props} onChange={props.onChange && ((value: string[] | string) => {
          const values = typeof value === 'string' ? [ value ] : value;
          props.onChange?.(values);
        })}>
          <ListboxButton
            className={css({
              color: "inherit",
              background: "inherit",
              display: "flex",
              margin: "-2px -4px",
              borderRadius: 4,
              border: "none",
              padding: "2px 4px",
              gap: 2,
              cursor: "pointer",
            })}
            onPointerEnter={getHoverEventHandler((ev) => {
              (ev.target as HTMLElement).click();
            })}
            onPointerLeave={getHoverEventHandler(() => null)}
          >
            {children}
            <Icon name='angle-down' forButton />
          </ListboxButton>

          <ListboxOptions anchor="bottom" style={{ zIndex: 30 }}>
            <TitledContainer
              contrasted
              title={'Box selection'}
              maxHeight={300}
            // style={{ margin: 2, marginTop: 6 }}
            >
              {options.map(({ value, label }, i) => (
                <ListboxOption
                  key={value}
                  value={value}
                  style={{ marginTop: i ? 2 : 0 }}
                  onPointerEnter={getHoverEventHandler((ev) => {
                    (ev.target as HTMLElement).click();
                  })}
                  onPointerLeave={getHoverEventHandler(() => null)}
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

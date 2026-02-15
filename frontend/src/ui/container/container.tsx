/* eslint-disable @typescript-eslint/no-unused-vars */
import { css, cx } from "@emotion/css";
import React from "react";
import { switchUtil } from "../../util/switch-util";
import { theme } from "../theme";

const root = (props: ContainerProps) =>
  css({
    backgroundColor: theme.bg.default,
    border: `1px solid ${theme.border.default}`,
    padding: switchUtil(props.padding ?? "default", {
      small: 1,
      default: 2,
      big: 4,
    }),
    borderRadius: switchUtil(props.padding ?? "default", {
      small: 2,
      default: 4,
      big: 8,
    }),
    filter: props.noDropshadow
      ? undefined
      : `drop-shadow(${props.padding === "big" ? 2 : 1}px ${props.padding === "big" ? 2 : 1}px 0 rgba(0,0,0,.2))`,
    "&:not(:disabled)": {
      cursor:
        (props.componentDescriptor ?? props.type ?? props.as) === "button" && !props.selected
          ? "pointer"
          : undefined,
      "&:hover:not(:active)":
        (props.componentDescriptor ?? props.type ?? props.as) === "button" && !props.selected
          ? {
            outlineWidth: 1,
          }
          : undefined,
    },
    outline: `0 solid ${theme.border.focus}`,
    outlineWidth: props.selected ? 2 : undefined,
    "&:disabled": {
      opacity: 0.5,
    },
  });

export type ContainerOwnProps = {
  ref?: React.Ref<never>;
  componentDescriptor?: React.HTMLElementType;
  className?: string;
  padding?: "small" | "default" | "big";
  borderRadius?: "small" | "default" | "big";
  noDropshadow?: boolean;
  selected?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReactTag = keyof React.JSX.IntrinsicElements | React.JSXElementConstructor<any>;

export type ContainerProps<
  AS extends ReactTag = ReactTag,
> = ContainerOwnProps & {
  as?: AS;
} & React.ComponentProps<AS>;

export function Container<
  AS extends ReactTag = "div",
>({
  className,
  children,
  ...props
}: React.PropsWithChildren<ContainerProps<AS>>) {
  const {
    as,
    padding,
    borderRadius,
    noDropshadow,
    componentDescriptor,
    ...componentProps
  } = props;

  const Component: ReactTag = as ?? "div";

  return (
    <Component
      className={cx(root(props), className)}
      {...componentProps}
    >
      {children}
    </Component>
  );
}

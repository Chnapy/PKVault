/* eslint-disable @typescript-eslint/no-unused-vars */
import { css, cx } from "@emotion/css";
import React from "react";
import { switchUtil } from "../../util/switch-util";
import { theme } from "../theme";

const root = (props: ContainerProps) =>
  css({
    display: "inline-block",
    backgroundColor: theme.bg.default,
    border: theme.border.default,
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
    // transition: ".2s outline-width",
    "&:not(:disabled)": {
      cursor:
        (props.componentDescriptor ?? props.as) === "button" && !props.selected
          ? "pointer"
          : undefined,
      "&:hover:not(:active)":
        (props.componentDescriptor ?? props.as) === "button" && !props.selected
          ? {
              // outline: `2px dashed ${theme.border.contrast}`,
              outlineWidth: 1,
            }
          : undefined,
    },
    outline: `0 solid ${theme.border.contrast}`,
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

export type ContainerProps<
  AS extends React.HTMLElementType | React.ComponentType =
    | React.HTMLElementType
    | React.ComponentType,
> = ContainerOwnProps & {
  as?: AS;
} & (AS extends React.HTMLElementType
    ? React.JSX.IntrinsicElements[AS]
    : React.ComponentProps<AS>);

export function Container<
  AS extends React.HTMLElementType | React.ComponentType = "div",
>({
  className,
  children,
  ...props
}: React.PropsWithChildren<ContainerProps<AS>>) {
  const Component: React.HTMLElementType | React.ComponentType =
    props.as ?? "div";

  const {
    padding,
    borderRadius,
    noDropshadow,
    componentDescriptor,
    ...componentProps
  } = props;

  return (
    <Component
      className={cx(root(props), className)}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(componentProps as any)}
    >
      {children}
    </Component>
  );
}

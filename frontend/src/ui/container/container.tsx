import { css, cx } from "@emotion/css";
import type React from "react";
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
      : "drop-shadow(1px 1px 0 rgba(0,0,0,.2))",
    transition: ".2s transform",
    cursor: props.as === "button" && !props.selected ? "pointer" : undefined,
    "&:hover:not(:active)":
      props.as === "button" && !props.selected
        ? {
            transform: "scale(1.05)",
          }
        : undefined,
    outline: props.selected ? `2px solid ${theme.border.contrast}` : undefined,
  });

export type ContainerOwnProps = {
  className?: string;
  padding?: "small" | "default" | "big";
  borderRadius?: "small" | "default" | "big";
  noDropshadow?: boolean;
  selected?: boolean;
};

export type ContainerProps<
  AS extends React.HTMLElementType = React.HTMLElementType,
> = ContainerOwnProps & {
  as?: AS;
} & React.JSX.IntrinsicElements[AS];

export function Container<AS extends React.HTMLElementType = "div">({
  className,
  children,
  ...props
}: React.PropsWithChildren<ContainerProps<AS>>) {
  const Component: React.HTMLElementType = props.as ?? "div";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { padding, borderRadius, noDropshadow, ...componentProps } = props;

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

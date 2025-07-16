import { css, cx } from "@emotion/css";
import type React from "react";
import { Container, type ContainerProps } from "../container/container";
import { theme } from "../theme";

export type ButtonProps<
  AS extends React.HTMLElementType | React.ComponentType =
    | React.HTMLElementType
    | React.ComponentType,
> = React.PropsWithChildren<{
  onClick?: () => void;
  bgColor?: string;
}> &
  ContainerProps<AS>;

export function Button<
  AS extends React.HTMLElementType | React.ComponentType = "button",
>({
  as = "button" as AS,
  className,
  onClick,
  bgColor = theme.bg.dark,
  children,
  ...restProps
}: ButtonProps<AS>) {
  return (
    // @ts-expect-error typing complexity due to 'as' concept
    <Container<AS>
      as={as}
      className={cx(
        css({
          display: "flex",
          alignItems: "stretch",
        }),
        className
      )}
      onClick={onClick}
      {...restProps}
    >
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: 1,
          backgroundColor: bgColor,
          borderRadius: 4,
          color: theme.text.light,
          textShadow: "1px 1px 0px rgba(255,255,255,0.2)",
          padding: "2px 4px",
        })}
      >
        {children}
      </div>
    </Container>
  );
}

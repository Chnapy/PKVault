import { css } from "@emotion/css";
import type React from "react";
import { Container } from "../container/container";
import { theme } from "../theme";

export type ButtonProps = React.PropsWithChildren<{
  className?: string;
  onClick: () => void;
  bgColor?: string;
  selected?: boolean;
}>;

export const Button: React.FC<ButtonProps> = ({
  className,
  onClick,
  bgColor = theme.bg.dark,
  selected,
  children,
}) => {
  return (
    <Container
      as="button"
      className={className}
      onClick={onClick}
      selected={selected}
      // padding="small"
      // borderRadius="small"
    >
      <div
        className={css({
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
};

import { css } from "@emotion/css";
import type React from "react";
import { Container } from "../../container/container";
import { theme } from "../../theme";

export type FilterLabelProps = React.PropsWithChildren<{
  className?: string;
  enabled: boolean;
}>;

export const FilterLabel: React.FC<FilterLabelProps> = ({
  className,
  enabled,
  children,
}) => {
  return (
    <Container as="label" className={className}>
      <div
        className={css({
          backgroundColor: theme.bg.filter,
          borderRadius: 4,
          paddingRight: enabled ? 8 : 0,
        })}
      >
        <div
          style={{
            backgroundColor: theme.bg.dark,
            borderRadius: 4,
            color: theme.text.light,
            textShadow: "1px 1px 0px rgba(255,255,255,0.2)",
            padding: "2px 4px",
            paddingRight: enabled ? 4 : 12,
            textAlign: "left",
          }}
        >
          {children}
        </div>
      </div>
    </Container>
  );
};

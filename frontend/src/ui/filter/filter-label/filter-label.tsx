import { css } from "@emotion/css";
import type React from "react";
import { theme } from "../../theme";
import { Button } from '../../button/button';

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
    <Button<'label'> as="label" className={className}>
      <div
        className={css({
          flexGrow: 1,
          backgroundColor: theme.bg.filter,
          paddingRight: enabled ? 8 : 0,
          margin: '-2px -4px'
        })}
      >
        <div
          style={{
            backgroundColor: theme.bg.darker,
            borderRadius: 4,
            color: theme.text.light,
            textShadow: "1px 1px 0px rgba(255,255,255,0.2)",
            padding: "2px 4px",
            paddingRight: enabled ? undefined : 12,
            textAlign: "left",
          }}
        >
          {children}
        </div>
      </div>
    </Button>
  );
};

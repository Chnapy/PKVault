import { css, cx } from '@emotion/css';
import type React from "react";
import { theme } from "../theme";

export type TextContainerProps = {
  noWrap?: boolean;
  bgColor?: string;
  maxHeight?: number;
}
  & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const TextContainer: React.FC<React.PropsWithChildren<TextContainerProps>> = ({
  noWrap,
  bgColor = theme.bg.info,
  maxHeight,
  children,
  ...rest
}) => {
  return (
    <div
      {...rest}
      className={cx(
        'text-container',
        css({
          padding: 4,
          borderRadius: 8,
          background: bgColor,
          overflow: 'hidden',
          flexGrow: 1,
          display: 'flex',
          ...rest.style,
        })
      )}
    >
      <div
        style={{
          padding: "3px 8px",
          backgroundColor: theme.bg.default,
          borderRadius: 4,
          flexGrow: 1,
          // width: "100%",
          overflow: 'hidden',
          color: theme.text.default,
          overflowY: 'auto',
          maxHeight,
        }}
      >
        <div
          style={{
            paddingLeft: 3,
            marginLeft: -2,
            backgroundImage: `linear-gradient(to right, ${theme.bg.default} 4px, transparent 1px), linear-gradient(${theme.border.lines} 1px, transparent 1px)`,
            backgroundSize: "8px 19px",
            lineHeight: "19px",
            minHeight: "100%",
            position: "relative",
            whiteSpace: 'break-spaces',
            ...noWrap ? {
              whiteSpace: 'nowrap',
              overflowX: 'auto',
            } : null
          }}
        >
          <div
            style={{
              display: "block",
              background: theme.bg.default,
              height: 1,
            }}
          />
          {children}
        </div>
      </div>
    </div>
  );
};

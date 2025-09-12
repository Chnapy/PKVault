import { css, cx } from "@emotion/css";
import React from "react";
import { Container, type ContainerProps, type ReactTag } from "../container/container";
import { theme } from "../theme";
import { Icon } from '../icon/icon';

export type ButtonProps<
  AS extends ReactTag = ReactTag,
> = React.PropsWithChildren<{
  onClick?: React.MouseEventHandler;
  bgColor?: string;
  big?: boolean;
  disabled?: boolean;
}> &
  Omit<ContainerProps<AS>, 'disabled'>;

export function Button<
  AS extends ReactTag = "button",
>({
  as = "button" as AS,
  className,
  onClick,
  bgColor = theme.bg.darker,
  big,
  disabled,
  children,
  ...restProps
}: ButtonProps<AS>) {
  const [ loading, setLoading ] = React.useState(false);

  disabled = disabled || loading;

  const finalOnClick: React.MouseEventHandler | undefined = !disabled && onClick
    ? ((e) => {
      const result: unknown = onClick(e);
      if (result instanceof Promise) {
        setLoading(true);
        result.finally(() => {
          setLoading(false);
        });
      }
    })
    : undefined;

  return (
    // @ts-expect-error typing complexity due to 'as' concept
    <Container<AS>
      as={as}
      className={cx(
        css({
          display: "flex",
          alignItems: "stretch",
          borderColor: bgColor,
          fontSize: '1rem',
          opacity: disabled ? 0.5 : undefined,
          pointerEvents: disabled ? 'none' : undefined,
        }),
        className
      )}
      onClick={finalOnClick}
      {...restProps}
    >
      <div
        className={css({
          display: "flex",
          flexGrow: 1,
          backgroundColor: bgColor,
          borderRadius: 4,
          color: theme.text.light,
          textShadow: theme.shadow.textlight,
          padding: big ? "8px 16px" : `2px 4px`,
          minWidth: 'calc(1lh - 4px)',
        })}
      >
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            opacity: loading ? 0 : undefined,
          })}
        >
          {children}
        </div>

        {loading && <Icon
          name='spinner-third'
          className={css({
            position: 'absolute',
            left: 'calc(50% - 1lh / 2)',
            top: 'calc(50% - 1lh / 2)',
            animation: 'spin 1s linear infinite',

            '@keyframes spin': {
              '0%': {
                transform: 'rotate(0deg)'
              },
              '100%': {
                transform: 'rotate(360deg)'
              },
            }
          })}
        />}
      </div>
    </Container>
  );
}

import { css, cx } from "@emotion/css";
import React from "react";
import { Container, type ContainerProps, type ReactTag } from "../container/container";
import { Icon } from '../icon/icon';
import { useTriggerOnHover } from './hooks/use-trigger-on-hover';

export type ButtonLikeProps<
  AS extends ReactTag = ReactTag,
> = React.PropsWithChildren<{
  onClick?: React.MouseEventHandler;
  loading?: boolean;
  disabled?: boolean;
  spinColor?: string;
  triggerOnHover?: boolean;
}> &
  Omit<ContainerProps<AS>, 'disabled'>;

export function ButtonLike<
  AS extends ReactTag = "button",
>({
  as = "button" as AS,
  className,
  onClick,
  loading,
  disabled,
  spinColor,
  triggerOnHover,
  children,
  ...restProps
}: ButtonLikeProps<AS>) {
  const [ loadingState, setLoadingState ] = React.useState(false);

  loading = loading || loadingState;

  disabled = disabled || loading;

  const finalOnClick: React.MouseEventHandler | undefined = !disabled && onClick
    ? ((e) => {
      const result: unknown = onClick(e);
      if (result instanceof Promise) {
        setLoadingState(true);
        result.finally(() => {
          setLoadingState(false);
        });
      }
    })
    : undefined;

  const getHoverEventHandler = useTriggerOnHover(triggerOnHover && !disabled);

  return (
    <Container<'button'>
      as={as}
      type='button'
      className={cx(
        css({
          position: 'relative',
          pointerEvents: disabled ? 'none' : undefined,
          cursor: 'pointer',
        }),
        className
      )}
      onClick={finalOnClick}
      onPointerEnter={getHoverEventHandler(ev => {
        (ev.target as HTMLElement).click();
      })}
      onPointerLeave={getHoverEventHandler(() => null)}
      {...restProps}
    >
      <div
        className={css({
          display: "flex",
          flexGrow: 1,
          maxWidth: '100%',
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.5 : undefined,
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
          color: spinColor,
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
    </Container>
  );
}

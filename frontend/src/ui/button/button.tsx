import { css, cx } from "@emotion/css";
import { createLink } from '@tanstack/react-router';
import { type ReactTag } from "../container/container";
import { theme } from "../theme";
import { ButtonLike, type ButtonLikeProps } from './button-like';

export type ButtonProps<
  AS extends ReactTag = ReactTag,
> = {
  bgColor?: string;
  big?: boolean;
} & ButtonLikeProps<AS>;

export function Button<
  AS extends ReactTag = "button",
>({
  as = "button" as AS,
  className,
  bgColor = theme.bg.darker,
  big,
  children,
  ...restProps
}: ButtonProps<AS>) {
  return (
    // @ts-expect-error typing complexity due to 'as' concept
    <ButtonLike<AS>
      as={as}
      // loading
      {...restProps}
      className={cx(
        css({
          display: "flex",
          alignItems: "stretch",
          borderColor: bgColor,
          color: theme.text.light,
          textShadow: theme.shadow.textlight,
          fontSize: '1rem',
        }),
        className
      )}
      spinColor={bgColor}
    >
      <div
        className={css({
          display: "flex",
          flexGrow: 1,
          backgroundColor: bgColor,
          borderRadius: 4,
          padding: big ? "8px 16px" : `2px 4px`,
          minWidth: 'calc(1lh - 4px)',
          overflow: 'hidden'
        })}
      >
        <div
          className={css({
            display: "flex",
            flexGrow: 1,
            maxWidth: '100%',
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          })}
        >
          {children}
        </div>
      </div>
    </ButtonLike>
  );
}

const ButtonForLink: typeof Button = props => <Button<'a'> {...props} as='a' />;
export const ButtonLink = createLink(ButtonForLink);

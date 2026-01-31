import { css, cx } from '@emotion/css';
import React from "react";
import type { EntityContext } from '../../data/sdk/model';
import { useTranslate } from '../../translate/i18n';
import { type ButtonLikeProps } from '../button/button-like';
import { ButtonWithDisabledPopover, type ButtonWithDisabledPopoverProps } from '../button/button-with-disabled-popover';
import { DetailsLevel } from '../details-card/details-level';
import { ItemImg } from '../details-card/item-img';
import { SpeciesImg } from '../details-card/species-img';
import { AlphaIcon } from '../icon/alpha-icon';
import { Icon } from '../icon/icon';
import { ShinyIcon } from '../icon/shiny-icon';
import { CheckboxInput, type CheckboxInputProps } from '../input/checkbox-input';
import { theme } from '../theme';

export type StorageItemProps =
  & ButtonLikeProps
  & Pick<ButtonWithDisabledPopoverProps<never>, 'anchor' | 'helpTitle'>
  & {
    species: number;
    context: EntityContext;
    form: number;
    isFemale?: boolean;
    isEgg?: boolean;
    isAlpha?: boolean;
    isShiny?: boolean;
    isShadow?: boolean;
    isStarter?: boolean;
    heldItem?: number;
    warning?: boolean;
    level?: number;
    party?: number;
    nbrVersions?: number;
    hasDisabledVersion?: boolean;
    small?: boolean;
    checked?: boolean;
    onCheck?: CheckboxInputProps[ 'onChange' ];

    // actions
    canCreateVersion?: boolean;
    canMoveOutside?: boolean;
    canEvolve?: boolean;
    attached?: boolean;
    needSynchronize?: boolean;
  };

export const StorageItem: React.FC<StorageItemProps> = React.memo(({
  species,
  context,
  form,
  isFemale,
  isEgg,
  isAlpha,
  isShiny,
  isShadow,
  isStarter,
  heldItem = 0,
  warning,
  level,
  party,
  nbrVersions = 1,
  hasDisabledVersion,
  anchor,
  helpTitle,
  small,
  checked = false,
  onCheck,

  canCreateVersion,
  canMoveOutside = true,
  canEvolve,
  attached,
  needSynchronize,

  ...rest
}) => {
  const { t } = useTranslate();

  const renderBubble = (bgColor: string | undefined, children: React.ReactNode) => <div className={css({
    width: 20,
    height: 20,
    borderRadius: 99,
    color: bgColor ? theme.text.light : undefined,
    backgroundColor: bgColor,
    fontSize: bgColor ? '80%' : undefined,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  })}>{children}</div>;

  return (
    <ButtonWithDisabledPopover
      componentDescriptor='button'
      {...rest}
      noDropshadow={!rest.onClick}
      rootClassName={css({
        '&:hover .checkbox': {
          opacity: 1,
        },
      })}
      className={cx(css({
        backgroundColor: rest.disabled ? 'transparent' : theme.bg.light,
        borderColor: rest.disabled ? undefined : theme.text.default,
        position: 'relative',
        alignSelf: "flex-start",
        padding: 0,
        overflow: 'hidden',
      }), rest.className)}
      anchor={anchor}
      showHelp={!!helpTitle}
      helpTitle={helpTitle}
      extraContent={
        onCheck && !rest.disabled && !rest.loading && <div
          title={t('storage.actions.select.help')}
          className={cx('checkbox', css({
            position: 'absolute',
            top: 3,
            left: 3,
          }))}
          style={{ opacity: checked ? undefined : 0 }}
        >
          <CheckboxInput
            checked={checked}
            onChange={onCheck}
          />
        </div>
      }
    >
      <SpeciesImg species={species} context={context} form={form} isFemale={isFemale} isShiny={isShiny} isEgg={isEgg} isShadow={isShadow} small={small} />

      {heldItem > 0 && <ItemImg
        item={heldItem}
        size={small ? 15 : undefined}
        className={css({
          position: 'absolute',
          bottom: 0,
          left: 0,
        })}
      />}

      <div className={css({
        position: 'absolute',
        bottom: 2,
        right: 2,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 2
      })}>
        {isStarter && renderBubble(theme.bg.red, <Icon name='heart' solid forButton />)}

        {party !== undefined && renderBubble(theme.bg.green, party + 1)}

        {level !== undefined && <div className={css({
          backgroundColor: 'rgba(255,255,255,0.4)',
          marginBottom: -4
        })}>
          {small ? level : <DetailsLevel level={level} />}
        </div>}

        {hasDisabledVersion || nbrVersions > 1
          ? <div className={css({
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          })}>
            {hasDisabledVersion && renderBubble(undefined, <span className={css({ color: theme.text.red })}>
              <Icon name='folder' solid forButton />
              <Icon name='exclaimation' solid forButton />
            </span>)}
            {nbrVersions > 1 && renderBubble(theme.bg.dark, nbrVersions)}
          </div>
          : null}
      </div>

      <div
        className={css({
          position: 'absolute',
          top: 2,
          right: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          textAlign: 'center',
          maxWidth: 72,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        })}
      >
        {isAlpha && <AlphaIcon className={small ? css({ height: 15 }) : undefined} />}

        {isShiny && <ShinyIcon className={small ? css({ height: 15 }) : undefined} />}

        {!canMoveOutside && renderBubble(theme.bg.red, <Icon name='logout' solid forButton />)}

        {canEvolve && renderBubble(theme.bg.primary, <Icon name='sparkles' solid forButton />)}

        {attached && renderBubble(needSynchronize ? theme.bg.yellow : undefined,
          <Icon name='link' solid forButton />)}

        {canCreateVersion && renderBubble(theme.bg.primary, <Icon name='plus' solid forButton />)}

        {warning && renderBubble(theme.bg.yellow, <Icon name='exclaimation' solid forButton />)}
      </div>
    </ButtonWithDisabledPopover>
  );
});

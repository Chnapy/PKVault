import { css, cx } from '@emotion/css';
import React from "react";
import { getApiFullUrl } from '../../data/mutator/custom-instance';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';
import { type ButtonLikeProps } from '../button/button-like';
import { ButtonWithDisabledPopover, type ButtonWithDisabledPopoverProps } from '../button/button-with-disabled-popover';
import { DetailsLevel } from '../details-card/details-level';
import { SpeciesImg } from '../details-card/species-img';
import { Icon } from '../icon/icon';
import { ShinyIcon } from '../icon/shiny-icon';
import { CheckboxInput, type CheckboxInputProps } from '../input/checkbox-input';
import { theme } from '../theme';

export type StorageItemProps =
  & ButtonLikeProps
  & Pick<ButtonWithDisabledPopoverProps<never>, 'anchor' | 'helpTitle'>
  & {
    species: number;
    generation: number;
    form: number;
    isFemale?: boolean;
    isEgg?: boolean;
    isShiny?: boolean;
    isShadow?: boolean;
    heldItem?: number;
    warning?: boolean;
    level?: number;
    nbrVersions?: number;
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
  generation,
  form,
  isFemale,
  isEgg,
  isShiny,
  isShadow,
  heldItem = 0,
  warning,
  level,
  nbrVersions = 1,
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
  const staticData = useStaticData();

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
      style={{
        backgroundColor: rest.disabled ? 'transparent' : theme.bg.light,
        borderColor: rest.disabled ? undefined : theme.text.default,
        position: 'relative',
        alignSelf: "flex-start",
        padding: 0,
        overflow: 'hidden',
        ...rest.style,
      }}
      anchor={anchor}
      showHelp={!!helpTitle}
      helpTitle={helpTitle}
      extraContent={
        onCheck && !rest.disabled && !rest.loading && <div
          title={t('storage.actions.select.help')}
          className={cx('checkbox', css({
            opacity: checked ? undefined : 0,
          }))}
          style={{
            position: 'absolute',
            top: 3,
            left: 3,
          }}
        >
          <CheckboxInput
            checked={checked}
            onChange={onCheck}
          />
        </div>
      }
    >
      <SpeciesImg species={species} generation={generation} form={form} isFemale={isFemale} isShiny={isShiny} isEgg={isEgg} isShadow={isShadow} small={small} />

      {heldItem > 0 && <img
        src={getApiFullUrl(staticData.items[ heldItem ]?.sprite ?? '')}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: small ? 15 : 30,
          height: small ? 15 : 30,
        }}
      />}

      <div style={{
        position: 'absolute',
        bottom: 2,
        right: 2,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 2
      }}>
        {level !== undefined && <div style={{
          backgroundColor: 'rgba(255,255,255,0.4)',
          marginBottom: -4
        }}>
          {small ? level : <DetailsLevel level={level} />}
        </div>}

        {nbrVersions > 1 && <div style={{
          width: 20,
          height: 20,
          borderRadius: 99,
          color: theme.text.light,
          backgroundColor: theme.bg.dark,
        }}>
          {nbrVersions}
        </div>}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 2,
          right: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          textAlign: 'center',
        }}
      >
        {isShiny && <ShinyIcon style={{ height: small ? 15 : undefined }} />}

        {!canMoveOutside && <div style={{
          width: 20,
          height: 20,
          borderRadius: 99,
          color: theme.text.light,
          backgroundColor: theme.bg.red,
        }}>
          <Icon name='logout' forButton />
        </div>}

        {canEvolve && <div style={{
          width: 20,
          height: 20,
          borderRadius: 99,
          color: theme.text.light,
          backgroundColor: theme.bg.primary,
        }}>
          <Icon name='sparkles' solid forButton />
        </div>}

        {attached && <div style={{
          width: 20,
          height: 20,
          borderRadius: 99,
          color: needSynchronize ? theme.text.light : undefined,
          backgroundColor: needSynchronize ? theme.bg.yellow : undefined,
        }}>
          <Icon name='link' forButton />
        </div>}

        {canCreateVersion && <div style={{
          width: 20,
          height: 20,
          borderRadius: 99,
          color: theme.text.light,
          backgroundColor: theme.bg.primary,
        }}>
          <Icon name='plus' solid forButton />
        </div>}

        {warning && <div style={{
          width: 20,
          height: 20,
          borderRadius: 99,
          color: theme.text.light,
          backgroundColor: theme.bg.yellow,
        }}>
          <Icon name='exclaimation' forButton />
        </div>}
      </div>
    </ButtonWithDisabledPopover>
  );
});

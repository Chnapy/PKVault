import React from "react";
import { getApiFullUrl } from '../../data/mutator/custom-instance';
import {
  getSaveInfosDownloadUrl,
  useSaveInfosGetAll
} from "../../data/sdk/save-infos/save-infos.gen";
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import { withErrorCatcher } from '../../error/with-error-catcher';
import { useTranslate } from '../../translate/i18n';
import { ButtonExternalLink } from '../../ui/button/button';
import { ButtonWithDisabledPopover, type ButtonWithDisabledPopoverProps } from '../../ui/button/button-with-disabled-popover';
import { Icon } from '../../ui/icon/icon';
import { SaveCardContentFull } from '../../ui/save-card/save-card-content-full';

export type SaveItemContentProps = {
  saveId: number;
  onClose?: () => void;
  showDelete?: boolean;
};

export const SaveItemContent: React.FC<SaveItemContentProps> = withErrorCatcher('default', ({
  saveId,
  onClose,
  showDelete,
}) => {
  const { t } = useTranslate();

  const settingsQuery = useSettingsGet();
  const saveInfosQuery = useSaveInfosGetAll();

  const settings = settingsQuery.data?.data;

  const downloadUrl = getApiFullUrl(getSaveInfosDownloadUrl(saveId));

  const save = saveInfosQuery.data?.data[ saveId ];
  if (!save) {
    return null;
  }

  const commonBtnProps: Omit<ButtonWithDisabledPopoverProps<'button'>, 'as'> = {
    disabled: !settings?.canDeleteSaves,
    showHelp: !settings?.canDeleteSaves,
    anchor: 'right start',
    helpTitle: t('action.not-possible'),
  };

  return <SaveCardContentFull
    id={save.id}
    generation={save.generation}
    version={save.version}
    trainerName={save.trainerName}
    trainerGenderMale={save.trainerGender === 0}
    tid={save.tid}
    path={save.path}
    lastWriteTime={save.lastWriteTime}
    playTime={save.playTime}
    dexSeenCount={save.dexSeenCount}
    dexCaughtCount={save.dexCaughtCount}
    ownedCount={save.ownedCount}
    shinyCount={save.shinyCount}
    actions={showDelete &&
      <>
        {commonBtnProps.disabled
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- type inference issue
          ? <ButtonWithDisabledPopover as={ButtonExternalLink as any} href={downloadUrl} download {...commonBtnProps}>
            <Icon name='download' forButton />
          </ButtonWithDisabledPopover>
          : <ButtonExternalLink href={downloadUrl} download>
            <Icon name='download' forButton />
          </ButtonExternalLink>}
      </>}
    onClose={onClose}
  />;
});

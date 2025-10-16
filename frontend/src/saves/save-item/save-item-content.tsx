import React from "react";
import { getApiFullUrl } from '../../data/mutator/custom-instance';
import {
  getSaveInfosDownloadUrl,
  useSaveInfosDelete,
  useSaveInfosGetAll
} from "../../data/sdk/save-infos/save-infos.gen";
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import { useTranslate } from '../../translate/i18n';
import { ButtonLink } from '../../ui/button/button';
import { ButtonWithConfirm } from '../../ui/button/button-with-confirm';
import { ButtonWithDisabledPopover, type ButtonWithDisabledPopoverProps } from '../../ui/button/button-with-disabled-popover';
import { Icon } from '../../ui/icon/icon';
import { SaveCardContentFull } from '../../ui/save-card/save-card-content-full';
import { theme } from '../../ui/theme';

export type SaveItemContentProps = {
  saveId: number;
  onClose?: () => void;
  showDelete?: boolean;
};

export const SaveItemContent: React.FC<SaveItemContentProps> = ({
  saveId,
  onClose,
  showDelete,
}) => {
  const { t } = useTranslate();

  const settingsQuery = useSettingsGet();
  const saveInfosQuery = useSaveInfosGetAll();
  const saveInfosDeleteMutation = useSaveInfosDelete();

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
        <ButtonWithDisabledPopover as={ButtonLink} to={downloadUrl} {...commonBtnProps}>
          <Icon name='download' forButton />
        </ButtonWithDisabledPopover>

        <ButtonWithDisabledPopover as={ButtonWithConfirm} onClick={() =>
          saveInfosDeleteMutation.mutateAsync({
            params: {
              saveId: save.id,
            },
          })} bgColor={theme.bg.red} {...commonBtnProps}>
          <Icon name='trash' solid forButton />
        </ButtonWithDisabledPopover>
      </>}
    onClose={onClose}
  />;
};

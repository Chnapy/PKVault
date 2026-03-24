import React from "react";
import { getApiFullUrl } from '../../data/mutator/custom-instance';
import {
  getSaveInfosDownloadUrl,
  useSaveInfosGetAll
} from "../../data/sdk/save-infos/save-infos.gen";
import { withErrorCatcher } from '../../error/with-error-catcher';
import { useDesktopMessage } from '../../settings/globs-input/hooks/use-desktop-message';
import { Button, ButtonExternalLink } from '../../ui/button/button';
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
  const saveInfosQuery = useSaveInfosGetAll();

  const desktopMessage = useDesktopMessage();

  const downloadUrl = getApiFullUrl(getSaveInfosDownloadUrl(saveId));

  const save = saveInfosQuery.data?.data[ saveId ];
  if (!save) {
    return null;
  }

  return <SaveCardContentFull
    id={save.id}
    context={save.context}
    version={save.version}
    trainerName={save.trainerName}
    trainerGender={save.trainerGender}
    tid={save.tid}
    sid={save.sid}
    path={save.path}
    lastWriteTime={save.lastWriteTime}
    playTime={save.playTime}
    language={save.language}
    dexSeenCount={save.dexSeenCount}
    dexCaughtCount={save.dexCaughtCount}
    ownedCount={save.ownedCount}
    shinyCount={save.shinyCount}
    actions={showDelete &&
      <>
        {desktopMessage
          ? <Button onClick={() => desktopMessage.openFile({
            type: 'open-folder',
            isDirectory: false,
            path: save.path
          })}>
            <Icon name='folder' solid forButton />
          </Button>
          : <ButtonExternalLink href={downloadUrl} download>
            <Icon name='download' forButton />
          </ButtonExternalLink>}
      </>}
    onClose={onClose}
  />;
});

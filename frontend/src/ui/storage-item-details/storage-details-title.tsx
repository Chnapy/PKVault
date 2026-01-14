import type React from 'react';
import type { GameVersion } from '../../data/sdk/model';
import { PathLine } from '../../settings/path-line';
import { Button } from '../button/button';
import { ButtonWithConfirm } from '../button/button-with-confirm';
import { DetailsTitle } from '../details-card/details-title';
import { Icon } from '../icon/icon';
import { theme } from '../theme';
import { StorageDetailsForm } from './storage-details-form';

export type StorageDetailsTitleProps = {
    isEnabled: boolean;
    filepath?: string;
    version: GameVersion | null;
    showVersionName?: boolean;
    canEdit: boolean;
    onRelease?: () => unknown;
    openFile?: () => unknown;
};

export const StorageDetailsTitle: React.FC<StorageDetailsTitleProps> = ({ isEnabled, filepath, version, showVersionName, canEdit, onRelease, openFile }) => {
    const formContext = StorageDetailsForm.useContext();

    return <DetailsTitle version={version} showVersionName={showVersionName && isEnabled}>
        {!isEnabled && version === null && filepath
            ? <PathLine>{filepath}</PathLine>
            : null}

        {openFile && <Button onClick={openFile}>
            <Icon name='folder' solid forButton />
        </Button>}

        <ButtonWithConfirm
            onClick={onRelease}
            disabled={!onRelease}
            bgColor={theme.bg.red}
        >
            <Icon name='trash' solid forButton />
        </ButtonWithConfirm>

        <Button
            onClick={formContext.startEdit}
            bgColor={theme.bg.primary}
            disabled={!canEdit || formContext.editMode}
        >
            <Icon name='pen' solid forButton />
        </Button>
    </DetailsTitle>;
};

import type React from 'react';
import type { GameVersion } from '../../data/sdk/model';
import { Button } from '../button/button';
import { ButtonWithConfirm } from '../button/button-with-confirm';
import { DetailsTitle } from '../details-card/details-title';
import { Icon } from '../icon/icon';
import { theme } from '../theme';
import { StorageDetailsForm } from './storage-details-form';

export type StorageDetailsTitleProps = {
    version: GameVersion;
    showVersionName?: boolean;
    canEdit: boolean;
    onRelease?: () => unknown;
    openFile?: () => unknown;
};

export const StorageDetailsTitle: React.FC<StorageDetailsTitleProps> = ({ version, showVersionName, canEdit, onRelease, openFile }) => {
    const formContext = StorageDetailsForm.useContext();

    return <DetailsTitle version={version} showVersionName={showVersionName}>
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

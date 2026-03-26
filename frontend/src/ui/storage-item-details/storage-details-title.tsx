import { css } from '@emotion/css';
import type React from 'react';
import type { EntityContext, GameVersion } from '../../data/sdk/model';
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
    context: EntityContext;
    contextVersion: GameVersion | null;
    showVersionName?: boolean;
    canEdit: boolean;
    onRelease?: () => unknown;
    openFile?: () => unknown;
};

export const StorageDetailsTitle: React.FC<StorageDetailsTitleProps> = ({ isEnabled, filepath, context, contextVersion, showVersionName, canEdit, onRelease, openFile }) => {
    const formContext = StorageDetailsForm.useContext();

    return <DetailsTitle context={context} contextVersion={contextVersion} showVersionName={showVersionName && isEnabled}>
        {!isEnabled && contextVersion === null && filepath
            ? <div className={css({
                flexGrow: 1,
                width: 0,
            })} title={filepath}>
                <PathLine>{filepath}</PathLine>
            </div>
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

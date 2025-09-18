import type React from 'react';
import type { GameVersion } from '../../data/sdk/model';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { ButtonWithConfirm } from '../button/button-with-confirm';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import { StorageDetailsForm } from './storage-details-form';
import { useStaticData } from '../../hooks/use-static-data';
import { theme } from '../theme';

export type StorageDetailsTitleProps = {
    version: GameVersion;
    generation: number;
    showVersionName?: boolean;
    canEdit: boolean;
    onRelease?: () => unknown;
};

export const StorageDetailsTitle: React.FC<StorageDetailsTitleProps> = ({ version, generation, showVersionName, canEdit, onRelease }) => {
    const formContext = StorageDetailsForm.useContext();

    const staticData = useStaticData();

    return <>
        <img
            src={getGameInfos(version).img}
            style={{ height: 28, width: 28 }}
        />

        <div style={{ flexGrow: 1 }}>
            G{generation}{showVersionName && ` / ${staticData.versions[ version ].name}`}
        </div>

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
    </>;
};

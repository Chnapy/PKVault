import React from 'react';
import { EntityContext } from '../../../data/sdk/model';
import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';
import { getEntityContextGenerationName } from '../../../data/util/get-entity-context-generation-name';
import { useStaticData } from '../../../hooks/use-static-data';
import { SaveItemEdit } from '../../../saves/save-item/save-item-edit';
import { UIGameExpanded, type UIGameExpandedProps } from '../../../ui/storage/storage-panel/game-list/ui-game-expanded';

export type GameExpandedProps = Pick<UIGameExpandedProps, 'label' | 'imgSrc' | 'selected' | 'disabled' | 'onSelect' | 'actions'>
    & {
        id: string;
    };

export const GameExpanded: React.FC<GameExpandedProps> = ({ id, label, imgSrc, onSelect, selected, disabled, actions }) => {
    const staticData = useStaticData();

    const saveInfosQuery = useSaveInfosGetAll();

    const loading = [ saveInfosQuery ].some(q => q.isPending && q.isEnabled);

    const save = saveInfosQuery.data?.data[ id ];

    const { context, version, trainerName, trainerGender, tid, playTime, language, path } = save ?? {};

    const versionObj = staticData.versions[ version ?? '' ];

    const hasDuplicates = !!save && save.duplicates.length > 0;
    const hasEdit = !!save && (
        (versionObj && !versionObj.isGameVersion)
        || hasDuplicates
    );

    return <UIGameExpanded
        id={id}
        generation={getEntityContextGenerationName(context ?? EntityContext.None, true)}
        label={label}
        imgSrc={imgSrc}
        selected={selected}
        loading={loading}
        disabled={disabled}
        onSelect={onSelect}
        ot={trainerName}
        otGender={trainerGender}
        tid={tid}
        caughtCount={save?.dexCaughtCount}
        ownedCount={save?.ownedCount}
        shinyCount={save?.shinyCount}
        playTime={playTime}
        language={staticData.languages[ language ?? '' ]}
        path={path ?? ''}
        hasDuplicates={hasDuplicates}
        editDropdown={hasEdit && <SaveItemEdit saveId={save.id} />}
        actions={actions}
    />;
};

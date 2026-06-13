import React from 'react';
import { usePkmSaveIndex } from '../../../data/hooks/use-pkm-save-index';
import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';
import { getEntityContextGenerationName } from '../../../data/util/get-entity-context-generation-name';
import { useStaticData } from '../../../hooks/use-static-data';
import { SaveItemEdit } from '../../../saves/save-item/save-item-edit';
import { UIGameExpanded, type UIGameExpandedProps } from '../../../ui-new/storage/storage-panel/game-list/ui-game-expanded';

export type GameExpandedProps = Pick<UIGameExpandedProps, 'id' | 'label' | 'imgSrc' | 'selected' | 'onSelect'>;

export const GameExpanded: React.FC<GameExpandedProps> = ({ id, label, imgSrc, onSelect, selected }) => {
    const staticData = useStaticData();

    const saveInfosQuery = useSaveInfosGetAll();

    const ownedCountQuery = usePkmSaveIndex(+id,
        React.useCallback(data => Object.values(data.data.byId).length, [])
    );

    const save = saveInfosQuery.data?.data[ id ];
    if (!save)
        return null;

    const { context, version, trainerName, trainerGender, tid, playTime, language, path } = save;

    const versionObj = staticData.versions[ version ?? '' ];

    return <UIGameExpanded
        id={id}
        generation={getEntityContextGenerationName(context, true)}
        label={label}
        imgSrc={imgSrc}
        selected={selected}
        onSelect={onSelect}
        ot={trainerName}
        otGender={trainerGender}
        tid={tid}
        ownedCount={ownedCountQuery.data ?? 0}
        playTime={playTime}
        language={staticData.languages[ language ] ?? ''}
        path={path}
        editDropdown={versionObj && !versionObj.isGameVersion && <SaveItemEdit saveId={save.id} />}
    />;
};

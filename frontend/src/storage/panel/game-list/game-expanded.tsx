import React from 'react';
import { usePkmSaveIndex } from '../../../data/hooks/use-pkm-save-index';
import { useDexGetAll } from '../../../data/sdk/dex/dex.gen';
import { EntityContext, Gender } from '../../../data/sdk/model';
import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';
import { getEntityContextGenerationName } from '../../../data/util/get-entity-context-generation-name';
import { useStaticData } from '../../../hooks/use-static-data';
import { SaveItemEdit } from '../../../saves/save-item/save-item-edit';
import { UIGameExpanded, type UIGameExpandedProps } from '../../../ui/storage/storage-panel/game-list/ui-game-expanded';

export type GameExpandedProps = Pick<UIGameExpandedProps, 'id' | 'label' | 'imgSrc' | 'selected' | 'onSelect' | 'actions'>;

export const GameExpanded: React.FC<GameExpandedProps> = ({ id, label, imgSrc, onSelect, selected, actions }) => {
    const staticData = useStaticData();

    const saveInfosQuery = useSaveInfosGetAll();

    const ownedCountQuery = usePkmSaveIndex(+id,
        React.useCallback(data => Object.values(data.data.byId).length, [])
    );

    const shinyCountQuery = usePkmSaveIndex(+id,
        React.useCallback(data => Object.values(data.data.byId)
            .filter(pkm => pkm.isShiny)
            .length, [])
    );

    const caughtCountQuery = useDexGetAll({
        query: {
            select: data => {
                const specs = Object.values(data.data)
                    .map(spec => spec[ id ])
                    .filter(v => typeof v !== 'undefined');
                if (specs.length === 0)
                    return null;

                return specs.filter(spec => {
                    return spec.forms.some(f => f.isCaught);
                }).length;
            }
        },
    });

    const loading = [ saveInfosQuery, ownedCountQuery, shinyCountQuery, caughtCountQuery ].some(q => q.isPending && q.isEnabled);

    const save = saveInfosQuery.data?.data[ id ];

    const { context, version, trainerName, trainerGender, tid, playTime, language, path } = save ?? {};

    const versionObj = staticData.versions[ version ?? '' ];

    return <UIGameExpanded
        id={id}
        generation={getEntityContextGenerationName(context ?? EntityContext.None, true)}
        label={label}
        imgSrc={imgSrc}
        selected={selected}
        loading={loading}
        onSelect={onSelect}
        ot={trainerName ?? ''}
        otGender={trainerGender ?? Gender.Genderless}
        tid={tid ?? 0}
        caughtCount={caughtCountQuery.data ?? undefined}
        ownedCount={ownedCountQuery.data ?? 0}
        shinyCount={shinyCountQuery.data}
        playTime={playTime ?? ''}
        language={staticData.languages[ language ?? '' ] ?? ''}
        path={path ?? ''}
        editDropdown={versionObj && !versionObj.isGameVersion && save && <SaveItemEdit saveId={save.id} />}
        actions={actions}
    />;
};

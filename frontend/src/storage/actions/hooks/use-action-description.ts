import { DataActionType, type DataActionPayload } from '../../../data/sdk/model';
import { useStaticData } from '../../../hooks/use-static-data';
import { useTranslate } from '../../../translate/i18n';
import { switchUtil } from '../../../util/switch-util';

export const useActionDescription = () => {
    const { t } = useTranslate();
    const staticData = useStaticData();

    return ({ type, parameters }: DataActionPayload): string => {

        return switchUtil(type, {
            [ DataActionType.MAIN_CREATE_BOX ]: () => t('storage.save-actions.type.main-create-box', {
                name: parameters[ 0 ]
            }),
            [ DataActionType.MAIN_UPDATE_BOX ]: () => t('storage.save-actions.type.main-update-box', {
                oldName: parameters[ 0 ],
                name: parameters[ 1 ]
            }),
            [ DataActionType.MAIN_DELETE_BOX ]: () => t('storage.save-actions.type.main-delete-box', {
                name: parameters[ 0 ]
            }),
            [ DataActionType.MAIN_CREATE_PKM_VERSION ]: () => t('storage.save-actions.type.create-pkm-version', {
                name: parameters[ 0 ],
                generation: parameters[ 1 ]
            }),
            [ DataActionType.MOVE_PKM ]: () => t('storage.save-actions.type.move-pkm', {
                pkmName: parameters[ 0 ],
                sourceSave: typeof parameters[ 1 ] === 'number' ? staticData.versions[ parameters[ 1 ] ].name : t('storage.save-actions.part.storage'),
                targetSave: typeof parameters[ 2 ] === 'number' ? staticData.versions[ parameters[ 2 ] ].name : t('storage.save-actions.part.storage'),
                targetBoxName: parameters[ 3 ],
                targetBoxSlot: parameters[ 4 ],
                attached: parameters[ 5 ] ? t('storage.save-actions.part.attached') : ''
            }),
            [ DataActionType.DETACH_PKM_SAVE ]: () => t('storage.save-actions.type.detach', {
                save: typeof parameters[ 0 ] === 'number' ? staticData.versions[ parameters[ 0 ] ].name : null,
                name: parameters[ 1 ],
            }),
            [ DataActionType.EDIT_PKM_VERSION ]: () => t('storage.save-actions.type.main-edit-pkm', {
                name: parameters[ 0 ],
                generation: parameters[ 1 ],
            }),
            [ DataActionType.EDIT_PKM_SAVE ]: () => t('storage.save-actions.type.save-edit-pkm', {
                save: typeof parameters[ 0 ] === 'number' ? staticData.versions[ parameters[ 0 ] ].name : null,
                name: parameters[ 1 ],
            }),
            [ DataActionType.DELETE_PKM_VERSION ]: () => t('storage.save-actions.type.main-delete-pkm', {
                name: parameters[ 0 ],
                generation: parameters[ 1 ],
            }),
            [ DataActionType.SAVE_DELETE_PKM ]: () => t('storage.save-actions.type.save-delete-pkm', {
                save: typeof parameters[ 0 ] === 'number' ? staticData.versions[ parameters[ 0 ] ].name : null,
                name: parameters[ 1 ],
            }),
            [ DataActionType.PKM_SYNCHRONIZE ]: () => t('storage.save-actions.type.synchronize-pkm', {
                name: parameters[ 0 ],
            }),
            [ DataActionType.EVOLVE_PKM ]: () => t('storage.save-actions.type.evolve-pkm', {
                save: typeof parameters[ 0 ] === 'number' ? staticData.versions[ parameters[ 0 ] ].name : t('storage.save-actions.part.storage'),
                name: parameters[ 1 ],
                oldSpecies: staticData.species[ Number(parameters[ 2 ]) ].forms[ 0 ].name,
                newSpecies: staticData.species[ Number(parameters[ 3 ]) ].forms[ 0 ].name,
            }),
        })()
    };
};

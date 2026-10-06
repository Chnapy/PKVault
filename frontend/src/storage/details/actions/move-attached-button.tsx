import { Group, Tooltip } from '@mantine/core';
import { LinkIcon, MoveIcon, UnlinkIcon } from 'lucide-react';
import React from 'react';
import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import { usePkmVariantIndex } from '../../../data/hooks/use-pkm-variant-index';
import type { PkmSaveDTO } from '../../../data/sdk/model';
import { useStorageMainPkmDetachSave } from '../../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../../translate/i18n';
import { UIButton, type UIButtonProps } from '../../../ui/form/button/ui-button';
import { useControlsCurrentType } from '../../../ui/interaction/controls/use-controls-current-type';
import type { UseDraggingReturn } from '../../../ui/interaction/move/hooks/use-dragging';
import { UIPokedexIcons } from '../../../ui/pokedex/icons/ui-pokedex-icons';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { pick } from '../../../util/pick';
import { useSelectCallback } from '../../../util/use-select-callback';
import type { MoveParams } from '../../move/move-container-fns';
import type { ActionButtonDefaultProps } from './edit-pkm-button';

export const MoveAttachedButton: React.FC<
    ActionButtonDefaultProps & Pick<UseDraggingReturn, 'useDrag'>
> = ({ pkmIds, saveId, useDrag }) => {
    const { t } = useTranslate();

    const pkmIndexQuery = usePkmIndex(saveId ?? null,
        useSelectCallback(data => {
            return pkmIds.map(id => data.data.byId[ id ]).filter(filterIsDefined)
                .map(pkm => ({
                    ...pick(pkm, [ 'id', 'boxId', 'boxSlot', 'isDuplicate' ]),
                    idBase: saveId ? (pkm as PkmSaveDTO).idBase : '',
                }));
        }, [ pkmIds, saveId ]));

    const attachedVariantIdsQuery = usePkmVariantIndex(
        useSelectCallback(data => {
            return pkmIndexQuery.data?.map(pkm => {

                if (saveId)
                    return data.data.byAttachedSave[ saveId ]?.[ pkm.idBase ]?.id;

                const variants = data.data.byBox[ pkm.boxId ]?.[ pkm.boxSlot ] ?? [];
                return variants.find(variant => variant.attachedSaveId)?.id;
            }).filter(filterIsDefined);
        }, [ pkmIndexQuery.data, saveId ])
    );

    const mainPkmDetachSaveMutation = useStorageMainPkmDetachSave();

    const controlsType = useControlsCurrentType();

    const pkms = pkmIndexQuery.data ?? [];
    const attachedVariantIds = attachedVariantIdsQuery.data ?? [];

    const draggingMoveAttached = useDrag<MoveParams>({ attached: true });

    const hasDuplicate = pkms.some(pkm => pkm.isDuplicate);

    const onClickMoveAttached: UIButtonProps[ 'onClick' ] = controlsType === 'mouse'
        ? draggingMoveAttached.toggleDragByClick
        : draggingMoveAttached.toggleDragByFocus;

    const renderCount = (count: number) => {
        if (count < 2)
            return null;
        return <>({count})</>;
    };

    return attachedVariantIds.length > 0
        ? <Tooltip
            multiline
            w={300}
            label={(saveId
                ? [ t('storage.actions.detach-save.helpTitle'), t('storage.actions.detach-save.helpContent') ]
                : [ t('storage.actions.detach-main.helpTitle'), t('storage.actions.detach-main.helpContent') ]
            ).join('\n\n')}>
            <UIButton
                name='detach'
                controlLabel={saveId ? t('storage.actions.detach-save') : t('storage.actions.detach-main')}
                onClick={() =>
                    mainPkmDetachSaveMutation.mutateAsync({
                        params: {
                            pkmVariantIds: attachedVariantIds,
                        },
                    })
                }
                size='compact-md'
                leftSection={<UnlinkIcon />}
            >
                {saveId ? t('storage.actions.detach-save') : t('storage.actions.detach-main')} {renderCount(attachedVariantIds.length)}
            </UIButton>
        </Tooltip>
        : <Tooltip
            multiline
            w={300}
            label={hasDuplicate
                ? t('details.is-duplicate')
                : (saveId
                    ? [ t('storage.actions.move-attached-save.helpTitle'), t('storage.actions.move-attached-save.helpContent') ]
                    : [ t('storage.actions.move-attached-main.helpTitle'), t('storage.actions.move-attached-main.helpContent') ]
                ).join('\n\n')}>
            <UIButton
                name='move-attached'
                controlLabel={t('storage.actions.move-attached')}
                onClick={onClickMoveAttached}
                size='compact-md'
                leftSection={<Group gap='sm' wrap='nowrap'>
                    <MoveIcon />
                    <LinkIcon />
                </Group>}
                rightSection={hasDuplicate && <UIPokedexIcons.Duplicate />}
                disabled={!draggingMoveAttached.enabled || hasDuplicate}
            >
                {t('storage.actions.move-attached')}
            </UIButton>
        </Tooltip>;
};

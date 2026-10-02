import { SparklesIcon } from 'lucide-react';
import type React from 'react';
import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import { useStorageEvolvePkms } from '../../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../../translate/i18n';
import { UIButton } from '../../../ui/form/button/ui-button';
import { UIConfirmPopover } from '../../../ui/popover/ui-confirm-popover';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { pick } from '../../../util/pick';
import { useSelectCallback } from '../../../util/use-select-callback';
import type { ActionButtonDefaultProps } from './edit-pkm-button';

export const EvolvePkmButton: React.FC<ActionButtonDefaultProps> = ({ pkmIds, saveId }) => {
    const { t } = useTranslate();

    const pkmIndexQuery = usePkmIndex(saveId ?? null,
        useSelectCallback(data => {
            return pkmIds.map(id => data.data.byId[ id ]).filter(filterIsDefined)
                .map(pkm => pick(pkm, [ 'id', 'canEvolve' ]));
        }, [ pkmIds ]));

    const pkms = pkmIndexQuery.data ?? [];

    const evolvePkmsMutation = useStorageEvolvePkms();

    const canEvolveList = pkms.filter(pkm => pkm.canEvolve);

    const renderCount = (count: number) => {
        if (count < 2)
            return null;
        return <>({count})</>;
    };

    return canEvolveList.length > 0 && <UIConfirmPopover
        label={t('storage.actions.evolve')}
        color='blue'
        action={async () => {
            if (canEvolveList.length === 0)
                return;

            await evolvePkmsMutation.mutateAsync({
                params: {
                    saveId,
                    ids: canEvolveList.map(pkm => pkm.id),
                },
            });

            // const pkms = saveId
            //     ? Object.values(mutateResult.data.saves?.find(save => save.saveId === saveId)?.savePkms?.data ?? {})
            //     : Object.values(mutateResult.data.mainPkmVariants?.data ?? {});
            // const newId = pkms.find(p => p.boxId === pkm.boxId && p.boxSlot === pkm.boxSlot)?.id;

            // if (newId) {
            //     navigate({
            //         search: search => ({
            //             selected: {
            //                 ...search.selected!,
            //                 id: newId,
            //                 saveId: saveId ?? undefined,
            //             },
            //         }),
            //     });
            // }
        }}
    >
        <UIButton
            name='evolve'
            controlLabel='Evolve'
            variant='filled'
            color='blue'
            size='compact-md'
            leftSection={<SparklesIcon />}
            disabled={canEvolveList.length === 0}
        >
            {t('storage.actions.evolve')} {renderCount(canEvolveList.length)}
        </UIButton>
    </UIConfirmPopover>;
};

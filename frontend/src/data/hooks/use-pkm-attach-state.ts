import { pick } from '../../util/pick';
import { useSelectCallback } from '../../util/use-select-callback';
import type { PkmSaveDTO } from '../sdk/model';
import { usePkmIndex } from './use-pkm-index';
import { usePkmSaveIndex } from './use-pkm-save-index';
import { usePkmVariantIndex } from './use-pkm-variant-index';

type PkmAttachState = {
    isAttached: boolean;
    canSynchronize?: boolean;
    attachBroken?: boolean;
    attachBrokenReason?: 'isDuplicate' | 'isEnabled';
    targetAnotherPkmId?: boolean;
};

export const usePkmAttachState = (saveId: number | null, pkmId: string | undefined) => {
    const pkmQuery = usePkmIndex(saveId,
        useSelectCallback(data => data.data.byId[ pkmId ?? '' ], [ pkmId ]),
        { enabled: !!pkmId },
    );
    const pkm = pkmQuery.data;

    const saveQuery = usePkmVariantIndex(
        useSelectCallback((data): PkmAttachState => {
            const savePkm = pkm as PkmSaveDTO;
            if (!savePkm)
                return {
                    isAttached: false,
                };

            const attachedPkmVariant = data.data.byAttachedSave[ savePkm.saveId ]?.[ savePkm.idBase ];
            if (!attachedPkmVariant)
                return {
                    isAttached: false,
                };

            if (!attachedPkmVariant.isEnabled)
                return {
                    isAttached: true,
                    attachBroken: true,
                    attachBrokenReason: 'isEnabled',
                };

            if (savePkm.isDuplicate)
                return {
                    isAttached: true,
                    attachBroken: true,
                    attachBrokenReason: 'isDuplicate',
                };

            return {
                isAttached: true,
                canSynchronize: savePkm.dynamicChecksum !== attachedPkmVariant.dynamicChecksum,
            };
        }, [ pkm ]),
        {
            enabled: !!saveId,
        }
    );

    const mainAttachedVariantQuery = usePkmVariantIndex(
        useSelectCallback(data => {
            const baseVariant = data.data.byId[ pkmId ?? '' ];
            if (!baseVariant)
                return;

            const variants = data.data.byBox[ baseVariant.boxId ]?.[ baseVariant.boxSlot ] ?? [];
            const attachedVariant = variants.find(variant => variant.attachedSaveId);

            return attachedVariant && pick(attachedVariant, [ 'id', 'attachedSaveId', 'attachedSavePkmIdBase', 'dynamicChecksum', 'isEnabled' ]);
        }, [ pkmId ]),
        {
            enabled: !saveId,
        }
    );
    const mainAttachedVariant = mainAttachedVariantQuery.data;

    const targetAnotherPkmId = mainAttachedVariant?.id !== pkmId;

    const mainQuery = usePkmSaveIndex(mainAttachedVariant?.attachedSaveId ?? 0,
        useSelectCallback((data): PkmAttachState => {
            if (!mainAttachedVariant?.attachedSavePkmIdBase)
                return {
                    isAttached: false,
                };

            if (!mainAttachedVariant.isEnabled)
                return {
                    isAttached: true,
                    attachBroken: true,
                    attachBrokenReason: 'isEnabled',
                    targetAnotherPkmId,
                };

            const attachedSavePkms = data.data.byIdBase[ mainAttachedVariant.attachedSavePkmIdBase ] ?? [];
            if (attachedSavePkms.length !== 1)
                return {
                    isAttached: true,
                    attachBroken: true,
                    attachBrokenReason: 'isDuplicate',
                    targetAnotherPkmId,
                };

            return {
                isAttached: true,
                canSynchronize: attachedSavePkms.every(pkm => pkm.dynamicChecksum !== mainAttachedVariant.dynamicChecksum),
                targetAnotherPkmId,
            };
        }, [ mainAttachedVariant, targetAnotherPkmId ]),
        {
            enabled: !saveId,
        }
    );

    const queries = [ pkmQuery, saveQuery, mainAttachedVariantQuery, mainQuery ];

    const isPending = queries.some(q => q.isPending && q.isEnabled);

    const data = saveId ? saveQuery.data : mainQuery.data;

    return {
        isPending,
        data,
    };
};

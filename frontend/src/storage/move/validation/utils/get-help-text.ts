import type { TFunction } from 'i18next';
import type { PkmVariantDTO } from '../../../../data/sdk/model';
import { getEntityContextGenerationName } from '../../../../data/util/get-entity-context-generation-name';
import type { DropRefusalReason, SlotInfos } from '../types';

export const getHelpText = (reason: DropRefusalReason, info: SlotInfos | undefined, attached: boolean, t: TFunction<'ns'>): string | undefined => {
    const sourcePkm = info?.sourcePkm;
    const targetPkm = info?.targetPkm;

    switch (reason) {
        case 'not-dragging': return undefined;
        case 'empty-slot-infos': return undefined;
        case 'out-of-bounds': return undefined;
        case 'pkm-cannot-move': return t('storage.move.pkm-cannot', {
            name: sourcePkm?.nickname,
        });
        case 'attached-target-occupied': return t('storage.move.attached-pkm');
        case 'target-box-cannot-receive': return t('storage.move.box-cannot', {
            name: info?.targetBox?.name,
        });
        case 'attached-main-to-main': return t('storage.move.attached-main-self');
        case 'attached-save-to-save': return t('storage.move.attached-save-self');
        case 'pkm-save-cannot-move': return t('storage.move.pkm-cannot', {
            name: sourcePkm?.nickname,
        });
        case 'save-to-pkm-save-cannot-move': return t('storage.move.pkm-cannot', {
            name: targetPkm?.nickname,
        });
        case 'save-to-save-not-same-context': return t('storage.move.save-same-gen', {
            generation: getEntityContextGenerationName(info?.direction === 'save-to-save'
                ? info?.sourceSave.context
                : sourcePkm?.context ?? 0),
        });
        case 'save-to-save-cannot-move': return t('storage.move.pkm-cannot', {
            name: targetPkm?.nickname,
        });
        case 'main-to-save-incompatible-version': return t('storage.move.main-incompatible-version', {
            name: sourcePkm?.nickname,
        });
        case 'main-cannot-move-to-save':
            if (info?.direction === 'main-to-save' && (sourcePkm as PkmVariantDTO | undefined)?.attachedSaveId) {
                return t('storage.move.pkm-cannot-attached-already', {
                    name: sourcePkm?.nickname,
                });
            }
            return attached
                ? t('storage.move.pkm-cannot-attached', {
                    name: sourcePkm?.nickname,
                })
                : t('storage.move.pkm-cannot', {
                    name: sourcePkm?.nickname,
                });
        case 'main-disabled-to-save': return t('storage.move.main-disabled');
        case 'main-no-variant-to-save-occupied': return t('storage.move.pkm-cannot-create-variant', {
            name: sourcePkm?.nickname,
        });
        case 'main-already-attached-to-save': return t('storage.move.pkm-cannot-attached-already', {
            name: sourcePkm?.nickname,
        });
        case 'save-egg-to-main': return t('storage.move.save-egg');
        case 'save-shadow-to-main': return t('storage.move.save-shadow');
        case 'save-cannot-move-main-to-main': return attached
            ? t('storage.move.pkm-cannot-attached', {
                name: sourcePkm?.nickname,
            })
            : t('storage.move.pkm-cannot', {
                name: sourcePkm?.nickname,
            });
        case 'main-to-same-bank': return undefined;
        case 'same-pkm-id': return undefined;
        case 'bank-external': return t('storage.move.bank-external');
    }
};

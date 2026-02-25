import type { TFunction } from 'i18next';
import type { DropRefusalReason, SlotInfos } from '../types';

export const getHelpText = (reason: DropRefusalReason, info: SlotInfos | undefined, attached: boolean, t: TFunction<'ns'>): string | undefined => {
    switch (reason) {
        case 'not-dragging': return undefined;
        case 'empty-slot-infos': return undefined;
        case 'out-of-bounds': return undefined;
        case 'pkm-cannot-move': return t('storage.move.pkm-cannot', {
            name: info?.sourcePkm.nickname,
        });
        case 'attached-target-occupied': return t('storage.move.attached-pkm');
        case 'target-box-cannot-receive': return t('storage.move.box-cannot', {
            name: info?.targetBox?.name,
        });
        case 'attached-main-to-main': return t('storage.move.attached-main-self');
        case 'attached-save-to-save': return t('storage.move.attached-save-self');
        case 'pkm-save-cannot-move': return t('storage.move.pkm-cannot', {
            name: info?.sourcePkm.nickname,
        });
        case 'save-to-pkm-save-cannot-move': return t('storage.move.pkm-cannot', {
            name: info?.targetPkm?.nickname,
        });
        case 'save-to-save-not-same-generation': return t('storage.move.save-same-gen', {
            generation: info?.direction === 'save-to-save'
                ? info?.sourceSave.generation
                : info?.sourcePkm.generation,
        });
        case 'save-to-save-cannot-move': return t('storage.move.pkm-cannot', {
            name: info?.targetPkm?.nickname,
        });
        case 'main-to-save-incompatible-version': return t('storage.move.main-incompatible-version', {
            name: info?.sourcePkm.nickname,
        });
        case 'main-cannot-move-to-save':
            if (info?.direction === 'main-to-save' && info?.sourcePkm.attachedSaveId) {
                return t('storage.move.pkm-cannot-attached-already', {
                    name: info?.sourcePkm.nickname,
                });
            }
            return attached
                ? t('storage.move.pkm-cannot-attached', {
                    name: info?.sourcePkm.nickname,
                })
                : t('storage.move.pkm-cannot', {
                    name: info?.sourcePkm.nickname,
                });
        case 'main-disabled-to-save': return t('storage.move.main-disabled');
        case 'main-no-variant-to-save-occupied': return t('storage.move.pkm-cannot-create-variant', {
            name: info?.sourcePkm.nickname,
        });
        case 'main-already-attached-to-save': return t('storage.move.pkm-cannot-attached-already', {
            name: info?.sourcePkm.nickname,
        });
        case 'save-egg-to-main': return t('storage.move.save-egg');
        case 'save-shadow-to-main': return t('storage.move.save-shadow');
        case 'save-cannot-move-main-to-main': return attached
            ? t('storage.move.pkm-cannot-attached', {
                name: info?.sourcePkm.nickname,
            })
            : t('storage.move.pkm-cannot', {
                name: info?.sourcePkm.nickname,
            });
        case 'save-to-main-variant-already-exist': return t('storage.move.save-main-duplicate', {
            name: info?.sourcePkm.nickname,
        });
        case 'main-to-same-bank': return undefined;
    }
};

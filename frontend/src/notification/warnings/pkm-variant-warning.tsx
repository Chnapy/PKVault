import type React from 'react';
import { HistoryContext } from '../../context/history-context';
import { usePkmVariantIndex } from '../../data/hooks/use-pkm-variant-index';
import type { PkmVariantWarning as PkmVariantWarningModel } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { Route } from '../../routes/storage';
import { getSaveOrder } from '../../storage/util/get-save-order';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { Icon } from '../../ui/icon/icon';
import { css } from '@emotion/css';

export const PkmVariantWarning: React.FC<PkmVariantWarningModel> = ({ pkmVariantId }) => {
    const { t } = useTranslate();
    const navigate = Route.useNavigate();
    const storageHistoryValue = HistoryContext.useValue()[ '/storage' ];

    const staticData = useStaticData();

    const pkmVariantsQuery = usePkmVariantIndex();

    const pkmVariant = pkmVariantsQuery.data?.data.byId[ pkmVariantId ];
    if (!pkmVariant) {
        return null;
    }

    const staticForms = staticData.species[ pkmVariant.species ]?.forms[ pkmVariant.context ];

    const formObj = staticForms?.[ pkmVariant.form ] ?? staticForms?.[ 0 ];

    const speciesName = formObj?.name;

    return (
        <tr>
            <td>
                {t('notifications.warnings.pkm-variant', {
                    speciesName,
                    boxId: pkmVariant.boxId,
                    boxSlot: pkmVariant.boxSlot,
                })}
            </td>
            <td className={css({ verticalAlign: 'top' })}>
                <Button
                    onClick={() =>
                        navigate({
                            to: '/storage',
                            search: search => {
                                const saves = storageHistoryValue?.search.saves ?? search.saves;

                                return {
                                    mainBoxIds: [ pkmVariant.boxId ],
                                    selected: {
                                        id: pkmVariant.id,
                                    },
                                    saves: pkmVariant.attachedSaveId
                                        ? {
                                            ...saves,
                                            [ pkmVariant.attachedSaveId ]: saves?.[ pkmVariant.attachedSaveId ] ?? {
                                                saveId: pkmVariant.attachedSaveId,
                                                saveBoxIds: [ 0 ],
                                                order: getSaveOrder(saves, pkmVariant.attachedSaveId),
                                            },
                                        }
                                        : saves,
                                };
                            },
                        })
                    }
                >
                    <Icon name='eye' forButton />
                </Button>
            </td>
        </tr>
    );
};

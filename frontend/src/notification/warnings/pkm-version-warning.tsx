import type React from 'react';
import { HistoryContext } from '../../context/history-context';
import { usePkmVersionIndex } from '../../data/hooks/use-pkm-version-index';
import type { PkmVersionWarning as PkmVersionWarningModel } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { Route } from '../../routes/storage';
import { getSaveOrder } from '../../storage/util/get-save-order';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { Icon } from '../../ui/icon/icon';
import { css } from '@emotion/css';

export const PkmVersionWarning: React.FC<PkmVersionWarningModel> = ({ pkmVersionId }) => {
    const { t } = useTranslate();
    const navigate = Route.useNavigate();
    const storageHistoryValue = HistoryContext.useValue()[ '/storage' ];

    const staticData = useStaticData();

    const pkmVersionsQuery = usePkmVersionIndex();

    const pkmVersion = pkmVersionsQuery.data?.data.byId[ pkmVersionId ];
    if (!pkmVersion) {
        return null;
    }

    const staticForms = staticData.species[ pkmVersion.species ]?.forms[ pkmVersion.context ];

    const formObj = staticForms?.[ pkmVersion.form ] ?? staticForms?.[ 0 ];

    const speciesName = formObj?.name;

    return (
        <tr>
            <td>
                {t('notifications.warnings.pkm-version', {
                    speciesName,
                    boxId: pkmVersion.boxId,
                    boxSlot: pkmVersion.boxSlot,
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
                                    mainBoxIds: [ pkmVersion.boxId ],
                                    selected: {
                                        id: pkmVersion.id,
                                    },
                                    saves: pkmVersion.attachedSaveId
                                        ? {
                                            ...saves,
                                            [ pkmVersion.attachedSaveId ]: saves?.[ pkmVersion.attachedSaveId ] ?? {
                                                saveId: pkmVersion.attachedSaveId,
                                                saveBoxIds: [ 0 ],
                                                order: getSaveOrder(saves, pkmVersion.attachedSaveId),
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

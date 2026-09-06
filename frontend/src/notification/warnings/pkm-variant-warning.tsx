import { ActionIcon, Table } from '@mantine/core';
import { EyeIcon } from 'lucide-react';
import type React from 'react';
import { usePkmVariantIndex } from '../../data/hooks/use-pkm-variant-index';
import type { PkmVariantWarning as PkmVariantWarningModel } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { Route } from '../../routes/storage';
import { useTranslate } from '../../translate/i18n';
import { pick } from '../../util/pick';
import { useSelectCallback } from '../../util/use-select-callback';

export const PkmVariantWarning: React.FC<PkmVariantWarningModel> = ({ pkmVariantId }) => {
    const { t } = useTranslate();
    const navigate = Route.useNavigate();

    const staticData = useStaticData();

    const pkmVariantQuery = usePkmVariantIndex(
        useSelectCallback(data => {
            const pkmVariant = data.data.byId[ pkmVariantId ];
            return pkmVariant && pick(pkmVariant, [ 'id', 'species', 'form', 'context', 'boxId', 'boxSlot', 'attachedSaveId' ]);
        }, [ pkmVariantId ])
    );

    const pkmVariant = pkmVariantQuery.data;
    if (!pkmVariant) {
        return null;
    }

    const staticForms = staticData.species[ pkmVariant.species ]?.forms[ pkmVariant.context ];

    const formObj = staticForms?.[ pkmVariant.form ] ?? staticForms?.[ 0 ];

    const speciesName = formObj?.name;

    return (
        <Table.Tr>
            <Table.Td>
                {t('notifications.warnings.pkm-variant', {
                    speciesName,
                    boxId: pkmVariant.boxId,
                    boxSlot: pkmVariant.boxSlot,
                })}
            </Table.Td>
            <Table.Td valign='top'>
                <ActionIcon
                    variant='default'
                    onClick={() =>
                        navigate({
                            to: '/storage',
                            search: search => {
                                if (!pkmVariant.attachedSaveId)
                                    return search;

                                return {
                                    storages: [
                                        {
                                            saveId: null,
                                            boxId: pkmVariant.boxId,
                                        },
                                        {
                                            saveId: pkmVariant.attachedSaveId,
                                            boxId: 0,
                                        },
                                    ],
                                    selected: {
                                        storage: 0,
                                        id: pkmVariant.id,
                                    },
                                };
                            },
                        })
                    }
                >
                    <EyeIcon fontSize='1lh' />
                </ActionIcon>
            </Table.Td>
        </Table.Tr>
    );
};

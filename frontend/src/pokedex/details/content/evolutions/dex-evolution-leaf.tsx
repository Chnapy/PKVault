import { Box, Divider, Stack, type RenderTreeNodePayload, type TreeNodeData } from '@mantine/core';
import React from 'react';
import { useDexGetAll } from '../../../../data/sdk/dex/dex.gen';
import type { EntityContext, TriggerData } from '../../../../data/sdk/model';
import { Route } from '../../../../routes/pokedex';
import { useTranslate } from '../../../../translate/i18n';
import { UIButton } from '../../../../ui/form/button/ui-button';
import { DexFormItem } from '../../../list/dex-item/dex-form-item';
import { DexEvolutionTriggerLine } from './dex-evolution-trigger-line';

export type TreeNodeDataRich = TreeNodeData & {
    nodeProps: {
        species: number;
        formIndex: number;
        triggers: TriggerData[];
    };
};

type DexEvolutionLeafProps = TreeNodeDataRich & {
    selected: boolean;
    context: EntityContext;
} & RenderTreeNodePayload[ 'elementProps' ];

export const DexEvolutionLeaf: React.FC<DexEvolutionLeafProps> = ({ value, label, nodeProps, selected, context, hasChildren, ...elementProps }) => {
    const { species, formIndex, triggers = [] } = nodeProps;

    const { t } = useTranslate();

    const saveId = Route.useSearch({ select: (search) => search.selectedSaveId ?? 0 });

    const navigate = Route.useNavigate();

    const dex = useDexGetAll();

    const dexData = dex.data?.data[ species ]?.[ saveId ]?.forms?.[ formIndex ];

    return (
        <Box {...elementProps}>
            <UIButton
                name={value}
                controlLabel={t('action.select')}
                onClick={() => navigate({
                    search: search => ({
                        ...search,
                        selected: species,
                    })
                })}
                disabled={!dexData?.isSeen}
                variant='default'
                justify='flex-start'
                bd='none'
                w='100%'
                h='auto'
                styles={{
                    root: {
                        outline: selected ? '2px solid var(--focus-color-1)' : undefined,
                        pointerEvents: selected ? 'none' : undefined,
                    },
                    label: {
                        flexGrow: 1,
                    },
                }}
                leftSection={<DexFormItem
                    context={context}
                    species={species}
                    form={formIndex}
                    genders={[]}
                    isSeen={dexData?.isSeen}
                    isCaught={dexData?.isCaught}
                    isOwned={dexData?.isOwned}
                    isOwnedShiny={dexData?.isOwnedShiny}
                    isSeenAlpha={dexData?.isSeenAlpha}
                    isSeenShiny={dexData?.isSeenShiny}
                />}
            >
                <Stack align='flex-start' gap='sm' py='sm' style={{ flexGrow: 1 }}>
                    <span>{label}</span>

                    {triggers.length > 0 && <>
                        {triggers.map((triggerData, i) => {
                            return <React.Fragment key={i}>
                                {i > 0 && <Divider w='100%' />}

                                <DexEvolutionTriggerLine context={context} {...triggerData} />
                            </React.Fragment>;
                        })}
                    </>}
                </Stack>
            </UIButton>
        </Box>
    );
};

import { Box, Divider, Stack, type RenderTreeNodePayload, type TreeNodeData } from '@mantine/core';
import React from 'react';
import { useDexGetAll } from '../../../../data/sdk/dex/dex.gen';
import type { EntityContext, TriggerData } from '../../../../data/sdk/model';
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

export type DexEvolutionLeafProps = TreeNodeDataRich & {
    saveId: number;
    context: EntityContext;
    selected: boolean;
    onSelect: (species: number, formIndex: number) => void;
} & RenderTreeNodePayload[ 'elementProps' ];

export const DexEvolutionLeaf: React.FC<DexEvolutionLeafProps> = ({ value, label, nodeProps, selected, onSelect, saveId, context, hasChildren, ...elementProps }) => {
    const { species, formIndex, triggers = [] } = nodeProps;

    const { t } = useTranslate();

    const dex = useDexGetAll();

    const dexData = dex.data?.data[ species ]?.[ saveId ]?.forms?.[ formIndex ];

    return (
        <Box {...elementProps}>
            <UIButton
                name={value}
                controlLabel={t('action.select')}
                onClick={() => onSelect(species, formIndex)}
                disabled={!dexData?.isSeen}
                variant='default'
                justify='flex-start'
                bd='none'
                w='100%'
                h='auto'
                px='sm'
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

                    {triggers.map((triggerData, i) => {
                        return <React.Fragment key={i}>
                            {i > 0 && <Divider w='100%' />}

                            <DexEvolutionTriggerLine {...triggerData} context={context} showContexts={triggers.length > 1} />
                        </React.Fragment>;
                    })}
                </Stack>
            </UIButton>
        </Box>
    );
};

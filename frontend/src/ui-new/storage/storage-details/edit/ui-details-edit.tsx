import { Group, InputWrapper, NumberInput, Slider, Stack, Text } from '@mantine/core';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { type EditPkmVariantPayload } from '../../../../data/sdk/model';
import { useTranslate } from '../../../../translate/i18n';
import { UIMultiSelect } from '../../../form/select/ui-multi-select';
import { UITextInput } from '../../../form/text-input/ui-text-input';
import { usePopover } from '../../../interaction/focus-controls/components/popover/hooks/use-popover';
import { UIFormCard } from '../../../popover/popover-card/ui-form-card';
import type { UIDetailsStatName } from '../content/stats/ui-details-stats-row';

type DataInput = EditPkmVariantPayload;

type UIDetailsEditProps = {
    defaultValues: DataInput;
    nicknameMaxLength: number;
    minEv: number;
    maxEv: number;
    availableMoves: number[];
    renderMoveItemPill: (move: number, onRemove?: () => void) => React.ReactNode;
    renderMoveItemOption: (move: number, selected: boolean, full: boolean) => React.ReactNode;
    onSubmit: (data: DataInput) => Promise<void>;
};

export const UIDetailsEdit: React.FC<UIDetailsEditProps> = ({
    defaultValues, nicknameMaxLength, minEv, maxEv, availableMoves, renderMoveItemPill, renderMoveItemOption, onSubmit: onSubmitRaw
}) => {
    const { t } = useTranslate();

    const popover = usePopover();

    const { register, handleSubmit, formState, setValue, control } = useForm({
        defaultValues,
    });
    const [ watchEvs, watchMoves ] = useWatch({ control, name: [ 'eVs', 'moves' ] });

    const totalEVs = defaultValues.eVs.reduce((acc, ev) => acc + ev, 0);
    const totalFormEVs = watchEvs.reduce((acc, ev) => acc + ev, 0);
    const remainingEVs = Math.max(totalEVs - totalFormEVs, 0);
    const formMaxValues = watchEvs.map(ev => Math.min(ev + remainingEVs, maxEv));

    const formDisabled = !formState.isValid || remainingEVs > 0;

    const onSubmit = handleSubmit(async (data) => {
        await onSubmitRaw(data);
        popover?.setOpened(false);
    });

    return <UIFormCard
        onSubmit={onSubmit}
        title={<>Edit {defaultValues.nickname}</>}
        disabled={formDisabled}
    >
        <Group align='flex-start'>
            <Stack>
                <UITextInput
                    {...register('nickname', {
                        setValueAs: value => value.trim(),
                        maxLength: nicknameMaxLength,
                    })}
                    label='Nickname'
                />

                <UIMultiSelect
                    name='moves'
                    controlLabel='Moves'
                    label='Moves'
                    value={watchMoves.map(String)}
                    onChange={value => {
                        if (value.length < 1 || value.length > 4)
                            return;

                        setValue('moves', value.map(Number));
                    }}
                    data={availableMoves.map(move => {
                        const selected = watchMoves.includes(move);
                        const full = watchMoves.length === 4;

                        return {
                            value: String(move),
                            label: '',
                            disabled: full && !selected,
                        };
                    })}
                    maxValues={4}
                    renderPill={({ option, onRemove }) => option && renderMoveItemPill(Number(option.value), onRemove)}
                    renderOption={({ option, checked = false }) => option && renderMoveItemOption(Number(option.value), checked, watchMoves.length === 4)}
                    searchable
                    maw={300}
                    comboboxProps={{ withinPortal: false, position: 'right-start', floatingHeight: "viewport" }}
                    floatingHeight="viewport"
                />
            </Stack>

            <InputWrapper
                label='EVs'
            >
                <Stack>
                    {([ 'hp', 'atk', 'def', 'spa', 'spd', 'spe' ] satisfies UIDetailsStatName[]).map((stat, i) => {
                        const value = watchEvs[ i ];
                        const commonParams = {
                            valueAsNumber: true,
                            min: minEv,
                            max: formMaxValues[ i ],
                            disabled: totalFormEVs === 0
                                || (remainingEVs === 0 && value === 0),
                        };
                        const commonProps = {
                            value,
                            onChange: (value: string | number) => setValue(`eVs.${i}`, Number(value)),
                            min: minEv,
                            max: formMaxValues[ i ],
                        };

                        return <Group key={stat}>
                            <Text miw={22}>{t(`details.stats.${stat}`)}</Text>
                            <Slider
                                {...register(`eVs.${i}`, commonParams)}
                                {...commonProps}
                                showLabelOnHover={false}
                                miw={50}
                                style={{ flexGrow: 1 }}
                            />
                            <NumberInput
                                {...register(`eVs.${i}`, commonParams)}
                                {...commonProps}
                                size='xs'
                                w='3.3rem'
                            />
                        </Group>;
                    })}

                    <Group>
                        <Text ml='auto'>
                            Remaining: {remainingEVs} / {totalEVs}
                        </Text>
                    </Group>
                </Stack>
            </InputWrapper>

        </Group>
    </UIFormCard>;
};

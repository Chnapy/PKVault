import { ListboxOption } from '@headlessui/react';
import React from 'react';
import { MoveCategory, type StaticMove } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';
import { SelectNumberInput } from '../input/select-input';
import { MoveItem } from '../move-item/move-item';
import { theme } from '../theme';
import { StorageDetailsForm } from './storage-details-form';

export type TextMovesProps = {
    ability: number;
    moves: number[];
    availableMoves: number[];
    generation: number;
    hiddenPowerType: number;
    hiddenPowerPower: number;
    hiddenPowerCategory: MoveCategory;
};

export const TextMoves: React.FC<TextMovesProps> = ({
    ability,
    moves,
    availableMoves: availableMovesRaw,
    generation,
    hiddenPowerType,
    hiddenPowerPower,
    hiddenPowerCategory,
}) => {
    const { t } = useTranslate();

    const { editMode, register, setValue, watch } = StorageDetailsForm.useContext();

    const staticData = useStaticData();

    const getStaticMove = React.useCallback((moveId: number): StaticMove => {
        const staticMove = staticData.moves[ moveId ];

        if (moveId === 237) {
            return {
                ...staticMove,
                dataUntilGeneration: [ {
                    untilGeneration: 99,
                    type: hiddenPowerType,
                    power: hiddenPowerPower,
                    category: hiddenPowerCategory,
                } ]
            };
        }

        return staticMove;
    }, [ hiddenPowerCategory, hiddenPowerPower, hiddenPowerType, staticData.moves ]);

    const formMoves = watch(`moves`);

    const availableMoves = React.useMemo(() => [ ...availableMovesRaw ]
        .sort((a, b) => {
            const sa = getStaticMove(a);
            const ga = sa.dataUntilGeneration.find(gen => gen.untilGeneration >= generation);
            const sb = getStaticMove(b);
            const gb = sb.dataUntilGeneration.find(gen => gen.untilGeneration >= generation);

            const typeDiff = (ga?.type ?? 0) - (gb?.type ?? 0);
            if (typeDiff !== 0) {
                return typeDiff;
            }

            const powerDiff = (ga?.power ?? 0) - (gb?.power ?? 0);
            return powerDiff;
        }), [ availableMovesRaw, generation, getStaticMove ]);

    return <>
        {ability > 0 && <>
            {t('details.ability')} <span style={{ color: theme.text.primary }}>{
                staticData.abilities[ ability ].name
            }</span>
            <br /><br />
        </>}

        <span style={{ color: theme.text.primary }}>{t('details.moves')}</span>
        <br />
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 4,
            }}
        >
            {editMode
                ? <>
                    {formMoves.map((move, i) => {

                        return <SelectNumberInput
                            key={i}
                            {...register(`moves.${i}`, { valueAsNumber: true })}
                            value={move}
                            onChange={value => {
                                setValue(`moves.${i}`, value)
                            }}
                            data={
                                availableMoves
                                    .map(move => {
                                        const staticMove = getStaticMove(move);
                                        const forGen = staticMove.dataUntilGeneration.find(gen => gen.untilGeneration >= generation);
                                        const disabled = formMoves.includes(move);

                                        return {
                                            value: move,
                                            option: forGen
                                                ? <MoveItem
                                                    name={staticMove.name}
                                                    type={forGen.type}
                                                    category={forGen.category}
                                                    damage={forGen.power}
                                                    clickable={!disabled}
                                                />
                                                : null,
                                            disabled,
                                        };
                                    })
                            }
                            renderOption={item => <ListboxOption
                                key={item.value}
                                value={item.value}
                                disabled={item.disabled}
                                style={item.disabled
                                    ? {
                                        opacity: 0.5,
                                        cursor: 'not-allowed'
                                    }
                                    : undefined
                                }
                            >
                                {item.option}
                            </ListboxOption>}
                            anchor='left'
                            bgColor='transparent'
                            style={{
                                color: theme.text.default,
                                borderColor: theme.border.default,
                                flex: '1 1 0',
                                minWidth: '35%'
                            }}
                        />;

                    })}
                </>
                : <>
                    {moves.map((move, i) => {
                        const staticMove = getStaticMove(move);
                        const forGen = staticMove.dataUntilGeneration.find(gen => gen.untilGeneration >= generation);

                        return forGen
                            ? <MoveItem
                                key={i}
                                name={staticMove.name}
                                type={forGen.type}
                                category={forGen.category}
                                damage={forGen.power}
                                style={{
                                    flex: '1 1 0',
                                    minWidth: '35%'
                                }}
                            />
                            : null;
                    })}
                </>}
        </div>
    </>;
};

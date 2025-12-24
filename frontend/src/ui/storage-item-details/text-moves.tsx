import { ListboxOption } from '@headlessui/react';
import React from 'react';
import { MoveCategory, type StaticMove } from '../../data/sdk/model';
import { useStorageGetPkmAvailableMoves } from '../../data/sdk/storage/storage.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';
import { Gauge } from '../gauge/gauge';
import { SelectNumberInput } from '../input/select-input';
import { MoveItem } from '../move-item/move-item';
import { theme } from '../theme';
import { StorageDetailsForm } from './storage-details-form';

export type TextMovesProps = {
    saveId?: number;
    pkmId: string;
    ability: number;
    moves: number[];
    movesLegality: boolean[];
    generation: number;
    hiddenPowerType: number;
    hiddenPowerPower: number;
    hiddenPowerCategory: MoveCategory;
    friendship: number;
};

export const TextMoves: React.FC<TextMovesProps> = ({
    saveId,
    pkmId,
    ability,
    moves,
    movesLegality,
    generation,
    hiddenPowerType,
    hiddenPowerPower,
    hiddenPowerCategory,
    friendship,
}) => {
    const { t } = useTranslate();

    const { editMode, register, setValue, watch } = StorageDetailsForm.useContext();

    const staticData = useStaticData();

    const availableMovesQuery = useStorageGetPkmAvailableMoves({ saveId, pkmId }, {
        query: { enabled: editMode }
    });

    const getStaticMove = React.useCallback((moveId: number): StaticMove | undefined => {
        const staticMove = staticData.moves[ moveId ];

        // hidden power
        if (moveId === 237) {
            return staticMove && {
                ...staticMove,
                dataUntilGeneration: [ {
                    untilGeneration: 99,
                    type: hiddenPowerType,
                    power: hiddenPowerPower,
                    category: hiddenPowerCategory,
                } ]
            };
        }
        // return
        else if (moveId === 216) {
            const returnPower = Number.parseInt((friendship / 2.5).toString());
            return staticMove && {
                ...staticMove,
                dataUntilGeneration: [ {
                    ...staticMove.dataUntilGeneration[ staticMove.dataUntilGeneration.length - 1 ]!,
                    untilGeneration: 99,
                    power: returnPower,
                } ]
            };
        }
        // frustration
        else if (moveId === 218) {
            const frustrationPower = Number.parseInt(((255 - friendship) / 2.5).toString());
            return staticMove && {
                ...staticMove,
                dataUntilGeneration: [ {
                    ...staticMove.dataUntilGeneration[ staticMove.dataUntilGeneration.length - 1 ]!,
                    untilGeneration: 99,
                    power: frustrationPower,
                } ]
            };
        }

        return staticMove;
    }, [ friendship, hiddenPowerCategory, hiddenPowerPower, hiddenPowerType, staticData.moves ]);

    const formMoves = watch(`moves`);

    const availableMoves = React.useMemo(() => (Array.isArray(availableMovesQuery.data?.data) ? availableMovesQuery.data.data : [])
        .map(move => move.id)
        .sort((a, b) => {
            const sa = getStaticMove(a);
            const ga = sa?.dataUntilGeneration.find(gen => gen.untilGeneration >= generation);
            const sb = getStaticMove(b);
            const gb = sb?.dataUntilGeneration.find(gen => gen.untilGeneration >= generation);

            const typeDiff = (ga?.type ?? 0) - (gb?.type ?? 0);
            if (typeDiff !== 0) {
                return typeDiff;
            }

            const powerDiff = (ga?.power ?? 0) - (gb?.power ?? 0);
            return powerDiff;
        }), [ availableMovesQuery.data?.data, generation, getStaticMove ]);

    // in edit-mode remove invalid moves
    React.useEffect(() => {
        if (editMode && availableMoves.length > 0) {
            const fixedMoves = formMoves.map(move => availableMoves.some(moveId => moveId === move) ? move : 0);
            if (fixedMoves.join('.') !== formMoves.join('.')) {
                setValue('moves', fixedMoves);
            }
        }
    }, [ availableMoves, editMode, formMoves, setValue ]);

    return <>
        {ability > 0 && <>
            {t('details.ability')} <span style={{ color: theme.text.primary }}>{
                staticData.abilities[ ability ]?.name
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
                paddingBottom: 14,
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
                                        const forGen = staticMove?.dataUntilGeneration.find(gen => gen.untilGeneration >= generation);
                                        const disabled = formMoves.includes(move);

                                        return {
                                            value: move,
                                            option: forGen
                                                ? <MoveItem
                                                    name={staticMove?.name ?? ''}
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
                        const forGen = staticMove?.dataUntilGeneration.find(gen => gen.untilGeneration >= generation);

                        return forGen
                            ? <MoveItem
                                key={i}
                                name={staticMove?.name ?? ''}
                                type={forGen.type}
                                category={forGen.category}
                                damage={forGen.power}
                                isValid={movesLegality[ i ]}
                                style={{
                                    flex: '1 1 0',
                                    minWidth: '35%'
                                }}
                            />
                            : null;
                    })}
                </>}
        </div>
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
            }}
        >
            {t('details.friendship')}

            <Gauge value={friendship / 255} />

            {friendship}
        </div>
    </>;
};
